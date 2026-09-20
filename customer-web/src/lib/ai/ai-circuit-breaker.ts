/**
 * V9.6 AI Provider Circuit Breaker & Fallback Matrix Engine
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  state: CircuitState;
  failureCount: number;
  lastFailureAt?: string;
  openedAt?: string;
}

let failureCount = 0;
let circuitState: CircuitState = 'CLOSED';
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 10000; // 10 seconds for testing

export function recordAIFailure(): CircuitBreakerStatus {
  failureCount++;
  lastFailureTime = Date.now();

  if (failureCount >= FAILURE_THRESHOLD) {
    circuitState = 'OPEN';
  }

  return getCircuitStatus();
}

export function recordAISuccess(): CircuitBreakerStatus {
  failureCount = 0;
  circuitState = 'CLOSED';
  return getCircuitStatus();
}

export function getCircuitStatus(): CircuitBreakerStatus {
  if (circuitState === 'OPEN' && Date.now() - lastFailureTime > COOLDOWN_MS) {
    circuitState = 'HALF_OPEN';
  }

  return {
    state: circuitState,
    failureCount,
    lastFailureAt: lastFailureTime ? new Date(lastFailureTime).toISOString() : undefined,
  };
}

export function getProductionFallback(useCase: string): string {
  const fallbacks: Record<string, string> = {
    CUSTOMER_CONCIERGE: 'Static FAQ & manual support queue',
    ADMIN_COPILOT: 'Standard manual admin analytics dashboard',
    CONTENT_DRAFTER: 'Manual text editor template',
    WHATSAPP_ASSISTANT: 'Escalated to human support queue',
    PAYMENT_VISION: 'Manual payment verification workflow',
  };

  return fallbacks[useCase] || 'Manual operational fallback';
}
