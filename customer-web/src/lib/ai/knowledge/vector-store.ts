import {
  KnowledgeChunk,
  VectorSearchResult,
  VectorSearchOptions,
  VectorStore,
} from "./types";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

/**
 * Calculates Cosine Similarity between two numeric vectors.
 * Assumes vectors may or may not be pre-normalized.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * In-Memory Cosine Vector Store
 * Caches published chunks in memory per org and KB version.
 * Works 100% reliably in local tests, emulator, and serverless environments.
 */
export class InMemoryCosineVectorStore implements VectorStore {
  private static chunkCache: Map<string, { chunks: KnowledgeChunk[]; kbVersion: number; loadedAt: number }> = new Map();

  async getPublishedChunks(orgId: string): Promise<KnowledgeChunk[]> {
    const cacheKey = `chunks_${orgId}`;
    const cached = InMemoryCosineVectorStore.chunkCache.get(cacheKey);

    // 1. Read single lightweight KB version doc (1 Firestore read)
    let currentKbVersion = 1;
    try {
      const metaRef = doc(db, "system", `knowledge_version_${orgId}`);
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        currentKbVersion = metaSnap.data().version || 1;
      }
    } catch (_) {
      // Offline fallback: keep cached version
    }

    // 2. Cache hit by version: 0 additional chunk reads!
    if (cached && cached.kbVersion === currentKbVersion) {
      return cached.chunks;
    }

