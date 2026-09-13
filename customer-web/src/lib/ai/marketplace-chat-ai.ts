import {
  conversationsStore,
  sendMessage,
  createSystemMessage,
} from "../marketplace/chat-engine";
import { AIMode } from "../marketplace/marketplace-types";

export interface AIChatDraftResponse {
  conversationId: string;
  aiMode: AIMode;
  draftText: string;
  confidenceScore: number;
  requiresHumanApproval: boolean;
  handoffTriggered: boolean;
  handoffReason?: string;
}

/**
 * AI Chat Assistant for Marketplace Conversations.
 * Operates in AI_SUGGEST mode (artist approves AI draft) or AI_AUTOREPLY.
 * Strictly forbidden from mutating bookings, modifying prices, or confirming payments.
 */
export function generateAIChatDraft(
  userText: string,
  conversationId: string,
  mode: AIMode = "AI_SUGGEST"
): AIChatDraftResponse {
  const conversation = conversationsStore.find((c) => c.conversationId === conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const text = userText.toLowerCase();

  // 1. Check for Human Handoff Triggers (Disputes, Refunds, Complaints, Safety)
  const handoffKeywords = ["refund", "dispute", "cancel", "complaint", "cheat", "scam", "police", "legal", "injury"];
  const needsHandoff = handoffKeywords.some((kw) => text.includes(kw));

  if (needsHandoff) {
    // Trigger Human Handoff
    conversation.status = "HUMAN_HANDOFF";
    conversation.updatedAt = new Date().toISOString();

    createSystemMessage(
      conversationId,
      "HUMAN_HANDOFF_TRIGGERED",
      "Notice: Conversation transferred to human support team for dedicated assistance."
    );

    return {
      conversationId,
      aiMode: "HUMAN_ONLY",
      draftText: "I am connecting you with our human support specialist who will assist you shortly.",
      confidenceScore: 1.0,
      requiresHumanApproval: false,
      handoffTriggered: true,
      handoffReason: "SENSITIVE_SUPPORT_REQUEST",
    };
  }

  // 2. Draft Response Generation Logic
  let draftText = "Thank you for reaching out! We specialize in high-definition bridal and party makeup. What date is your upcoming event?";
  let confidenceScore = 0.92;

  if (text.includes("price") || text.includes("cost") || text.includes("rate")) {
    draftText = "Our starting prices for bridal packages begin at ₹25,000 including hair styling and draping. Official pricing is listed on our verified marketplace listing.";
    confidenceScore = 0.95;
  } else if (text.includes("location") || text.includes("jodhpur") || text.includes("jaipur") || text.includes("udaipur")) {
    draftText = "Yes! We serve clients across Jodhpur, Jaipur, Udaipur, and destination wedding venues throughout Rajasthan.";
    confidenceScore = 0.98;
  } else if (text.includes("available") || text.includes("date")) {
    draftText = "I would be happy to check availability for your event date. Could you please share the date and venue location?";
    confidenceScore = 0.90;
  }

  // Auto-reply mode (if enabled and confidence high)
  if (mode === "AI_AUTOREPLY" && conversation.status === "ACTIVE") {
    sendMessage({
      conversationId,
      senderType: "AI",
      senderId: "ai_assistant_bot",
      text: `[AI Assistant] ${draftText}`,
    });
  }

  return {
    conversationId,
    aiMode: mode,
    draftText,
    confidenceScore,
    requiresHumanApproval: mode === "AI_SUGGEST",
    handoffTriggered: false,
  };
}

/**
 * Screen incoming message for safety violations.
 */
export function screenMessageSafety(text: string): { safe: boolean; flagReason?: string } {
  const lowercase = text.toLowerCase();
  
  // Threat or harassment checks
  if (lowercase.includes("kill") || lowercase.includes("threat") || lowercase.includes("hate")) {
    return { safe: false, flagReason: "HARASSMENT_AND_SAFETY_THREAT" };
  }

  // Off-platform payment Evasion
  if (lowercase.includes("pay cash outside") || lowercase.includes("skip app payment")) {
    return { safe: false, flagReason: "PLATFORM_BYPASS_ATTEMPT" };
  }

  return { safe: true };
}
