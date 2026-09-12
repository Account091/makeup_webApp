import { NextResponse } from "next/server";
import { executeAiGatewayRequest } from "../../../../lib/ai/ai-gateway";
import { logAiToolCall } from "../../../../lib/ai/audit-logger";
import { checkDeterministicBoundaries, hashPrompt, wrapUserPromptInBoundary } from "../../../../lib/ai/prompt-defense";
import { AiChatMessage, AiGatewayRequest } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body: AiGatewayRequest = await req.json();
    const { feature, messages, userId = "anonymous", userRole = "customer", contextData } = body;

    if (!feature || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing required fields: feature and messages array." }, { status: 400 });
    }

    // 1. Enforce Deterministic Boundary Check
    const boundaryCheck = checkDeterministicBoundaries(feature, messages);
    if (!boundaryCheck.safe) {
      // Audit safety rejection
      await logAiToolCall({
        userId,
        userRole,
        feature,
        provider: "huggingface",
        model: "N/A",
        promptHash: hashPrompt(messages),
        durationMs: 0,
        isMutationRequested: false,
        status: "SAFETY_REJECTED",
        errorMessage: boundaryCheck.reason,
      });

      return NextResponse.json({ error: boundaryCheck.reason }, { status: 400 });
    }

    // 2. Wrap the last user query with strict XML boundary tags
    const sanitizedMessages: AiChatMessage[] = messages.map((msg) => {
      if (msg.role === "user") {
        return { ...msg, content: wrapUserPromptInBoundary(msg.content) };
      }
      return msg;
    });

    const promptHash = hashPrompt(sanitizedMessages);

    // 3. Execute via Provider Abstraction AI Gateway
    const startTime = Date.now();
    try {
      const response = await executeAiGatewayRequest(
        {
          ...body,
          messages: sanitizedMessages,
        },
        `call_${Date.now()}`
      );

      // 4. Audit Log to Firestore (Async Non-Blocking)
      await logAiToolCall({
        userId,
        userRole,
        feature,
        provider: response.providerUsed,
        model: response.modelUsed,
        promptHash,
        tokensUsed: response.tokensUsed,
        durationMs: Date.now() - startTime,
        isMutationRequested: false,
        status: response.isFallbackUsed ? "FALLBACK_USED" : "SUCCESS",
      });

      return NextResponse.json(response);
    } catch (gatewayErr: any) {
      await logAiToolCall({
        userId,
        userRole,
        feature,
        provider: "huggingface",
        model: "UNKNOWN",
        promptHash,
        durationMs: Date.now() - startTime,
        isMutationRequested: false,
        status: "ERROR",
        errorMessage: gatewayErr?.message || "AI Gateway provider execution failure",
      });

      return NextResponse.json(
        { error: "AI Service temporarily unavailable. Please try again or contact support." },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("[Server API /api/ai/gateway] Error:", err);
    return NextResponse.json({ error: "Failed to process AI gateway request" }, { status: 500 });
  }
}
