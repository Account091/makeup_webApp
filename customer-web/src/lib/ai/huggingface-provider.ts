import { HfInference } from "@huggingface/inference";
import { AiProvider, ProviderExecutionOptions, ProviderExecutionResult } from "./ai-provider";
import { AiModelTimeoutError } from "./ai-errors";

export class HuggingFaceProvider implements AiProvider {
  public readonly name = "huggingface" as const;

  public async execute(options: ProviderExecutionOptions): Promise<ProviderExecutionResult> {
    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.HF_INFERENCE_TOKEN;

    if (!token && process.env.NODE_ENV === "production") {
      throw new Error("Hugging Face server token (HF_TOKEN) is not configured.");
    }

    const providerConfig = process.env.HF_PROVIDER || options.providerPolicy || "auto";
    const hf = new HfInference(token);

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "30000", 10);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // In non-production or development environment without token, simulate clean response
      if (!token) {
        clearTimeout(timeoutId);
        return {
          content: `[Hugging Face ${options.model} Simulated Output]: Consulted bridal luxury guidelines. Recommended HD Airbrush packages for warm/humid weather events.`,
          provider: "huggingface",
          model: options.model,
          inputTokens: 40,
          outputTokens: 35,
        };
      }

      // Execute via official HfInference SDK chatCompletion
      const chatOptions: any = {
        model: options.model,
        messages: options.messages as any,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature ?? 0.7,
      };

      if (providerConfig && providerConfig !== "auto") {
        chatOptions.provider = providerConfig;
      }

      const response = await hf.chatCompletion(chatOptions);

      clearTimeout(timeoutId);

      const content = response.choices?.[0]?.message?.content || "";
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      return {
        content,
        provider: "huggingface",
        model: options.model,
        inputTokens,
        outputTokens,
        rawResponse: response,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new AiModelTimeoutError(`Hugging Face request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}
