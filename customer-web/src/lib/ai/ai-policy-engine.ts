import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { AiFeature } from "./types";
import { SafetyRiskLevel } from "./evaluation/evaluation-types";
import { AiSafetyViolationError } from "./ai-errors";

export interface AiFeatureFlags {
  enabled: boolean;
  customerConciergeEnabled: boolean;
  adminCopilotEnabled: boolean;
  contentDrafterEnabled: boolean;
  whatsappAiEnabled: boolean;
  paymentVisionEnabled: boolean;
}

export const DEFAULT_AI_FEATURE_FLAGS: AiFeatureFlags = {
  enabled: true,
  customerConciergeEnabled: true,
  adminCopilotEnabled: true,
  contentDrafterEnabled: true,
  whatsappAiEnabled: true,
  paymentVisionEnabled: true,
};

export const AI_DECISION_POLICIES = {
  customerConcierge: { allowReads: true, allowMutations: false },
  adminCopilot: { allowReads: true, allowMutations: false, humanApprovalRequired: true },
  paymentVision: { allowExtraction: true, allowFinalVerification: false },
  contentDrafter: { allowGeneration: true, autoPublish: false },
  whatsappAssistant: { allowRoutineReplies: true, handoffRequiredForSensitive: true },
};

/**
 * Classifies safety risk level of a user prompt (LOW, MEDIUM, HIGH)
 */
export function classifySafetyRisk(promptText: string): SafetyRiskLevel {
  const lower = promptText.toLowerCase();

  const highRiskKeywords = [
    "refund",
    "dispute",
    "override price",
    "change deposit",
    "delete booking",
    "api key",
    "system prompt",
    "other customer",
    "verify payment directly",
    "confirm payment without proof",
  ];

  for (const kw of highRiskKeywords) {
    if (lower.includes(kw)) return "HIGH";
  }

  const mediumRiskKeywords = [
    "change date",
    "change my wedding date",
    "change wedding date",
    "reschedule",
    "cancel",
    "timing shift",
    "outstation travel",
  ];

  for (const kw of mediumRiskKeywords) {
    if (lower.includes(kw)) return "MEDIUM";
  }

  return "LOW";
}

/**
 * Checks feature flags from Firestore `settings/ai` or defaults
 */
export async function checkAiFeatureFlags(feature: AiFeature): Promise<void> {
  let flags = DEFAULT_AI_FEATURE_FLAGS;

  try {
    const docRef = doc(db, "settings", "ai");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      flags = { ...DEFAULT_AI_FEATURE_FLAGS, ...snap.data() };
    }
  } catch (e) {
    // Non-blocking fallback
  }

  if (!flags.enabled) {
    throw new AiSafetyViolationError("AI Platform is currently undergoing emergency maintenance.");
  }

  if (feature === "CUSTOMER_CONCIERGE" && !flags.customerConciergeEnabled) {
    throw new AiSafetyViolationError("Customer Beauty Concierge is currently disabled.");
  }
  if (feature === "ADMIN_COPILOT" && !flags.adminCopilotEnabled) {
    throw new AiSafetyViolationError("Admin AI Copilot is currently disabled.");
  }
  if (feature === "CONTENT_DRAFTER" && !flags.contentDrafterEnabled) {
    throw new AiSafetyViolationError("AI Content Drafter is currently disabled.");
  }
  if (feature === "WHATSAPP_ASSISTANT" && !flags.whatsappAiEnabled) {
    throw new AiSafetyViolationError("WhatsApp AI Assistant is currently disabled.");
  }
  if (feature === "VISION_ANALYSIS" && !flags.paymentVisionEnabled) {
    throw new AiSafetyViolationError("AI Payment Vision Analysis is currently disabled.");
  }
}
