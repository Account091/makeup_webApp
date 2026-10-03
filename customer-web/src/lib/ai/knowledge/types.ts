export type KnowledgeCategory =
  | "packages"
  | "policy"
  | "faq"
  | "city"
  | "prep"
  | "general";

export type KnowledgeLanguage = "en" | "hi" | "both";

export type KnowledgeStatus = "draft" | "indexing" | "published" | "archived";

export type ChunkStatus = "staged" | "published";

export interface KnowledgeAppliesTo {
  cities?: string[];
  services?: string[];
}

export interface KnowledgeEntry {
  id: string;
  orgId: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  language: KnowledgeLanguage;
  status: KnowledgeStatus;
  appliesTo?: KnowledgeAppliesTo;
  effectiveFrom?: string | null;
  expiresAt?: string | null;
  sourceUrl?: string | null;
  version: number;
  updatedBy: string;
  updatedAt: string;
  indexedVersion: number;
}

export interface KnowledgeEntryVersion {
  version: number;
  title: string;
  category: KnowledgeCategory;
  content: string;
  language: KnowledgeLanguage;
  status: KnowledgeStatus;
  appliesTo?: KnowledgeAppliesTo;
  effectiveFrom?: string | null;
  expiresAt?: string | null;
  sourceUrl?: string | null;
  savedBy: string;
  savedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  orgId: string;
  entryId: string;
  entryVersion: number;
  chunkIndex: number;
  title: string;
  text: string;
  language: KnowledgeLanguage;
  category: KnowledgeCategory;
  appliesTo?: KnowledgeAppliesTo;
  status: ChunkStatus;
  effectiveFrom?: string | null;
  expiresAt?: string | null;
  sourceUrl?: string | null;
  embedding: number[];
  embeddingModel: "multilingual-e5-small";
}

export interface AiQuestionLog {
  id: string;
  orgId: string;
  scrubbedQuestion: string;
  matchedEntryIds: string[];
  topScore: number;
  outcome: "answered" | "fallback" | "tool_intercept";
  rating?: number | null;
  createdAt: string;
  purgeAt: any; // Firestore Timestamp (90 days TTL)
}

export interface AiTestQuestion {
  id: string;
  orgId: string;
  question: string;
  language: "en" | "hi" | "hinglish";
  expectedEntryTitleOrKeyword: string;
  expectedOutcome: "answered" | "fallback" | "tool_intercept";
  category?: KnowledgeCategory;
}

export interface KnowledgeCacheItem {
  hash: string;
  orgId: string;
  kbVersion: number;
  normalizedQuestion: string;
  answer: string;
  sources: Array<{ title: string; sourceUrl?: string | null }>;
  outcome: string;
  createdAt: string;
  purgeAt: any; // Firestore Timestamp (90 days TTL)
}

export interface EmbeddingProvider {
  readonly modelName: "multilingual-e5-small";
  readonly dimension: number;
  embedPassage(text: string): Promise<number[]>;
  embedQuery(text: string): Promise<number[]>;
  embedBatchPassages(texts: string[]): Promise<number[][]>;
}

export interface VectorSearchResult {
  chunk: KnowledgeChunk;
  score: number; // 0 to 1 cosine similarity
}

export interface VectorSearchOptions {
  orgId: string;
  topK?: number;
  minScore?: number;
  city?: string;
  language?: KnowledgeLanguage;
  nowIso?: string;
}

export interface VectorStore {
  search(queryVector: number[], options: VectorSearchOptions): Promise<VectorSearchResult[]>;
  indexChunks(chunks: KnowledgeChunk[]): Promise<void>;
  deleteChunksForEntry(orgId: string, entryId: string, versionToKeep?: number): Promise<void>;
}
