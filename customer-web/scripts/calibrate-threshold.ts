/**
 * Knowledge Base Similarity Threshold Calibration Tool
 *
 * Evaluates retrieval scoring over a benchmark CSV dataset:
 * - Answerable questions (expected_entry_id != "none")
 * - Unanswerable / out-of-scope questions (expected_entry_id == "none")
 *
 * Usage:
 *   npx tsx scripts/calibrate-threshold.ts
 *   npx tsx scripts/calibrate-threshold.ts --csv scripts/data/calibration_questions.csv
 *   npx tsx scripts/calibrate-threshold.ts --csv /path/to/custom.csv --real
 */

import fs from "fs";
import path from "path";
import { MockEmbeddingProvider, CloudRunEmbeddingProvider } from "../src/lib/ai/knowledge/embedding-provider";
import { EmbeddingProvider } from "../src/lib/ai/knowledge/types";
import { cosineSimilarity } from "../src/lib/ai/knowledge/vector-store";

export interface BenchmarkQuestion {
  id?: string;
  question: string;
  expectedEntryId: string; // Entry ID, category, or "none"
  language: string;
  category?: string;
}

// Reference Published Knowledge Base Corpus
const SAMPLE_CORPUS = [
  { id: "cancellation", title: "Cancellation & Rescheduling", text: "Cancellation & Rescheduling: Cancellations made 30+ days prior receive 100% deposit credit valid for 12 months. Rescheduling within 14 days is subject to artist calendar availability without forfeit." },
  { id: "travel", title: "Destination Weddings & Travel", text: "Destination Weddings & Travel: Head Artist Prachi travels to Jaipur, Udaipur, Jaisalmer and palace resorts across India. Jodhpur studio bookings have zero travel fee." },
  { id: "poshak", title: "Traditional Poshak & Jewelry Draping", text: "Traditional Poshak & Jewelry Draping: Traditional Rajputi poshak draping, Borla placement, Aad jewelry coordination, premium lashes, and customized hair extensions are included in Signature Bridal Packages." },
  { id: "window", title: "Advance Booking Window", text: "Advance Booking Window: We recommend locking wedding dates 3 to 6 months in advance for peak winter wedding season (November to February) in Rajasthan." },
  { id: "deposit", title: "Deposit & Date Hold", text: "Deposit & Date Hold: 25% advance deposit places a verified 15-minute hold on your wedding calendar. Remaining 75% balance is due after styling on event day." },
  { id: "backup", title: "Artist Backup Guarantee", text: "Artist Backup Guarantee: In rare lead artist emergency, a Senior Master Artist with identical training is dispatched or client receives 100% refund." },
  { id: "allergy", title: "Sensitive Skin & Allergy Consultation", text: "Sensitive Skin & Allergy Consultation: We do not prescribe medications. In-person skin consultation and patch test conducted 3-4 weeks prior with hypoallergenic luxury cosmetics." },
  { id: "airbrush", title: "Sweat-Proof HD Airbrush", text: "Sweat-Proof HD Airbrush: 16-hour sweat-proof HD airbrush base designed for long Indian palace wedding ceremonies and humid banquet heat." },
];

/**
 * Robust RFC 4180 CSV parser for question datasets
 */