    // 3. Version changed or cold instance: reload published chunks
    try {
      const q = query(
        collection(db, "knowledgeChunks"),
        where("orgId", "==", orgId),
        where("status", "==", "published")
      );
      const snap = await getDocs(q);
      const chunks: KnowledgeChunk[] = snap.docs.map((d) => d.data() as KnowledgeChunk);

      console.log(
        `[InMemoryCosineVectorStore] Version change (v${cached?.kbVersion ?? "cold"} -> v${currentKbVersion}): Reloaded ${chunks.length} published chunks from Firestore for orgId '${orgId}'.`
      );

      InMemoryCosineVectorStore.chunkCache.set(cacheKey, { chunks, kbVersion: currentKbVersion, loadedAt: Date.now() });
      return chunks;
    } catch (e) {
      console.warn("[InMemoryCosineVectorStore] Error loading chunks from Firestore:", e);
      return cached ? cached.chunks : [];
    }
  }

  static invalidateCache(orgId: string) {
    InMemoryCosineVectorStore.chunkCache.delete(`chunks_${orgId}`);
  }

  async search(
    queryVector: number[],
    options: VectorSearchOptions
  ): Promise<VectorSearchResult[]> {
    const { orgId, topK = 5, minScore = 0.0, city, nowIso = new Date().toISOString() } = options;
    const allChunks = await this.getPublishedChunks(orgId);

    const scored: VectorSearchResult[] = [];

    for (const chunk of allChunks) {
      // Must be published
      if (chunk.status !== "published") continue;

      // Expiry filter
      if (chunk.expiresAt && chunk.expiresAt < nowIso) continue;

      // EffectiveFrom filter
      if (chunk.effectiveFrom && chunk.effectiveFrom > nowIso) continue;

      // City filter (if entry specifies applicable cities, check match)
      if (
        city &&
        chunk.appliesTo?.cities &&
        chunk.appliesTo.cities.length > 0
      ) {
        const cityLower = city.toLowerCase();
        const appliesMatch = chunk.appliesTo.cities.some(
          (c) => c.toLowerCase() === cityLower || c.toLowerCase() === "all"
        );
        if (!appliesMatch) continue;
      }

      // Compute Cosine Similarity
      const score = cosineSimilarity(queryVector, chunk.embedding);
      if (score >= minScore) {
        scored.push({ chunk, score });
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  async indexChunks(chunks: KnowledgeChunk[]): Promise<void> {
    if (chunks.length === 0) return;
    const batch = writeBatch(db);

    for (const chunk of chunks) {
      const ref = doc(db, "knowledgeChunks", chunk.id);
      batch.set(ref, chunk);
    }

    await batch.commit();
    InMemoryCosineVectorStore.invalidateCache(chunks[0].orgId);
  }

  async deleteChunksForEntry(orgId: string, entryId: string, versionToKeep?: number): Promise<void> {
    try {
      const q = query(
        collection(db, "knowledgeChunks"),
        where("orgId", "==", orgId),
        where("entryId", "==", entryId)
      );
      const snap = await getDocs(q);

      if (snap.empty) return;

      const batch = writeBatch(db);
      let count = 0;

      for (const d of snap.docs) {
        const data = d.data() as KnowledgeChunk;
        if (versionToKeep !== undefined && data.entryVersion === versionToKeep) {
          continue;
        }
        batch.delete(d.ref);
        count++;
      }

      if (count > 0) {
        await batch.commit();
      }
      InMemoryCosineVectorStore.invalidateCache(orgId);
    } catch (e) {
      console.warn("[deleteChunksForEntry] Error:", e);
    }
  }
}

/**
 * Firestore findNearest Vector Store
 * Delegates to Firestore findNearest vector search when supported in production,
 * falling back gracefully to InMemoryCosineVectorStore when findNearest is not supported
 * (e.g. Firebase Local Emulator).
 */
export type VectorStoreMode = "firestore_findNearest" | "in_memory_fallback";

let activeVectorStoreMode: VectorStoreMode = "in_memory_fallback";
let lastFallbackWarning: string | null = null;

export function getVectorStoreStatus(): { mode: VectorStoreMode; warning: string | null } {
  return { mode: activeVectorStoreMode, warning: lastFallbackWarning };
}

export class FirestoreVectorStore implements VectorStore {
  private inMemoryFallback = new InMemoryCosineVectorStore();

  async search(
    queryVector: number[],
    options: VectorSearchOptions
  ): Promise<VectorSearchResult[]> {
    // Note for emulator: Firebase Local Emulator does NOT support vector findNearest.
    // In production with Firestore Vector Search enabled, we construct findNearest query.
    const colRef = collection(db, "knowledgeChunks") as any;

    if (typeof colRef.findNearest === "function") {
      try {
        const { orgId, topK = 5, nowIso = new Date().toISOString(), city } = options;

        // Pre-filter on equality
        const baseQuery = query(
          collection(db, "knowledgeChunks"),
          where("orgId", "==", orgId),
          where("status", "==", "published")
        );

        // Fetch extra candidates (topK * 2) to post-filter expiry and city in memory
        const vectorQuery = (baseQuery as any).findNearest("embedding", queryVector, {
          limit: topK * 2,
          distanceMeasure: "COSINE",
        });

        const snap = await getDocs(vectorQuery);
        const results: VectorSearchResult[] = [];

        for (const d of snap.docs) {
          const chunk = d.data() as KnowledgeChunk;

          if (chunk.expiresAt && chunk.expiresAt < nowIso) continue;
          if (chunk.effectiveFrom && chunk.effectiveFrom > nowIso) continue;
          if (city && chunk.appliesTo?.cities && chunk.appliesTo.cities.length > 0) {
            const match = chunk.appliesTo.cities.some(
              (c) => c.toLowerCase() === city.toLowerCase() || c.toLowerCase() === "all"
            );
            if (!match) continue;
          }

          // In Firestore findNearest, score = 1 - cosineDistance
          const distance = (d as any).distance ?? 0;
          const score = 1 - distance;

          results.push({ chunk, score });
          if (results.length >= topK) break;
        }

        activeVectorStoreMode = "firestore_findNearest";
        lastFallbackWarning = null;
        return results;
      } catch (err) {
        lastFallbackWarning = `findNearest query failed: ${err instanceof Error ? err.message : String(err)}`;
        console.warn(`[FirestoreVectorStore] WARNING: ${lastFallbackWarning}. Falling back to in-memory cosine store.`);
      }
    } else {
      lastFallbackWarning = "findNearest is not available in current environment; using in-memory cosine vector store.";
      console.warn(`[FirestoreVectorStore] WARNING: ${lastFallbackWarning}`);
    }

    activeVectorStoreMode = "in_memory_fallback";
    return this.inMemoryFallback.search(queryVector, options);
  }

  async indexChunks(chunks: KnowledgeChunk[]): Promise<void> {
    return this.inMemoryFallback.indexChunks(chunks);
  }

  async deleteChunksForEntry(orgId: string, entryId: string, versionToKeep?: number): Promise<void> {
    return this.inMemoryFallback.deleteChunksForEntry(orgId, entryId, versionToKeep);
  }
}

let activeVectorStore: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (!activeVectorStore) {
    activeVectorStore = new FirestoreVectorStore();
  }
  return activeVectorStore;
}
