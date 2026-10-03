import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  increment,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import {
  KnowledgeEntry,
  KnowledgeEntryVersion,
  KnowledgeChunk,
  KnowledgeCategory,
  KnowledgeLanguage,
  KnowledgeStatus,
  AiQuestionLog,
  VectorSearchResult,
} from "./types";
import { chunkKnowledgeText } from "./chunker";
import { getEmbeddingProvider } from "./embedding-provider";
import { getVectorStore, cosineSimilarity, InMemoryCosineVectorStore } from "./vector-store";
import { DistributedKnowledgeCache } from "./shared-ratelimit-cache";

const KB_META_DOC_ID = "knowledge_base_meta";

/**
 * Returns current global KB version number.
 */
export async function getGlobalKbVersion(orgId: string): Promise<number> {
  try {
    const metaRef = doc(db, "system", `${KB_META_DOC_ID}_${orgId}`);
    const snap = await getDoc(metaRef);
    if (snap.exists()) {
      return snap.data().version || 1;
    }
    // Initialize if not present
    await setDoc(metaRef, { version: 1, orgId, updatedAt: new Date().toISOString() });
    return 1;
  } catch (e) {
    console.warn("[getGlobalKbVersion] Notice:", e);
    return 1;
  }
}

/**
 * Bumps global KB version to invalidate distributed caches across all serverless instances.
 */
export async function bumpGlobalKbVersion(orgId: string): Promise<number> {
  const metaRef = doc(db, "system", `${KB_META_DOC_ID}_${orgId}`);
  try {
    let newVer = 1;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(metaRef);
      if (!snap.exists()) {
        tx.set(metaRef, { version: 1, orgId, updatedAt: new Date().toISOString() });
        newVer = 1;
      } else {
        newVer = (snap.data().version || 1) + 1;
        tx.update(metaRef, { version: newVer, updatedAt: new Date().toISOString() });
      }
    });

    DistributedKnowledgeCache.invalidateL1();
    InMemoryCosineVectorStore.invalidateCache(orgId);
    return newVer;
  } catch (e) {
    console.warn("[bumpGlobalKbVersion] Notice:", e);
    return 1;
  }
}

/**
 * Saves or updates a draft knowledge entry.
 */
