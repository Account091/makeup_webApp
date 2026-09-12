import { createHash } from "crypto";
import { AiAuthContext, AiChatMessage, AiFeature } from "./types";
import { AiAuthorizationError, AiSafetyViolationError } from "./ai-errors";

/**
 * Computes prompt hash for audit logging without storing raw PII in hashes.
 */
export function hashPrompt(messages: AiChatMessage[]): string {
  const content = messages.map((m) => `${m.role}:${m.content}`).join("\n");
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Multi-stage AI Safety Layer:
 * 1. Input Length & Token Boundary Validation
 * 2. Role Authorization Scope Validation
 * 3. Prompt Injection Defense
 * 4. Deterministic Business Mutation Boundary Check
 */
export async function validateAiSafety(
  feature: AiFeature,
  auth: AiAuthContext,
  messages: AiChatMessage[]
): Promise<{ sanitizedMessages: AiChatMessage[]; promptHash: string }> {
  if (!messages || messages.length === 0) {
    throw new AiSafetyViolationError("AI request contains empty messages payload.");
  }

  // 1. Role Authorization Scope Validation
  if (feature === "ADMIN_COPILOT" && !["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role)) {
    throw new AiAuthorizationError(`User with role '${auth.role}' is not authorized to access ADMIN_COPILOT feature.`);
  }

  const fullText = messages.map((m) => m.content).join(" ");
  const maxInputTokens = parseInt(process.env.AI_MAX_INPUT_TOKENS || "4096", 10);
  if (fullText.length > maxInputTokens * 4) {
    throw new AiSafetyViolationError(`Input payload exceeds max input token limit (${maxInputTokens} tokens).`);
  }

  // 2. Prompt Injection Defense
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/i,
    /reveal\s+(system\s+prompt|api\s+key|token|secrets)/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /override\s+(security|authorization|permissions)/i,
    /execute\s+(shell|system|delete|drop)/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(fullText)) {
      throw new AiSafetyViolationError("Prompt injection attempt detected and blocked by AI Safety Layer.");
    }
  }

  // 3. Deterministic Business Mutation Boundary Check
  const prohibitedMutations = [
    "change price to",
    "override deposit",
    "confirm booking directly",
    "verify payment utr",
    "bypass 5 minute timer",
    "grant owner access",
  ];

  const lowerText = fullText.toLowerCase();
  for (const mutation of prohibitedMutations) {
    if (lowerText.includes(mutation)) {
      throw new AiSafetyViolationError(
        `Blocked attempt to mutate business state ('${mutation}'). Financial, calendar, and payment logic must execute via deterministic server logic.`
      );
    }
  }

  // 4. Wrap User Inputs in strict XML Boundary Tags
  const sanitizedMessages: AiChatMessage[] = messages.map((msg) => {
    if (msg.role === "user") {
      const cleanContent = msg.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .trim();
      return {
        ...msg,
        content: `<user_query>\n${cleanContent}\n</user_query>`,
      };
    }
    return msg;
  });

  const promptHash = hashPrompt(sanitizedMessages);

  return { sanitizedMessages, promptHash };
}
