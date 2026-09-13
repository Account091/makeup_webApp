import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPrompt, chatHistory, eventType, skinType, authPayload } = body;

    if (!userPrompt && (!chatHistory || chatHistory.length === 0)) {
      return NextResponse.json(
        { error: "Missing required field 'userPrompt' or 'chatHistory'" },
        { status: 400 }
      );
    }

    const customerId = authPayload?.customerId || authPayload?.phone || authPayload?.uid || "customer_guest";

    const auth: AiAuthContext = {
      uid: authPayload?.uid || customerId,
      role: "CUSTOMER",
      organizationId: "makeovers_by_prachi",
      customerId: customerId,
      requestId: `req_concierge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const messages = [];

    if (chatHistory && Array.isArray(chatHistory)) {
      messages.push(...chatHistory);
    }

    if (userPrompt) {
      let promptContent = userPrompt;
      if (eventType || skinType) {
        promptContent = `[Event context: Event='${eventType || "Bridal"}', SkinType='${skinType || "Normal"}']\n${userPrompt}`;
      }
      messages.push({
        role: "user" as const,
        content: promptContent,
      });
    }

    const result = await handleAIRequest(
      {
        feature: "CUSTOMER_CONCIERGE",
        messages,
        auth,
      },
      true // Require structured JSON output
    );

    const structured = result.structuredResponse;

    return NextResponse.json({
      success: true,
      answer: structured?.answer || result.content,
      sources: structured?.data?.sources || ["service:royal-bridal", "policy:general-concierge"],
      recommendations: structured?.data?.recommendations || [
        "Bridal packages & pricing",
        "Check my booking status",
        "Jaipur travel policy",
      ],
      requiresHumanAction: structured?.requiresHumanApproval || false,
      actionType: structured?.recommendedMutationAction?.actionType || null,
      providerUsed: result.provider,
      modelUsed: result.model,
      requestId: result.requestId,
    });
  } catch (err: any) {
    console.error("[API /api/ai/concierge] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Concierge AI service encountered an error." },
      { status: err?.statusCode || 500 }
    );
  }
}
