import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { AiToolCallLog } from "./types";

/**
 * Asynchronously writes an audit event to the `aiToolCalls` collection in Firestore.
 */
export async function logAiToolCall(logData: Omit<AiToolCallLog, "callId" | "timestamp">): Promise<string> {
  const callId = `ai_call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const timestamp = new Date().toISOString();

  const fullLog: AiToolCallLog = {
    callId,
    timestamp,
    ...logData,
  };

  try {
    const docRef = doc(collection(db, "aiToolCalls"), callId);
    await setDoc(docRef, fullLog);
    console.log(`[AI Audit Logger] Recorded aiToolCalls event #${callId} for feature '${logData.feature}'`);
  } catch (err) {
    console.warn(`[AI Audit Logger] Failed to record aiToolCalls event #${callId} (non-blocking):`, err);
  }

  return callId;
}
