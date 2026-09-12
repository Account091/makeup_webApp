import { createHash } from "crypto";
import { AiChatMessage } from "./types";

/**
 * Computes a SHA-256 hash of prompt contents for audit logging without storing raw PII in hashes.
 */
export function hashPrompt(messages: AiChatMessage[]): string {
  const serialized = messages.map((m) => `${m.role}:${m.content}`).join("\n");
  return createHash("sha256").update(serialized).digest("hex");
}

/**
 * Sanitizes user input strings to mitigate prompt injection attempts.
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/ignore\s+previous\s+instructions/gi, "[FILTERED_ATTEMPT]")
    .replace(/you\s+are\s+now\s+in\s+developer\s+mode/gi, "[FILTERED_ATTEMPT]")
    .replace(/override\s+system\s+prompt/gi, "[FILTERED_ATTEMPT]")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .trim();
}

/**
 * Wraps user input in strict XML tags to enforce context boundary in LLM system prompts.
 */
export function wrapUserPromptInBoundary(userPrompt: string): string {
  const clean = sanitizeUserInput(userPrompt);
  return `<user_query>\n${clean}\n</user_query>`;
}

/**
 * Validates that requests do not attempt to bypass deterministic boundaries (e.g. asking AI to compute custom price/UTR approval).
 */
export function checkDeterministicBoundaries(feature: string, messages: AiChatMessage[]): { safe: boolean; reason?: string } {
  const fullText = messages.map((m) => m.content.toLowerCase()).join(" ");

  // Reject attempts asking AI to override pricing or auto-approve payment UTRs directly
  const prohibitedTriggers = [
    "set deposit to 0",
    "override price to",
    "bypass utr verification",
    "approve payment directly",
    "lock calendar without deposit",
  ];

  for (const trigger of prohibitedTriggers) {
    if (fullText.includes(trigger)) {
      return {
        safe: false,
        reason: `Safety Violation: Attempted to bypass server-authoritative logic ('${trigger}'). Pricing and payment approvals are strictly deterministic.`,
      };
    }
  }

  return { safe: true };
}
