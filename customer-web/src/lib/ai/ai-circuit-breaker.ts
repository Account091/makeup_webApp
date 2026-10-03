/**
 * V10.0 Resilient AI Provider Circuit Breaker
 * 
 * Supports serverless distributed state (Firestore-backed) with differential cooldowns:
 * - 402 PAYMENT_REQUIRED: Persists for 30 days (or until 1st of next calendar month)
 *   because free-tier monthly credits do not reset until the next billing cycle.
 * - 429 RATE_LIMIT: Persists for 60 seconds.
 * - TIMEOUT / 5XX: 3 strikes threshold, 30 seconds cooldown.
 */

import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type FailureType = "402_CREDIT_EXHAUSTED" | "429_RATE_LIMIT" | "TIMEOUT_OR_5XX";

export interface CircuitBreakerStatus {
  state: CircuitState;
  failureCount: number;
  failureType?: FailureType;
  lastFailureAt?: string;
  cooldownUntil?: string;
  reason?: string;
}

// In-Memory Fast Cache (L1) to avoid reading Firestore on every microsecond
let localState: CircuitBreakerStatus = {
  state: "CLOSED",
  failureCount: 0,
};
let lastSyncTime = 0;
const LOCAL_CACHE_SYNC_INTERVAL_MS = 5000; // 5 seconds

// Helper to calculate end of current UTC month
function getNextBillingCycleResetTime(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return nextMonth.getTime();
}

/**
 * Validates Studio WhatsApp configuration at startup / deploy health check.
 * Throws loudly if missing or set to placeholder/dummy numbers.
 */
export function validateStudioWhatsAppConfig(): { valid: boolean; phone: string } {
  const num =
    process.env.STUDIO_WHATSAPP ||
    process.env.NEXT_PUBLIC_STUDIO_WHATSAPP;

  if (!num || !num.trim() || num.includes("REPLACE_ME")) {
    throw new Error(
      "FATAL_CONFIG_ERROR: 'STUDIO_WHATSAPP' environment variable is unconfigured or set to 'REPLACE_ME'. Please set your verified studio WhatsApp phone number in customer-web/.env.local."
    );
  }

  const cleanNum = num.replace(/[^0-9]/g, "");
  const prohibitedPlaceholders = [
    "919829012345",
    "9829012345",
    "919829000000",
    "919876543210",
    "1234567890",
  ];

  if (prohibitedPlaceholders.includes(cleanNum) || cleanNum.length < 10) {
    throw new Error(
      `FATAL_CONFIG_ERROR: STUDIO_WHATSAPP is set to prohibited placeholder or invalid number '${num}'. Must configure Makeovers by Prachi's verified business number.`
    );
  }

  return { valid: true, phone: cleanNum };
}

/**
 * Returns studio WhatsApp link from config.
 * RUNTIME SAFE: Never throws. If config is missing or invalid in runtime, logs an alert and
 * safely returns the '/contact' page link so customers never experience a 500 error.
 */
export function getStudioWhatsAppUrl(): string {
  try {
    const { phone } = validateStudioWhatsAppConfig();
    return `https://wa.me/${phone}`;
  } catch (err: any) {
    console.error(
      `[AI Handoff Fallback] Configuration Warning: ${err?.message || "Invalid STUDIO_WHATSAPP"}. Returning '/contact' page link instead of 500.`
    );
    return "/contact";
  }
}

export async function getCircuitStatus(): Promise<CircuitBreakerStatus> {
  const now = Date.now();

  // Return fast local cache if recently synced
  if (now - lastSyncTime < LOCAL_CACHE_SYNC_INTERVAL_MS) {
    return evaluateLocalState();
  }

  // Sync from shared Firestore storage
  try {
    const docRef = doc(db, "system_state", "ai_circuit_breaker");
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as CircuitBreakerStatus;
      localState = data;
      lastSyncTime = now;
    }
  } catch (e) {
    // If Firestore is offline or cold, proceed with local state safely
  }

  return evaluateLocalState();
}

function evaluateLocalState(): CircuitBreakerStatus {
  const now = Date.now();

  if (localState.state === "OPEN" && localState.cooldownUntil) {
    const cooldownTime = new Date(localState.cooldownUntil).getTime();
    if (now >= cooldownTime) {
      localState.state = "HALF_OPEN";
    }
  }

  return localState;
}

export async function recordAIFailure(
  type: FailureType,
  details?: string
): Promise<CircuitBreakerStatus> {
  const now = Date.now();
  let cooldownDurationMs = 30000; // default 30s
  let reason = details || "External AI request failed";

  if (type === "402_CREDIT_EXHAUSTED") {
    // 402 Free-tier credit wall: Locks circuit until next monthly billing reset
    const nextMonthReset = getNextBillingCycleResetTime();
    cooldownDurationMs = Math.max(30000, nextMonthReset - now);
    reason = "Hugging Face Free Tier monthly credit pool ($0.10) depleted. Locked until billing cycle reset.";
    localState.state = "OPEN";
    localState.failureCount = 999;
  } else if (type === "429_RATE_LIMIT") {
    cooldownDurationMs = 60000; // 60s
    reason = "Provider rate limited (429). Fast cooldown applied.";
    localState.state = "OPEN";
  } else {
    localState.failureCount = (localState.failureCount || 0) + 1;
    if (localState.failureCount >= 3) {
      localState.state = "OPEN";
      cooldownDurationMs = 30000; // 30s
      reason = "Consecutive network/timeout failures exceeded threshold.";
    }
  }

  const cooldownUntil = new Date(now + cooldownDurationMs).toISOString();
  localState.failureType = type;
  localState.lastFailureAt = new Date(now).toISOString();
  localState.cooldownUntil = cooldownUntil;
  localState.reason = reason;
  lastSyncTime = now;

  // Persist to shared Firestore so ALL serverless instances honor the circuit breaker
  try {
    const docRef = doc(db, "system_state", "ai_circuit_breaker");
    await setDoc(docRef, localState, { merge: true });
  } catch (err) {
    // Non-fatal if firestore write fails
  }

  return localState;
}

export async function recordAISuccess(): Promise<CircuitBreakerStatus> {
  localState = {
    state: "CLOSED",
    failureCount: 0,
    lastFailureAt: undefined,
    cooldownUntil: undefined,
    reason: undefined,
  };
  lastSyncTime = Date.now();

  try {
    const docRef = doc(db, "system_state", "ai_circuit_breaker");
    await setDoc(docRef, localState, { merge: true });
  } catch (err) {
    // Non-fatal
  }

  return localState;
}

export function getProductionFallback(useCase: string): string {
  const whatsappUrl = getStudioWhatsAppUrl();
  const fallbacks: Record<string, string> = {
    CUSTOMER_CONCIERGE: `Our AI concierge is operating in verified offline mode. For instant bespoke assistance, chat with Prachi directly on WhatsApp: ${whatsappUrl}`,
    ADMIN_COPILOT: "Standard manual operations dashboard (AI synthesis offline).",
    CONTENT_DRAFTER: "Standard royal bridal message templates.",
    WHATSAPP_ASSISTANT: `Automated copilot paused. Inquiries routed to studio WhatsApp: ${whatsappUrl}`,
    PAYMENT_VISION: "Payment screenshot forwarded to Studio Accounts Queue for verification.",
  };

  return fallbacks[useCase] || `Studio service available on WhatsApp: ${whatsappUrl}`;
}
