import { AiChatMessage, AiProviderName } from "./types";

export interface ProviderExecutionOptions {
  model: string;
  messages: AiChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  providerPolicy?: string;
}

export interface ProviderExecutionResult {
  content: string;
  provider: AiProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  rawResponse?: any;
}

export interface AiProvider {
  name: AiProviderName;
  execute(options: ProviderExecutionOptions): Promise<ProviderExecutionResult>;
}
