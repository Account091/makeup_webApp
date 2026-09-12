import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { AiAuditEvent } from "./types";

/**
 * Asynchronously writes an audit event to the `aiToolCalls` collection in Firestore.
 */
export async function logAiToolCall(logData: Partial<AiAuditEvent> & { feature: any; provider: any; model: string }): Promise<string> {
  const requestId = logData.requestId || `req_ai_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const startedAt = logData.startedAt || new Date().toISOString();

  const fullLog: AiAuditEvent = {
    requestId,
    uid: logData.uid || "anonymous_user",
    organizationId: logData.organizationId || "makeovers_by_prachi",
    customerId: logData.customerId,
    feature: logData.feature,
    provider: logData.provider,
    model: logData.model,
    toolName: logData.toolName || null,
    actionType: logData.actionType || "READ",
    status: logData.status || "SUCCESS",
    startedAt,
    completedAt: logData.completedAt || new Date().toISOString(),
    latencyMs: logData.latencyMs || 0,
    inputTokens: logData.inputTokens || 0,
    outputTokens: logData.outputTokens || 0,
    fallbackUsed: logData.fallbackUsed || false,
    errorCode: logData.errorCode || null,
    promptHash: logData.promptHash || "",
  };

  try {
    const docRef = doc(collection(db, "aiToolCalls"), requestId);
    await setDoc(docRef, fullLog);
    console.log(`[AI Audit Logger] Recorded aiToolCalls event #${requestId} for feature '${logData.feature}'`);
  } catch (err) {
    console.warn(`[AI Audit Logger] Failed to record aiToolCalls event #${requestId} (non-blocking):`, err);
  }

  return requestId;
}
