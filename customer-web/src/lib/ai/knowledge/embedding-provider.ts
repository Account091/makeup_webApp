import { EmbeddingProvider } from "./types";

const DIMENSION = 384;
const MODEL_NAME = "multilingual-e5-small" as const;

/**
 * Deterministic Mock Embedding Provider
 * Generates unit-normalized 384-dimensional vectors based on sub-word hashes.
 * Allows full offline unit and emulator testing with realistic cosine similarities
 * without requiring live Cloud Run or external network dependencies.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = MODEL_NAME;
  readonly dimension = DIMENSION;

  private generateVector(text: string): number[] {
    const cleanText = text.toLowerCase().trim();
    const vec = new Array(DIMENSION).fill(0);

    // Hash tokens and character bigrams into vector coordinates
    const tokens = cleanText.split(/\s+/);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let hash = 5381;
      for (let j = 0; j < token.length; j++) {
        hash = (hash * 33) ^ token.charCodeAt(j);
      }
      const idx = Math.abs(hash) % DIMENSION;
      const weight = 1.0 + (tokens.length - i) / tokens.length;
      vec[idx] += weight;

      // Also map bigrams for morphological matching (helpful for Hindi / Hinglish stems)
      if (token.length >= 3) {
        for (let b = 0; b < token.length - 1; b++) {
          const bHash = (token.charCodeAt(b) * 31 + token.charCodeAt(b + 1)) % DIMENSION;
          vec[bHash] += 0.3;
        }
      }
    }

    // Normalize to unit length (L2 norm = 1.0)
    let norm = 0;
    for (let i = 0; i < DIMENSION; i++) {
      norm += vec[i] * vec[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < DIMENSION; i++) {
        vec[i] = Number((vec[i] / norm).toFixed(6));
      }
    } else {
      vec[0] = 1.0;
    }

    return vec;
  }

  async embedPassage(text: string): Promise<number[]> {
    // E5 format requires "passage: " prefix
    return this.generateVector(`passage: ${text}`);
  }

  async embedQuery(text: string): Promise<number[]> {
    // E5 format requires "query: " prefix
    return this.generateVector(`query: ${text}`);
  }

  async embedBatchPassages(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedPassage(t)));
  }
}

/**
 * Cloud Run / Self-Hosted E5 Embedding Provider
 * Authenticated via shared secret + IAM Identity Token.
 */
export class CloudRunEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = MODEL_NAME;
  readonly dimension = DIMENSION;

  private serviceUrl: string;
  private secret: string;
  private timeoutMs: number;

  constructor(serviceUrl?: string, secret?: string) {
    this.serviceUrl =
      serviceUrl || process.env.EMBEDDING_SERVICE_URL || "http://localhost:8080/embed";
    this.secret = secret || process.env.EMBEDDING_SERVICE_SECRET || "";
    this.timeoutMs = parseInt(process.env.EMBEDDING_TIMEOUT_MS || "3500", 10);
  }

  private async callService(texts: string[], inputType: "passage" | "query"): Promise<number[][]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-service-secret": this.secret,
      "X-Embedding-Secret": this.secret,
      "X-Model-Name": this.modelName,
    };

    if (process.env.EMBEDDING_IDENTITY_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.EMBEDDING_IDENTITY_TOKEN}`;
    }

    try {
      const response = await fetch(this.serviceUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          texts,
          input_type: inputType,
          inputs: texts.map((t) => `${inputType}: ${t}`), // backward compatibility
          model: this.modelName,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Embedding service returned status ${response.status}`);
      }

      const data = await response.json();
      return data.vectors || data.embeddings || data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async embedPassage(text: string): Promise<number[]> {
    const res = await this.callService([text], "passage");
    return res[0];
  }

  async embedQuery(text: string): Promise<number[]> {
    const res = await this.callService([text], "query");
    return res[0];
  }

  async embedBatchPassages(texts: string[]): Promise<number[][]> {
    return this.callService(texts, "passage");
  }
}

// Factory returning CloudRun if configured, otherwise Mock provider
export function getEmbeddingProvider(): EmbeddingProvider {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (process.env.USE_MOCK_EMBEDDINGS === "true") {
      throw new Error(
        "CRITICAL_SECURITY_ERROR: 'USE_MOCK_EMBEDDINGS=true' is strictly prohibited in production mode. Real multilingual-e5-small embeddings must be used to prevent wrong or hallucinated responses."
      );
    }

    if (!process.env.EMBEDDING_SERVICE_URL) {
      throw new Error(
        "EMBEDDING_SERVICE_NOT_CONFIGURED: 'EMBEDDING_SERVICE_URL' is unset in production. Please deploy the multilingual-e5-small Cloud Run container and configure this URL."
      );
    }

    return new CloudRunEmbeddingProvider();
  }

  // Development & Testing Mock
  return new MockEmbeddingProvider();
}
