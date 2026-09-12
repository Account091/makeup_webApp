import {
  AiGatewayRequest,
  AiGatewayResponse,
  AiModelConfig,
  AiProviderType,
} from "./types";

/**
 * Default AI Gateway configuration.
 * Can be overridden dynamically via Firestore config or environment variables.
 */
export const DEFAULT_AI_MODEL_CONFIG: AiModelConfig = {
  activeProvider: (process.env.AI_PRIMARY_PROVIDER as AiProviderType) || "huggingface",
  primaryModel: process.env.HF_MODEL || "Qwen/Qwen2.5-Coder-32B-Instruct",
  huggingFace: {
    provider: process.env.HF_INFERENCE_PROVIDER || "fireworks-ai",
    endpointType: (process.env.HF_ENDPOINT_TYPE as any) || "INFERENCE_PROVIDER",
    customEndpointUrl: process.env.HF_CUSTOM_ENDPOINT_URL || "",
  },
  fallbackProvider: (process.env.AI_FALLBACK_PROVIDER as AiProviderType) || "openai",
  fallbackModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  localEndpoint: {
    url: process.env.LOCAL_AI_URL || "http://localhost:11434/v1",
    model: process.env.LOCAL_AI_MODEL || "qwen2.5:14b",
  },
  maxTokens: 1024,
  temperature: 0.7,
  timeoutMs: 12000,
};

/**
 * Executes an AI Request through the multi-provider gateway.
 * Server-only: Reads secrets from process.env (HUGGINGFACE_API_KEY, OPENAI_API_KEY).
 */
export async function executeAiGatewayRequest(
  request: AiGatewayRequest,
  auditCallId: string,
  config: AiModelConfig = DEFAULT_AI_MODEL_CONFIG
): Promise<AiGatewayResponse> {
  const startTime = Date.now();
  const primaryProvider = config.activeProvider;

  try {
    const primaryResult = await callProvider(primaryProvider, config.primaryModel, request, config);
    return {
      success: true,
      content: primaryResult.content,
      providerUsed: primaryProvider,
      modelUsed: config.primaryModel,
      durationMs: Date.now() - startTime,
      tokensUsed: primaryResult.tokensUsed,
      auditCallId,
      isFallbackUsed: false,
    };
  } catch (primaryErr: any) {
    console.warn(`[AI Gateway] Primary provider '${primaryProvider}' failed: ${primaryErr?.message}. Initiating failover...`);

    if (config.fallbackProvider && config.fallbackProvider !== primaryProvider) {
      try {
        const fallbackModel = config.fallbackModel || "gpt-4o-mini";
        const fallbackResult = await callProvider(config.fallbackProvider, fallbackModel, request, config);

        return {
          success: true,
          content: fallbackResult.content,
          providerUsed: config.fallbackProvider,
          modelUsed: fallbackModel,
          durationMs: Date.now() - startTime,
          tokensUsed: fallbackResult.tokensUsed,
          auditCallId,
          isFallbackUsed: true,
        };
      } catch (fallbackErr: any) {
        console.error(`[AI Gateway] Fallback provider '${config.fallbackProvider}' also failed:`, fallbackErr);
        throw new Error(`AI Gateway execution failed on primary (${primaryErr.message}) and fallback (${fallbackErr.message}).`);
      }
    }

    throw primaryErr;
  }
}

/**
 * Dispatch call to specific AI Provider API
 */
async function callProvider(
  provider: AiProviderType,
  model: string,
  request: AiGatewayRequest,
  config: AiModelConfig
): Promise<{ content: string; tokensUsed?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  switch (provider) {
    case "huggingface":
      return callHuggingFace(model, request, config);
    case "openai":
      return callOpenAI(model, request, config);
    case "local":
      return callLocalEndpoint(model, request, config);
    default:
      throw new Error(`Unsupported AI Provider '${provider}'`);
  }
}

/**
 * Hugging Face Provider Implementation
 * Supports HF Inference Router / Providers API & Dedicated Endpoints
 */
async function callHuggingFace(
  model: string,
  request: AiGatewayRequest,
  config: AiModelConfig
) {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
  if (!apiKey) {
    // Demo fallback response if no API key is set in local development environment
    if (process.env.NODE_ENV !== "production") {
      return {
        content: `[AI Concierge Simulation - Hugging Face ${model}]: Based on your makeup preferences, we recommend our Signature Bridal Airbrush Look featuring deep plum undertones and long-lasting glow finish.`,
        tokensUsed: { promptTokens: 45, completionTokens: 32, totalTokens: 77 },
      };
    }
    throw new Error("Missing HUGGINGFACE_API_KEY in server environment");
  }

  let endpointUrl = "https://router.huggingface.co/hf-inference/v1/chat/completions";

  if (config.huggingFace.endpointType === "INFERENCE_ENDPOINT" && config.huggingFace.customEndpointUrl) {
    endpointUrl = config.huggingFace.customEndpointUrl;
  }

  const payload: any = {
    model: model,
    messages: request.messages,
    max_tokens: request.maxTokens || config.maxTokens,
    temperature: request.temperature ?? config.temperature,
  };

  if (config.huggingFace.provider && config.huggingFace.endpointType === "INFERENCE_PROVIDER") {
    payload.provider = config.huggingFace.provider;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage
      ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        }
      : undefined;

    return { content, tokensUsed: usage };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * OpenAI Provider Fallback Implementation
 */
async function callOpenAI(
  model: string,
  request: AiGatewayRequest,
  config: AiModelConfig
) {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      return {
        content: `[AI Concierge Simulation - OpenAI ${model}]: Our bridal artists specialize in high-definition waterproof finishes tailored to warm skin tones.`,
        tokensUsed: { promptTokens: 40, completionTokens: 25, totalTokens: 65 },
      };
    }
    throw new Error("Missing OPENAI_API_KEY in server environment");
  }

  const payload = {
    model: model,
    messages: request.messages,
    max_tokens: request.maxTokens || config.maxTokens,
    temperature: request.temperature ?? config.temperature,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage
      ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        }
      : undefined;

    return { content, tokensUsed: usage };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Local Endpoint (vLLM / Ollama) Implementation
 */
async function callLocalEndpoint(
  model: string,
  request: AiGatewayRequest,
  config: AiModelConfig
) {
  const baseUrl = config.localEndpoint?.url || "http://localhost:11434/v1";
  const localModel = config.localEndpoint?.model || model;
  const endpointUrl = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const payload = {
    model: localModel,
    messages: request.messages,
    max_tokens: request.maxTokens || config.maxTokens,
    temperature: request.temperature ?? config.temperature,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Local AI API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { content };
  } finally {
    clearTimeout(timeout);
  }
}
