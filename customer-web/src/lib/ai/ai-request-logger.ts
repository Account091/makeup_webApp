/**
 * V9.6 AI Request Logging, Audit & Safety Events Engine
 */

import { hashPrompt } from './prompt-defense';

export type AIRequestStatus = 'SUCCESS' | 'BLOCKED' | 'FAILED' | 'TIMEOUT' | 'RATE_LIMITED';

export interface AIRequestRecord {
  requestId: string;
  userId: string;
  organizationId: string;
  useCase: string;
  provider: string;
  model: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  status: AIRequestStatus;
  safetyResult?: { safe: boolean; reason?: string };
  toolCallsCount: number;
  inputTokenEstimate: number;
  outputTokenEstimate: number;
  promptHash: string; // PII-safe hash, never raw prompt
  failureCode?: string;
}

export type AISafetyEventType =
  | 'PROMPT_INJECTION'
  | 'DATA_EXFILTRATION_ATTEMPT'
  | 'TOOL_AUTHORIZATION_DENIED'
  | 'UNSAFE_OUTPUT'
  | 'SCHEMA_VIOLATION'
  | 'SENSITIVE_CONTEXT_BLOCKED'
  | 'RATE_LIMITED'
  | 'BUDGET_EXCEEDED';

export interface AISafetyEvent {
  eventId: string;
  requestId: string;
  userId: string;
  organizationId: string;
  eventType: AISafetyEventType;
  details: string;
  createdAt: string;
}

const aiRequestStore: AIRequestRecord[] = [];
const aiSafetyEventStore: AISafetyEvent[] = [];

export function logAIRequest(record: Omit<AIRequestRecord, 'requestId' | 'promptHash'> & { rawPromptSummary: string }): AIRequestRecord {
  const reqRecord: AIRequestRecord = {
    requestId: `aireq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    userId: record.userId,
    organizationId: record.organizationId,
    useCase: record.useCase,
    provider: record.provider,
    model: record.model,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    durationMs: record.durationMs,
    status: record.status,
    safetyResult: record.safetyResult,
    toolCallsCount: record.toolCallsCount,
    inputTokenEstimate: record.inputTokenEstimate,
    outputTokenEstimate: record.outputTokenEstimate,
    promptHash: hashPrompt([{ role: 'user', content: record.rawPromptSummary }]),
    failureCode: record.failureCode,
  };

  aiRequestStore.push(reqRecord);
  return reqRecord;
}

export function logAISafetyEvent(params: {
  requestId: string;
  userId: string;
  organizationId: string;
  eventType: AISafetyEventType;
  details: string;
}): AISafetyEvent {
  const event: AISafetyEvent = {
    eventId: `aisafety_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    requestId: params.requestId,
    userId: params.userId,
    organizationId: params.organizationId,
    eventType: params.eventType,
    details: params.details,
    createdAt: new Date().toISOString(),
  };

  aiSafetyEventStore.push(event);
  return event;
}

export function getAIRequests(): AIRequestRecord[] {
  return [...aiRequestStore];
}

export function getAISafetyEvents(): AISafetyEvent[] {
  return [...aiSafetyEventStore];
}
