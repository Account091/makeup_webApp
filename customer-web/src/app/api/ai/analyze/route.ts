import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt: userPrompt, authPayload } = body;

    const auth: AiAuthContext = {
      uid: authPayload?.uid || "anonymous_user",
      role: authPayload?.role || "CUSTOMER",
      organizationId: "makeovers_by_prachi",
      requestId: `req_analyze_${Date.now()}`,
    };

    const result = await handleAIRequest({
      feature: "VISION_ANALYSIS",
      messages: [{ role: "user", content: userPrompt || "Analyze makeup aesthetic compatibility" }],
      auth,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API /api/ai/analyze] Error:", err);
    return NextResponse.json(
      { error: err?.message || "AI Analysis service encountered an error." },
      { status: err?.statusCode || 500 }
    );
  }
}
