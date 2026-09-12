export type AiFeature =
  | 'CUSTOMER_CONCIERGE'
  | 'ADMIN_COPILOT'
  | 'CONTENT_DRAFTER'
  | 'WHATSAPP_ASSISTANT'
  | 'VISION_ANALYSIS'
  | 'EMBEDDINGS'
  | 'ANALYTICS';

export type UserRole =
  | 'CUSTOMER'
  | 'ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'SUPPORT'
  | 'CONTENT_MANAGER'
  | 'ACCOUNTANT'
  | 'GUEST';

export type AiProviderName = 'huggingface' | 'openai' | 'local';

export type ActionType = 'READ' | 'MUTATION_RECOMMENDED';

export interface AiAuthContext {
  uid: string;
  role: UserRole;
  organizationId: string;
  customerId?: string;
  requestId: string;
  ipAddress?: string;
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiGatewayRequestPayload {
  feature: AiFeature;
  messages: AiChatMessage[];
  auth: AiAuthContext;
  toolName?: string;
  toolArgs?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface StructuredAiResponse<T = any> {
  answer: string;
  data?: T;
  confidence: number;
  requiresHumanApproval: boolean;
  recommendedMutationAction?: {
    actionType: string;
    cloudFunctionName: string;
    payload: Record<string, any>;
    reasoning: string;
  };
}

export interface AiGatewayResult {
  requestId: string;
  success: boolean;
  content: string;
  structuredResponse?: StructuredAiResponse;
  provider: AiProviderName;
  model: string;
  feature: AiFeature;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  fallbackUsed: boolean;
  requiresHumanApproval: boolean;
  toolExecuted?: string;
}

export interface AiToolDefinition {
  toolName: string;
  description: string;
  requiredRole: UserRole[];
  actionType: ActionType;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  authorization: (auth: AiAuthContext, args?: any) => Promise<boolean>;
  execute: (auth: AiAuthContext, args?: any) => Promise<any>;
}

export interface AiAuditEvent {
  requestId: string;
  uid: string;
  organizationId: string;
  customerId?: string;
  feature: AiFeature;
  provider: AiProviderName;
  model: string;
  toolName: string | null;
  actionType: ActionType;
  status: 'SUCCESS' | 'SAFETY_REJECTED' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'ERROR';
  startedAt: string;
  completedAt: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  fallbackUsed: boolean;
  errorCode: string | null;
  promptHash: string;
}

export interface AiSettings {
  enabled: boolean;
  provider: AiProviderName;
  providerPolicy: 'auto' | 'fastest' | 'cheapest' | 'preferred';
  defaultModel: string;
  fallbackModel: string;
  maxOutputTokens: number;
  temperature: number;
  timeoutMs: number;
  maxRetries: number;
}
