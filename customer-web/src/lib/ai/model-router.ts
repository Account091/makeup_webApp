import { AiFeature, AiProviderName } from "./types";

export interface ModelRouteResult {
  provider: AiProviderName;
  model: string;
  fallbackModel: string;
  fallbackProvider: AiProviderName;
  maxOutputTokens: number;
  temperature: number;
}

export function routeModel(feature: AiFeature): ModelRouteResult {
  const defaultProvider = (process.env.AI_PRIMARY_PROVIDER as AiProviderName) || "huggingface";
  const fallbackProvider = (process.env.AI_FALLBACK_PROVIDER as AiProviderName) || "huggingface";

  switch (feature) {
    case "CUSTOMER_CONCIERGE":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_CONCIERGE || "Qwen/Qwen2.5-Coder-32B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1024,
        temperature: 0.7,
      };

    case "ADMIN_COPILOT":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_COPILOT || "meta-llama/Llama-3.3-70B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "Qwen/Qwen2.5-Coder-32B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1536,
        temperature: 0.2, // Lower temperature for precise business summaries
      };

    case "CONTENT_DRAFTER":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_DRAFTER || "meta-llama/Llama-3.3-70B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "Qwen/Qwen2.5-Coder-32B-Instruct",
        fallbackProvider,
        maxOutputTokens: 2048,
        temperature: 0.8, // Slightly higher creative temperature for content
      };

    case "WHATSAPP_ASSISTANT":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_WHATSAPP || "Qwen/Qwen2.5-Coder-32B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
        fallbackProvider,
        maxOutputTokens: 512,
        temperature: 0.5,
      };

    case "VISION_ANALYSIS":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_VISION || "Qwen/Qwen2-VL-7B-Instruct",
        fallbackModel: "Qwen/Qwen2-VL-7B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1024,
        temperature: 0.3,
      };

    case "EMBEDDINGS":
      return {
        provider: defaultProvider,
        model: process.env.AI_MODEL_EMBEDDING || "BAAI/bge-large-en-v1.5",
        fallbackModel: "BAAI/bge-large-en-v1.5",
        fallbackProvider,
        maxOutputTokens: 512,
        temperature: 0.0,
      };

    case "ANALYTICS":
    default:
      return {
        provider: defaultProvider,
        model: process.env.AI_DEFAULT_MODEL || "Qwen/Qwen2.5-Coder-32B-Instruct",
        fallbackModel: process.env.AI_FALLBACK_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
        fallbackProvider,
        maxOutputTokens: 1024,
        temperature: 0.3,
      };
  }
}
