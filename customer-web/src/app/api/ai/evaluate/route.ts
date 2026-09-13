import { NextResponse } from "next/server";
import { runFullAiEvaluationSuite } from "../../../../lib/ai/evaluation/evaluation-runner";
import { db } from "../../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Run Evaluation Suite (POST)
export async function POST(req: Request) {
  try {
    const report = await runFullAiEvaluationSuite();

    // Persist report to Firestore analytics/aiSafety/latest and aiEvaluations/{suiteId}
    try {
      const latestRef = doc(db, "analytics", "aiSafety");
      await setDoc(latestRef, { latestReport: report, updatedAt: new Date().toISOString() });

      const suiteRef = doc(db, "aiEvaluations", report.suiteId);
      await setDoc(suiteRef, report);
    } catch (e) {
      console.warn("[API /api/ai/evaluate] Firestore report save fallback:", e);
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("[API /api/ai/evaluate] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute AI Evaluation Suite." },
      { status: 500 }
    );
  }
}

// Fetch Latest Evaluation Report & Health Status (GET)
export async function GET() {
  try {
    let report = null;
    try {
      const latestRef = doc(db, "analytics", "aiSafety");
      const snap = await getDoc(latestRef);
      if (snap.exists()) {
        report = snap.data().latestReport;
      }
    } catch (e) {
      // Fallback to running fresh suite
    }

    if (!report) {
      report = await runFullAiEvaluationSuite();
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("[API /api/ai/evaluate GET] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch AI Safety report." },
      { status: 500 }
    );
  }
}
