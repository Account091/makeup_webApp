export type AiProviderType = 'huggingface' | 'openai' | 'local';

export type HuggingFaceEndpointType = 'INFERENCE_PROVIDER' | 'INFERENCE_ENDPOINT' | 'LOCAL';

export interface HuggingFaceConfig {
  provider?: string; // e.g., 'fireworks-ai', 'together', 'groq', 'cerebras'
  endpointType: HuggingFaceEndpointType;
  customEndpointUrl?: string;
}

export interface LocalEndpointConfig {
  url: string; // e.g. http://localhost:11434/v1 or http://localhost:8000/v1
  model: string;
}

export interface AiModelConfig {
  activeProvider: AiProviderType;
  primaryModel: string; // e.g. 'Qwen/Qwen2.5-Coder-32B-Instruct' or 'meta-llama/Llama-3.3-70B-Instruct'
  huggingFace: HuggingFaceConfig;
  fallbackProvider?: AiProviderType;
  fallbackModel?: string;
  localEndpoint?: LocalEndpointConfig;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiGatewayRequest {
  feature: 'BEAUTY_CONCIERGE' | 'ADMIN_COPILOT' | 'WHATSAPP_DRAFTER' | 'IMAGE_ANALYSIS';
  messages: AiChatMessage[];
  userId?: string;
  userRole?: 'customer' | 'admin' | 'artist' | 'guest';
  contextData?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface AiGatewayResponse {
  success: boolean;
  content: string;
  providerUsed: AiProviderType;
  modelUsed: string;
  durationMs: number;
  tokensUsed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  auditCallId: string;
  isFallbackUsed?: boolean;
  error?: string;
}

export interface AiToolCallLog {
  callId: string;
  timestamp: string;
  userId: string;
  userRole: 'customer' | 'admin' | 'artist' | 'guest';
  feature: string;
  provider: AiProviderType;
  model: string;
  promptHash: string;
  tokensUsed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  isMutationRequested: boolean;
  status: 'SUCCESS' | 'SAFETY_REJECTED' | 'FALLBACK_USED' | 'ERROR';
  errorMessage?: string;
}
