import { StructuredAiResponse } from "./types";
import { AiResponseValidationError } from "./ai-errors";

export function validateAndGuardResponse(
  rawContent: string,
  requireStructuredJSON = false
): { guardedContent: string; structuredResponse?: StructuredAiResponse; requiresHumanApproval: boolean } {
  if (!rawContent || rawContent.trim() === "") {
    throw new AiResponseValidationError("Received empty or null response from model provider.");
  }

  // 1. Unsafe Content / Fraud Claim Guard
  const forbiddenClaims = [
    /i\s+have\s+verified\s+your\s+payment/i,
    /your\s+price\s+is\s+now\s+discounted\s+to/i,
    /i\s+have\s+locked\s+your\s+calendar\s+date/i,
  ];

  for (const claim of forbiddenClaims) {
    if (claim.test(rawContent)) {
      throw new AiResponseValidationError("Model response generated unauthorized business claim or financial confirmation.");
    }
  }

  // 2. Structured JSON Output Schema Validation (if required)
  if (requireStructuredJSON) {
    try {
      const jsonStart = rawContent.indexOf("{");
      const jsonEnd = rawContent.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No valid JSON block found in response");
      }

      const jsonStr = rawContent.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr) as StructuredAiResponse;

      return {
        guardedContent: parsed.answer || rawContent,
        structuredResponse: {
          answer: parsed.answer || "",
          data: parsed.data || null,
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.95,
          requiresHumanApproval: parsed.requiresHumanApproval ?? Boolean(parsed.recommendedMutationAction),
          recommendedMutationAction: parsed.recommendedMutationAction,
        },
        requiresHumanApproval: parsed.requiresHumanApproval ?? Boolean(parsed.recommendedMutationAction),
      };
    } catch (err: any) {
      // Graceful fallback to text wrapper if strict JSON parsing fails
      return {
        guardedContent: rawContent,
        structuredResponse: {
          answer: rawContent,
          confidence: 0.85,
          requiresHumanApproval: false,
        },
        requiresHumanApproval: false,
      };
    }
  }

  // Standard text response guard
  return {
    guardedContent: rawContent,
    requiresHumanApproval: false,
  };
}
