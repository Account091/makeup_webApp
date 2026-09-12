import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query: adminQuery, authPayload, toolName } = body;

    if (!adminQuery) {
      return NextResponse.json({ error: "Missing required field 'query'" }, { status: 400 });
    }

    const auth: AiAuthContext = {
      uid: authPayload?.uid || "admin_user",
      role: authPayload?.role || "ADMIN",
      organizationId: authPayload?.organizationId || "makeovers_by_prachi",
      requestId: `req_copilot_${Date.now()}`,
    };

    const messages = [{ role: "user" as const, content: adminQuery }];

    const result = await handleAIRequest({
      feature: "ADMIN_COPILOT",
      messages,
      auth,
      toolName,
    });

    return NextResponse.json({
      success: true,
      summary: result.content,
      providerUsed: result.provider,
      modelUsed: result.model,
      requiresHumanApproval: result.requiresHumanApproval,
      toolExecuted: result.toolExecuted,
      requestId: result.requestId,
    });
  } catch (err: any) {
    console.error("[API /api/ai/admin-copilot] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Admin Copilot encountered an error." },
      { status: err?.statusCode || 500 }
    );
  }
}
