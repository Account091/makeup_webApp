/**
 * AI Telemetry & Observability — V9.0
 */

export interface AITelemetryRecord {
  requestId: string;
  feature: string;
  model: string;
  provider: string;
  status: 'SUCCESS' | 'RATE_LIMITED' | 'TOOL_DENIED' | 'FAILED';
  latencyMs: number;
  tokensUsed?: number;
  timestamp: string;
  errorMessage?: string;
}

const aiTelemetryLog: AITelemetryRecord[] = [];

export function recordAITelemetry(record: AITelemetryRecord): void {
  aiTelemetryLog.push(record);
}

export function getAIObservabilitySummary() {
  const total = aiTelemetryLog.length;
  const failures = aiTelemetryLog.filter((r) => r.status === 'FAILED').length;
  const rateLimited = aiTelemetryLog.filter((r) => r.status === 'RATE_LIMITED').length;
  const toolDenied = aiTelemetryLog.filter((r) => r.status === 'TOOL_DENIED').length;
  const avgLatency =
    total > 0
      ? Math.round(aiTelemetryLog.reduce((sum, r) => sum + r.latencyMs, 0) / total)
      : 0;

  return {
    totalCalls: total,
    failures,
    rateLimited,
    toolDenied,
    avgLatencyMs: avgLatency,
    recentLog: [...aiTelemetryLog].reverse().slice(0, 20),
  };
}
