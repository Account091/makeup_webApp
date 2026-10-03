import { AiFeature, AiProviderName } from "./types";

export interface ModelRouteResult {
  provider: AiProviderName;
  model: string;
  fallbackModel: string;
  fallbackProvider: AiProviderName;
  maxOutputTokens: number;
  temperature: number;
  taskType?: "chat" | "classification" | "sentiment" | "embeddings" | "moderation";
}

/**
 * Task-optimized model router.
 * Replaces code-generation models with instruct conversation models and lightweight
 * task-specific models that minimize compute, avoid credit exhaustion, and support multi-provider swapping.
 */
export function routeModel(feature: AiFeature): ModelRouteResult {
  const defaultProvider = (process.env.AI_PRIMARY_PROVIDER as AiProviderName) || "huggingface";
  const fallbackProvider = (process.env.AI_FALLBACK_PROVIDER as AiProviderName) || "huggingface";

  switch (feature) {
    case "CUSTOMER_CONCIERGE":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_CONCIERGE || "Qwen/Qwen2.5-7B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.2-3B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1024,
        temperature: 0.6,
        taskType: "chat",
      };

    case "ADMIN_COPILOT":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_COPILOT || "meta-llama/Llama-3.2-3B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "Qwen/Qwen2.5-7B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1200,
        temperature: 0.2, // Low temperature for factual operational reporting
        taskType: "chat",
      };

    case "CONTENT_DRAFTER":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_DRAFTER || "Qwen/Qwen2.5-7B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.2-3B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1500,
        temperature: 0.7,
        taskType: "chat",
      };

    case "WHATSAPP_ASSISTANT":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_WHATSAPP || "Qwen/Qwen2.5-7B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.2-3B-Instruct",
        fallbackProvider,
        maxOutputTokens: 400, // Small output tokens save inference credits
        temperature: 0.4,
        taskType: "chat",
      };

    case "VISION_ANALYSIS":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_VISION || "Qwen/Qwen2-VL-7B-Instruct",
        fallbackModel: "Qwen/Qwen2-VL-7B-Instruct",
        fallbackProvider,
        maxOutputTokens: 800,
        temperature: 0.2,
        taskType: "chat",
      };

    case "EMBEDDINGS":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_EMBEDDING || "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        fallbackModel: "intfloat/multilingual-e5-small",
        fallbackProvider,
        maxOutputTokens: 512,
        temperature: 0.0,
        taskType: "embeddings",
      };

    case "ANALYTICS":
    default:
      return {
        provider: defaultProvider,
        model: process.env.AI_DEFAULT_MODEL || "Qwen/Qwen2.5-7B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.2-3B-Instruct",
        fallbackProvider,
        maxOutputTokens: 800,
        temperature: 0.3,
        taskType: "chat",
      };
  }
}
