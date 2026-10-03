import { db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc, increment, Timestamp } from "firebase/firestore";
import { KnowledgeCacheItem } from "./types";

/**
 * Sharded Sliding-Window Rate Limiter
 * Shards counters across N shards to prevent Firestore single-document contention,
 * with in-memory short-circuit for high-frequency bursts.
 */
const NUM_SHARDS = 5;
const IN_MEMORY_BURST_CACHE = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 25; // 25 requests per minute

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  identifier: string, // IP or UID
  orgId: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowKey = Math.floor(now / WINDOW_MS);
  const cacheKey = `${orgId}_${identifier}_${windowKey}`;

  // 1. Fast in-memory burst check
  const mem = IN_MEMORY_BURST_CACHE.get(cacheKey);
  if (mem && mem.count >= MAX_REQUESTS_PER_WINDOW) {
    const elapsedInWindow = now - mem.windowStart;
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - elapsedInWindow) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  // Update in-memory counter
  if (mem) {
    mem.count++;
  } else {
    IN_MEMORY_BURST_CACHE.set(cacheKey, { count: 1, windowStart: now });
  }

  // Clean old window in-memory keys
  if (IN_MEMORY_BURST_CACHE.size > 2000) {
    IN_MEMORY_BURST_CACHE.forEach((v, k) => {
      if (now - v.windowStart > WINDOW_MS * 2) {
        IN_MEMORY_BURST_CACHE.delete(k);
      }
    });
  }

  // 2. Sharded Firestore persistence (1 write per shard)
  const shardId = Math.floor(Math.random() * NUM_SHARDS);
  const shardDocId = `rate_${orgId}_${identifier}_w${windowKey}_s${shardId}`;
  const shardRef = doc(db, "aiRateLimits", shardDocId);

  try {
    const purgeDate = Timestamp.fromDate(new Date(now + 24 * 60 * 60 * 1000)); // 24-hour cleanup
    await setDoc(
      shardRef,
      {
        orgId,
        identifier,
        windowKey,
        count: increment(1),
        purgeAt: purgeDate,
      },
      { merge: true }
    );
  } catch (e) {
    // Non-blocking fallback to in-memory counter on transient db error
    console.warn("[RateLimiter] Shard write notice:", e);
  }

  const currentCount = mem ? mem.count : 1;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - currentCount);

  return { allowed: true, remaining };
}

/**
 * Normalizes question for caching: lowercase, trims, removes punctuation
 */
export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/gi, "") // Preserves Devanagari & alphanumeric
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes deterministic hash for question string
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Distributed Serverless Knowledge Cache
 * Keyed by: hash(normalizedQuestion) + "_" + kbVersion + "_" + orgId
 * Uses purgeAt (90 days TTL) for automated Firestore TTL eviction.
 */
export class DistributedKnowledgeCache {
  private static localL1Cache = new Map<string, { item: KnowledgeCacheItem; loadedAt: number }>();
  private static L1_TTL_MS = 15 * 1000; // 15 seconds local L1 TTL

  static buildKey(orgId: string, kbVersion: number, normalizedQ: string): string {
    const qHash = hashString(normalizedQ);
    return `${orgId}_v${kbVersion}_${qHash}`;
  }

  static async get(
    orgId: string,
    kbVersion: number,
    question: string
  ): Promise<KnowledgeCacheItem | null> {
    const norm = normalizeQuestion(question);
    const key = this.buildKey(orgId, kbVersion, norm);
    const now = Date.now();

    // Check L1
    const l1 = this.localL1Cache.get(key);
    if (l1 && now - l1.loadedAt < this.L1_TTL_MS) {
      return l1.item;
    }

    // Check Firestore
    try {
      const snap = await getDoc(doc(db, "knowledgeCache", key));
      if (!snap.exists()) return null;

      const item = snap.data() as KnowledgeCacheItem;
      this.localL1Cache.set(key, { item, loadedAt: now });
      return item;
    } catch (e) {
      console.warn("[KnowledgeCache] Cache get error:", e);
      return null;
    }
  }

  static async set(
    orgId: string,
    kbVersion: number,
    question: string,
    answer: string,
    sources: Array<{ title: string; sourceUrl?: string | null }>,
    outcome: string
  ): Promise<void> {
    const norm = normalizeQuestion(question);
    const key = this.buildKey(orgId, kbVersion, norm);
    const now = Date.now();
    const purgeDate = Timestamp.fromDate(new Date(now + 90 * 24 * 60 * 60 * 1000)); // 90 days TTL (Firestore Timestamp)

    const item: KnowledgeCacheItem = {
      hash: key,
      orgId,
      kbVersion,
      normalizedQuestion: norm,
      answer,
      sources,
      outcome,
      createdAt: new Date(now).toISOString(),
      purgeAt: purgeDate,
    };

    // Set L1
    this.localL1Cache.set(key, { item, loadedAt: now });

    // Set Firestore
    try {
      await setDoc(doc(db, "knowledgeCache", key), item);
    } catch (e) {
      console.warn("[KnowledgeCache] Cache set error:", e);
    }
  }

  static invalidateL1(): void {
    this.localL1Cache.clear();
  }
}