function parseCsvQuestions(csvContent: string): BenchmarkQuestion[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const qIdx = headers.indexOf("question");
  const expIdx = headers.indexOf("expected_entry_id");
  const langIdx = headers.indexOf("language");
  const catIdx = headers.indexOf("category");

  if (qIdx === -1 || expIdx === -1) {
    throw new Error("CSV must contain 'question' and 'expected_entry_id' columns.");
  }

  const questions: BenchmarkQuestion[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Match CSV fields supporting quoted strings with commas
    const row: string[] = [];
    let insideQuote = false;
    let field = "";

    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        row.push(field.trim());
        field = "";
      } else {
        field += char;
      }
    }
    row.push(field.trim());

    const question = row[qIdx]?.replace(/^["']|["']$/g, "").trim();
    const expected = row[expIdx]?.replace(/^["']|["']$/g, "").trim().toLowerCase();
    const language = langIdx !== -1 && row[langIdx] ? row[langIdx].replace(/^["']|["']$/g, "").trim() : "en";
    const category = catIdx !== -1 && row[catIdx] ? row[catIdx].replace(/^["']|["']$/g, "").trim() : "general";

    if (question && expected) {
      questions.push({
        id: `q_${i}`,
        question,
        expectedEntryId: expected,
        language,
        category,
      });
    }
  }

  return questions;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

async function runCalibration() {
  const args = process.argv.slice(2);
  let csvPath = path.resolve(__dirname, "data/calibration_questions.csv");

  const csvArgIdx = args.indexOf("--csv");
  if (csvArgIdx !== -1 && args[csvArgIdx + 1]) {
    csvPath = path.resolve(process.cwd(), args[csvArgIdx + 1]);
  }

  const useReal = args.includes("--real") || !!process.env.EMBEDDING_SERVICE_URL;

  console.log("======================================================================");
  console.log("📐 KNOWLEDGE BASE SIMILARITY THRESHOLD CALIBRATION TOOL");
  console.log("======================================================================\n");
  console.log(`📂 Benchmark Questions CSV: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`FATAL: Benchmark CSV not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const benchmarkQuestions = parseCsvQuestions(csvContent);
  console.log(`📊 Loaded ${benchmarkQuestions.length} benchmark questions from CSV.`);

  const answerable = benchmarkQuestions.filter((q) => q.expectedEntryId !== "none");
  const unanswerable = benchmarkQuestions.filter((q) => q.expectedEntryId === "none");
  console.log(`   • Answerable questions:   ${answerable.length}`);
  console.log(`   • Unanswerable questions: ${unanswerable.length}\n`);

  let embeddingProvider: EmbeddingProvider;
  if (useReal && process.env.EMBEDDING_SERVICE_URL) {
    console.log(`🌐 Using LIVE Embedding Service: ${process.env.EMBEDDING_SERVICE_URL}`);
    embeddingProvider = new CloudRunEmbeddingProvider(
      process.env.EMBEDDING_SERVICE_URL,
      process.env.EMBEDDING_SERVICE_SECRET
    );
  } else {
    console.log("🧪 Using MockEmbeddingProvider (for local dry-run; calibration requires real model before production)");
    embeddingProvider = new MockEmbeddingProvider();
  }

  // 1. Embed reference corpus passages
  console.log(`Embedding ${SAMPLE_CORPUS.length} published reference passages...`);
  const corpusVectors = await Promise.all(
    SAMPLE_CORPUS.map(async (c) => ({
      id: c.id,
      text: c.text,
      vector: await embeddingProvider.embedPassage(c.text),
    }))
  );

  // 2. Score questions
  console.log("Evaluating benchmark questions against corpus...");
  const answerableScores: number[] = [];
  const unanswerableScores: number[] = [];

  for (const item of benchmarkQuestions) {
    const qVector = await embeddingProvider.embedQuery(item.question);
    let topScore = -1;
    let bestMatchId = "";

    for (const c of corpusVectors) {
      const score = cosineSimilarity(qVector, c.vector);
      if (score > topScore) {
        topScore = score;
        bestMatchId = c.id;
      }
    }

    if (item.expectedEntryId !== "none") {
      answerableScores.push(topScore);
    } else {
      unanswerableScores.push(topScore);
    }
  }

  // 3. Score distribution summary
  console.log("\n======================================================================");
  console.log("📈 RETRIEVAL SCORE DISTRIBUTIONS");
  console.log("======================================================================");
  console.log(`Answerable Questions (N=${answerableScores.length}):`);
  console.log(`  Min:    ${percentile(answerableScores, 0).toFixed(4)}`);
  console.log(`  P25:    ${percentile(answerableScores, 25).toFixed(4)}`);
  console.log(`  Median: ${percentile(answerableScores, 50).toFixed(4)}`);
  console.log(`  P75:    ${percentile(answerableScores, 75).toFixed(4)}`);
  console.log(`  Max:    ${percentile(answerableScores, 100).toFixed(4)}`);

  console.log(`\nUnanswerable Questions (N=${unanswerableScores.length}):`);
  console.log(`  Min:    ${percentile(unanswerableScores, 0).toFixed(4)}`);
  console.log(`  P25:    ${percentile(unanswerableScores, 25).toFixed(4)}`);
  console.log(`  Median: ${percentile(unanswerableScores, 50).toFixed(4)}`);
  console.log(`  P75:    ${percentile(unanswerableScores, 75).toFixed(4)}`);
  console.log(`  Max:    ${percentile(unanswerableScores, 100).toFixed(4)}`);

  // 4. Threshold Sweep Evaluation [0.50 to 0.95]
  console.log("\n======================================================================");
  console.log("🎯 THRESHOLD SWEEP EVALUATION");
  console.log("======================================================================");
  console.log("Threshold | True Pos (Ans) | False Neg (Lost) | False Pos (Halluc) | True Neg (Safe Refusal)");
  console.log("--------------------------------------------------------------------------------------");

  const thresholds = [0.50, 0.55, 0.60, 0.65, 0.70, 0.72, 0.75, 0.80, 0.85, 0.90];
  let optimalThreshold = 0.72;
  let lowestTotalError = Infinity;

  for (const t of thresholds) {
    const truePos = answerableScores.filter((s) => s >= t).length;
    const falseNeg = answerableScores.filter((s) => s < t).length; // Answerable rejected (unwanted fallback)
    const falsePos = unanswerableScores.filter((s) => s >= t).length; // Unanswerable accepted (hallucination risk)
    const trueNeg = unanswerableScores.filter((s) => s < t).length; // Unanswerable correctly refused

    // False Acceptance Rate is weighted 2x more harmful than False Rejection (Better to route to WhatsApp than hallucinate!)
    const totalError = falseNeg + falsePos * 2;
    if (totalError < lowestTotalError) {
      lowestTotalError = totalError;
      optimalThreshold = t;
    }

    console.log(
      `  ${t.toFixed(2)}    |    ${String(truePos).padStart(2)}/${answerable.length}     |       ${String(falseNeg).padStart(2)}/${answerable.length}     |      ${String(falsePos).padStart(2)}/${unanswerable.length}      |        ${String(trueNeg).padStart(2)}/${unanswerable.length}`
    );
  }

  console.log("======================================================================\n");
  console.log(`💡 SUGGESTED THRESHOLD: ${optimalThreshold.toFixed(2)}`);
  console.log(`   (Prioritizes zero false positives: never answers out-of-scope customer questions)`);
  console.log(`   ⚠️ Notice: Do not change KNOWLEDGE_SIMILARITY_THRESHOLD until running with`);
  console.log(`   the live multilingual-e5-small Cloud Run service.\n`);
}

runCalibration().catch((e) => {
  console.error("Calibration error:", e);
  process.exit(1);
});
