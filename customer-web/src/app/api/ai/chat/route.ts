import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, feature = "CUSTOMER_CONCIERGE", authPayload } = body;

    const auth: AiAuthContext = {
      uid: authPayload?.uid || "anonymous_user",
      role: authPayload?.role || "CUSTOMER",
      organizationId: authPayload?.organizationId || "makeovers_by_prachi",
      customerId: authPayload?.customerId || authPayload?.uid,
      requestId: `req_chat_${Date.now()}`,
    };

    const result = await handleAIRequest({
      feature,
      messages,
      auth,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API /api/ai/chat] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process AI chat request" },
      { status: err?.statusCode || 500 }
    );
  }
}
