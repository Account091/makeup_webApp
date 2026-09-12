import { NextResponse } from "next/server";
import { executeAiGatewayRequest } from "../../../../lib/ai/ai-gateway";
import { logAiToolCall } from "../../../../lib/ai/audit-logger";
import { checkDeterministicBoundaries, hashPrompt, wrapUserPromptInBoundary } from "../../../../lib/ai/prompt-defense";
import { AiChatMessage } from "../../../../lib/ai/types";

const SYSTEM_PROMPT_CONCIERGE = `You are the AI Luxury Beauty Concierge for 'Makeovers by Prachi', a premier bridal and high-fashion makeup studio specializing in Indian Bridal, Destination Weddings, Reception, and Airbrush Makeup.

Your role:
- Provide warm, elegant, expert makeup consultation and skincare prep advice.
- Assist brides and clients in choosing the best package (e.g., Imperial Bridal, Royal HD Makeup, Royal Airbrush, Celebration Glam).
- Recommend HD Airbrush and specialized products for humid outdoor destinations (e.g. Udaipur, Jaipur, Goa).
- Maintain an encouraging, professional, and sophisticated tone.

IMPORTANT BOUNDARIES:
- You DO NOT negotiate or alter official pricing, travel fees, or deposit percentages.
- Remind users that formal quotes and 5-minute slot holds are generated during the booking checkout flow.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPrompt, eventType, location, skinType, userId = "anonymous" } = body;

    if (!userPrompt) {
      return NextResponse.json({ error: "Missing required field 'userPrompt'" }, { status: 400 });
    }

    const messages: AiChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_CONCIERGE },
      {
        role: "user",
        content: `Client Context: Event='${eventType || "Bridal"}', Location='${location || "Rajasthan"}', SkinType='${skinType || "Combination"}'.\nQuery: ${userPrompt}`,
      },
    ];

    // Boundary check
    const boundaryCheck = checkDeterministicBoundaries("BEAUTY_CONCIERGE", messages);
    if (!boundaryCheck.safe) {
      return NextResponse.json({ error: boundaryCheck.reason }, { status: 400 });
    }

    const sanitizedMessages: AiChatMessage[] = messages.map((m) =>
      m.role === "user" ? { ...m, content: wrapUserPromptInBoundary(m.content) } : m
    );

    const startTime = Date.now();
    const response = await executeAiGatewayRequest(
      {
        feature: "BEAUTY_CONCIERGE",
        messages: sanitizedMessages,
        userId,
        userRole: "customer",
      },
      `concierge_${Date.now()}`
    );

    // Audit log
    await logAiToolCall({
      userId,
      userRole: "customer",
      feature: "BEAUTY_CONCIERGE",
      provider: response.providerUsed,
      model: response.modelUsed,
      promptHash: hashPrompt(sanitizedMessages),
      tokensUsed: response.tokensUsed,
      durationMs: Date.now() - startTime,
      isMutationRequested: false,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      recommendation: response.content,
      providerUsed: response.providerUsed,
      modelUsed: response.modelUsed,
    });
  } catch (err: any) {
    console.error("[Server API /api/ai/concierge] Error:", err);
    return NextResponse.json(
      { error: "Beauty Concierge consultation service encountered an error." },
      { status: 500 }
    );
  }
}
