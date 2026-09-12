import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contentType, topic, targetAudience, authPayload } = body;

    if (!topic) {
      return NextResponse.json({ error: "Missing required field 'topic'" }, { status: 400 });
    }

    const auth: AiAuthContext = {
      uid: authPayload?.uid || "content_manager",
      role: authPayload?.role || "CONTENT_MANAGER",
      organizationId: "makeovers_by_prachi",
      requestId: `req_draft_${Date.now()}`,
    };

    const promptText = `Generate a draft for Type='${contentType || "Instagram Caption"}', Topic='${topic}', TargetAudience='${targetAudience || "Brides"}'. Include luxury tone, call-to-actions, and relevant hashtags.`;

    const result = await handleAIRequest({
      feature: "CONTENT_DRAFTER",
      messages: [{ role: "user", content: promptText }],
      auth,
    });

    return NextResponse.json({
      success: true,
      draftStatus: "DRAFT_PENDING_APPROVAL",
      content: result.content,
      providerUsed: result.provider,
      modelUsed: result.model,
      requiresHumanApproval: true,
      requestId: result.requestId,
    });
  } catch (err: any) {
    console.error("[API /api/ai/content-draft] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Content Drafter encountered an error." },
      { status: err?.statusCode || 500 }
    );
  }
}
