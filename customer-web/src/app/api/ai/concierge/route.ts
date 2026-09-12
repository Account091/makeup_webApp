import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPrompt, eventType, skinType, authPayload } = body;

    if (!userPrompt) {
      return NextResponse.json({ error: "Missing required field 'userPrompt'" }, { status: 400 });
    }

    const auth: AiAuthContext = {
      uid: authPayload?.uid || "customer_guest",
      role: "CUSTOMER",
      organizationId: "makeovers_by_prachi",
      customerId: authPayload?.customerId || authPayload?.uid,
      requestId: `req_concierge_${Date.now()}`,
    };

    const messages = [
      {
        role: "user" as const,
        content: `Event Context: Event='${eventType || "Bridal"}', SkinType='${skinType || "Combination"}'.\nQuery: ${userPrompt}`,
      },
    ];

    const result = await handleAIRequest({
      feature: "CUSTOMER_CONCIERGE",
      messages,
      auth,
    });

    return NextResponse.json({
      success: true,
      recommendation: result.content,
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