export async function saveDraftEntry(
  entryData: Partial<KnowledgeEntry> & { orgId: string; title: string; content: string; updatedBy: string }
): Promise<KnowledgeEntry> {
  const now = new Date().toISOString();
  const entryId = entryData.id || `kb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const entryRef = doc(db, "knowledgeEntries", entryId);

  const existingSnap = await getDoc(entryRef);
  if (existingSnap.exists()) {
    const existingOrgId = existingSnap.data().orgId;
    if (existingOrgId && existingOrgId !== entryData.orgId) {
      throw new Error(`Unauthorized: entry '${entryId}' belongs to another organization.`);
    }
  }
  const currentVersion = existingSnap.exists() ? (existingSnap.data().version || 1) : 1;

  const entry: KnowledgeEntry = {
    id: entryId,
    orgId: entryData.orgId,
    title: entryData.title.trim(),
    category: entryData.category || "general",
    content: entryData.content.trim(),
    language: entryData.language || "en",
    status: (entryData.status === "archived" ? "archived" : "draft") as KnowledgeStatus,
    appliesTo: entryData.appliesTo || { cities: ["all"], services: ["all"] },
    effectiveFrom: entryData.effectiveFrom || null,
    expiresAt: entryData.expiresAt || null,
    sourceUrl: entryData.sourceUrl || null,
    version: currentVersion,
    updatedBy: entryData.updatedBy,
    updatedAt: now,
    indexedVersion: existingSnap.exists() ? (existingSnap.data().indexedVersion || 0) : 0,
  };

  await setDoc(entryRef, entry);
  return entry;
}

/**
 * Staged Publishing Protocol:
 * 1. Entry status marked as "indexing".
 * 2. Save version history snapshot in subcollection /versions/{newVersion}.
 * 3. Chunk and embed content.
 * 4. Write new chunks to Firestore with status: "staged" and entryVersion: newVersion.
 * 5. In ONE atomic batched write (max 500 writes):
 *    - Flip all staged chunks for (entryId, newVersion) to status: "published"
 *    - Delete all old chunks for (entryId, oldVersion)
 *    - Update entry: status = "published", version = newVersion, indexedVersion = newVersion
 * 6. Bump global KB version.
 */
export async function publishEntryStaged(
  entryId: string,
  orgId: string,
  publishedBy: string
): Promise<KnowledgeEntry> {
  const entryRef = doc(db, "knowledgeEntries", entryId);
  const snap = await getDoc(entryRef);

  if (!snap.exists()) {
    throw new Error(`Knowledge entry '${entryId}' not found.`);
  }

  const existing = snap.data() as KnowledgeEntry;
  if (existing.orgId !== orgId) {
    throw new Error(`Unauthorized: entry does not belong to organization '${orgId}'.`);
  }

  const newVersion = (existing.version || 1) + 1;
  const now = new Date().toISOString();

  // 1. Mark as indexing
  await updateDoc(entryRef, {
    status: "indexing",
    updatedBy: publishedBy,
    updatedAt: now,
  });

  // 2. Save version snapshot
  const versionRef = doc(db, "knowledgeEntries", entryId, "versions", newVersion.toString());
  const versionData: KnowledgeEntryVersion = {
    version: newVersion,
    title: existing.title,
    category: existing.category,
    content: existing.content,
    language: existing.language,
    status: "published",
    appliesTo: existing.appliesTo,
    effectiveFrom: existing.effectiveFrom,
    expiresAt: existing.expiresAt,
    sourceUrl: existing.sourceUrl,
    savedBy: publishedBy,
    savedAt: now,
  };
  await setDoc(versionRef, versionData);

  // 3. Chunk text (~150-300 words with title prepending)
  const rawChunks = chunkKnowledgeText(existing.title, existing.content);
  if (rawChunks.length === 0) {
    throw new Error("Cannot publish empty knowledge content.");
  }

  // 4. Embed chunks using standard multilingual-e5-small
  const embeddingProvider = getEmbeddingProvider();
  const chunkTexts = rawChunks.map((rc) => rc.text);
  const vectors = await embeddingProvider.embedBatchPassages(chunkTexts);

  const stagedChunks: KnowledgeChunk[] = rawChunks.map((rc, idx) => ({
    id: `chunk_${entryId}_v${newVersion}_${rc.chunkIndex}`,
    orgId,
    entryId,
    entryVersion: newVersion,
    chunkIndex: rc.chunkIndex,
    title: existing.title,
    text: rc.text,
    language: existing.language,
    category: existing.category,
    appliesTo: existing.appliesTo,
    status: "staged" as const, // STAGED
    effectiveFrom: existing.effectiveFrom,
    expiresAt: existing.expiresAt,
    sourceUrl: existing.sourceUrl,
    embedding: vectors[idx],
    embeddingModel: "multilingual-e5-small",
  }));

  // Write staged chunks in batches
  const BATCH_SIZE = 450;
  for (let i = 0; i < stagedChunks.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const slice = stagedChunks.slice(i, i + BATCH_SIZE);
    for (const chunk of slice) {
      batch.set(doc(db, "knowledgeChunks", chunk.id), chunk);
    }
    await batch.commit();
  }

  // 5. Atomic Flip: Query old chunks to delete
  const oldChunksQuery = query(
    collection(db, "knowledgeChunks"),
    where("orgId", "==", orgId),
    where("entryId", "==", entryId),
    where("status", "==", "published")
  );
  const oldChunksSnap = await getDocs(oldChunksQuery);

  const flipBatch = writeBatch(db);

  // Delete all old chunks
  for (const oldDoc of oldChunksSnap.docs) {
    flipBatch.delete(oldDoc.ref);
  }

  // Flip staged chunks to published
  for (const stagedChunk of stagedChunks) {
    const chunkRef = doc(db, "knowledgeChunks", stagedChunk.id);
    flipBatch.update(chunkRef, { status: "published" });
  }

  // Update entry document
  flipBatch.update(entryRef, {
    status: "published",
    version: newVersion,
    indexedVersion: newVersion,
    updatedBy: publishedBy,
    updatedAt: now,
  });

  await flipBatch.commit();

  // 6. Bump global KB version and clear in-memory caches
  await bumpGlobalKbVersion(orgId);

  return {
    ...existing,
    status: "published",
    version: newVersion,
    indexedVersion: newVersion,
    updatedBy: publishedBy,
    updatedAt: now,
  };
}

/**
 * Archives an entry and purges its chunks.
 */
export async function archiveEntry(
  entryId: string,
  orgId: string,
  archivedBy: string
): Promise<void> {
  const entryRef = doc(db, "knowledgeEntries", entryId);
  const snap = await getDoc(entryRef);

  if (!snap.exists()) return;
  const existing = snap.data() as KnowledgeEntry;
  if (existing.orgId !== orgId) {
    throw new Error(`Unauthorized: entry does not belong to organization '${orgId}'.`);
  }

  const now = new Date().toISOString();
  await updateDoc(entryRef, {
    status: "archived",
    updatedBy: archivedBy,
    updatedAt: now,
  });

  // Delete all chunks for this entry
  const vectorStore = getVectorStore();
  await vectorStore.deleteChunksForEntry(orgId, entryId);

  // Bump global KB version
  await bumpGlobalKbVersion(orgId);
}

/**
 * Restores a historical version into a draft.
 */
export async function restoreEntryVersion(
  entryId: string,
  targetVersion: number,
  orgId: string,
  restoredBy: string
): Promise<KnowledgeEntry> {
  const versionRef = doc(db, "knowledgeEntries", entryId, "versions", targetVersion.toString());
  const versionSnap = await getDoc(versionRef);

  if (!versionSnap.exists()) {
    throw new Error(`Version ${targetVersion} does not exist for entry '${entryId}'.`);
  }

  const vData = versionSnap.data() as KnowledgeEntryVersion;
  return saveDraftEntry({
    id: entryId,
    orgId,
    title: vData.title,
    category: vData.category,
    content: vData.content,
    language: vData.language,
    status: "draft",
    appliesTo: vData.appliesTo,
    effectiveFrom: vData.effectiveFrom,
    expiresAt: vData.expiresAt,
    sourceUrl: vData.sourceUrl,
    updatedBy: restoredBy,
  });
}

/**
 * Dry-run Draft Test Question
 * Embeds draft in memory ONLY. Never writes draft chunks to knowledgeChunks.
 */
export async function testDraftQuestion(
  draftTitle: string,
  draftContent: string,
  testQuestion: string
): Promise<{
  score: number;
  bestChunkText: string;
  simulatedAnswer: string;
}> {
  const embeddingProvider = getEmbeddingProvider();

  // 1. Chunk in memory
  const rawChunks = chunkKnowledgeText(draftTitle, draftContent);
  if (rawChunks.length === 0) {
    return { score: 0, bestChunkText: "", simulatedAnswer: "Draft content is empty." };
  }

  // 2. Embed draft chunks in memory
  const chunkTexts = rawChunks.map((c) => c.text);
  const chunkVectors = await embeddingProvider.embedBatchPassages(chunkTexts);

  // 3. Embed question in memory
  const queryVector = await embeddingProvider.embedQuery(testQuestion);

  // 4. Calculate cosine similarity against all draft chunks
  let bestScore = -1;
  let bestChunk = rawChunks[0].text;

  for (let i = 0; i < chunkVectors.length; i++) {
    const score = cosineSimilarity(queryVector, chunkVectors[i]);
    if (score > bestScore) {
      bestScore = score;
      bestChunk = rawChunks[i].text;
    }
  }

  const cleanScore = Math.max(0, Number(bestScore.toFixed(4)));

  return {
    score: cleanScore,
    bestChunkText: bestChunk,
    simulatedAnswer:
      cleanScore >= 0.72
        ? `[Grounded from Draft]\n${bestChunk.replace(/\[Title:.*?\]\n?/, "")}`
        : "Below threshold (would trigger fallback to WhatsApp in production).",
  };
}

/**
 * Scheduled Janitor: Removes expired entries' chunks and sets their status to archived.
 * Protected with distributed lock.
 */
/**
 * Scheduled Janitor: Removes expired entries' chunks and sets their status to archived.
 * Protected with distributed lock using an atomic Firestore transaction.
 */
export async function cleanupExpiredEntries(orgId: string): Promise<{ cleanedCount: number }> {
  const lockRef = doc(db, "system", `lock_cleanup_${orgId}`);
  const nowMs = Date.now();
  const lockLeaseMs = 60 * 1000; // 60 seconds lease

  // Acquire lock atomically via Firestore transaction
  await runTransaction(db, async (tx) => {
    const lockSnap = await tx.get(lockRef);
    if (lockSnap.exists()) {
      const data = lockSnap.data();
      const lockExpiresAtMs = data.lockExpiresAt ? data.lockExpiresAt.toMillis() : new Date(data.lockedAt).getTime() + lockLeaseMs;
      if (nowMs < lockExpiresAtMs) {
        throw new Error(`Cleanup job is currently running by another process. Lock active until ${new Date(lockExpiresAtMs).toISOString()}`);
      }
    }
    tx.set(lockRef, {
      lockedAt: Timestamp.fromMillis(nowMs),
      lockExpiresAt: Timestamp.fromMillis(nowMs + lockLeaseMs),
    });
  });

  try {
    const nowIso = new Date(nowMs).toISOString();
    const q = query(
      collection(db, "knowledgeEntries"),
      where("orgId", "==", orgId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);

    let cleanedCount = 0;
    const vectorStore = getVectorStore();

    for (const d of snap.docs) {
      const entry = d.data() as KnowledgeEntry;
      if (entry.expiresAt && entry.expiresAt < nowIso) {
        await updateDoc(d.ref, {
          status: "archived",
          updatedAt: nowIso,
          updatedBy: "system_expiry_scheduler",
        });
        await vectorStore.deleteChunksForEntry(orgId, entry.id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      await bumpGlobalKbVersion(orgId);
    }

    return { cleanedCount };
  } finally {
    await deleteDoc(lockRef).catch(() => {});
  }
}

/**
 * Re-indexes all published entries under the current embedding model.
 * Protected with distributed lock acquired atomically via Firestore transaction.
 */
export async function reindexAllPublished(orgId: string, initiatedBy: string): Promise<{ reindexedCount: number }> {
  const lockRef = doc(db, "system", `lock_reindex_${orgId}`);
  const nowMs = Date.now();
  const lockLeaseMs = 5 * 60 * 1000; // 5 minutes lease

  // Check and acquire lock atomically
  await runTransaction(db, async (tx) => {
    const lockSnap = await tx.get(lockRef);
    if (lockSnap.exists()) {
      const data = lockSnap.data();
      const lockExpiresAtMs = data.lockExpiresAt ? data.lockExpiresAt.toMillis() : new Date(data.lockedAt).getTime() + lockLeaseMs;
      if (nowMs < lockExpiresAtMs) {
        throw new Error(`Re-index job is currently in progress. Lock active until ${new Date(lockExpiresAtMs).toISOString()}`);
      }
    }
    tx.set(lockRef, {
      lockedAt: Timestamp.fromMillis(nowMs),
      lockExpiresAt: Timestamp.fromMillis(nowMs + lockLeaseMs),
      initiatedBy,
    });
  });

  try {
    const q = query(
      collection(db, "knowledgeEntries"),
      where("orgId", "==", orgId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);

    let count = 0;
    for (const d of snap.docs) {
      await publishEntryStaged(d.id, orgId, initiatedBy);
      count++;
    }

    return { reindexedCount: count };
  } finally {
    await deleteDoc(lockRef).catch(() => {});
  }
}

/**
 * Fallback Keyword Search over Published Entries
 * Used when the embedding service is temporarily unavailable or during network partitions.
 * Extracts keywords, ranks entries by title/content relevance, and returns the top matching entries.
 */
export async function keywordSearchPublishedEntries(
  orgId: string,
  queryText: string,
  limit: number = 3
): Promise<Array<{ entry: KnowledgeEntry; score: number }>> {
  const stopWords = new Set([
    "what", "is", "your", "the", "a", "an", "and", "or", "in", "on", "at", "for", "to",
    "kya", "hai", "ka", "ki", "ke", "mein", "par", "se", "ko", "aur", "ya", "hoga", "hogi"
  ]);

  const rawTokens = (queryText || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (rawTokens.length === 0) return [];

  const nowIso = new Date().toISOString();
  const q = query(
    collection(db, "knowledgeEntries"),
    where("orgId", "==", orgId),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);

  const scoredEntries: Array<{ entry: KnowledgeEntry; score: number }> = [];

  for (const d of snap.docs) {
    const entry = d.data() as KnowledgeEntry;
    if (entry.expiresAt && entry.expiresAt < nowIso) continue;
    if (entry.effectiveFrom && entry.effectiveFrom > nowIso) continue;

    const titleLower = (entry.title || "").toLowerCase();
    const contentLower = (entry.content || "").toLowerCase();

    let score = 0;
    for (const token of rawTokens) {
      if (titleLower.includes(token)) score += 3.0; // Higher weight for title matches
      if (contentLower.includes(token)) score += 1.0;
    }

    if (score > 0) {
      scoredEntries.push({ entry, score });
    }
  }

  scoredEntries.sort((a, b) => b.score - a.score);
  return scoredEntries.slice(0, limit);
}
