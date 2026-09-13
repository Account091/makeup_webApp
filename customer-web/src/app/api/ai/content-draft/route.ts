import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      contentType = "INSTAGRAM_POST",
      platform = "INSTAGRAM",
      serviceId,
      campaignId,
      topic,
      tone = "Luxury & Royal",
      language = "English",
      keywords = [],
      callToAction,
      authPayload,
    } = body;

    if (!topic && !serviceId) {
      return NextResponse.json(
        { error: "Missing required field 'topic' or 'serviceId'" },
        { status: 400 }
      );
    }

    const role = authPayload?.role || "CONTENT_MANAGER";
    const allowedRoles = ["ADMIN", "OWNER", "MANAGER", "CONTENT_MANAGER"];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Unauthorized: Role '${role}' is not authorized to use CONTENT_DRAFTER feature.` },
        { status: 403 }
      );
    }

    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const auth: AiAuthContext = {
      uid: authPayload?.uid || "content_manager",
      role: role,
      organizationId: "makeovers_by_prachi",
      requestId: `req_draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const promptText = `Generate content draft:
Type: '${contentType}'
Platform: '${platform}'
ServiceId: '${serviceId || "signature-bridal"}'
CampaignId: '${campaignId || "general-bridal"}'
Topic: '${topic || "Royal Bridal Makeover"}'
Tone: '${tone}'
Language: '${language}'
Keywords: '${keywords.join(", ")}'
CallToAction: '${callToAction || "Book via WhatsApp or Website"}'`;

    const result = await handleAIRequest(
      {
        feature: "CONTENT_DRAFTER",
        messages: [{ role: "user" as const, content: promptText }],
        auth,
      },
      true // Enable structured response
    );

    const structured = result.structuredResponse;

    const generatedContent = {
      title: structured?.data?.title || `${topic || "Luxury Bridal Makeover"} Draft`,
      body: structured?.data?.body || result.content,
      caption: structured?.data?.caption || result.content,
      hashtags: structured?.data?.hashtags || [
        "#MakeoversByPrachi",
        "#BridalMakeupJaipur",
        "#RoyalBridal",
        "#DestinationWeddingIndia",
      ],
      seoTitle: structured?.data?.seoTitle || `${topic || "Bridal Makeup"} | Makeovers by Prachi`,
      seoDescription:
        structured?.data?.seoDescription ||
        "Book Signature Royal Bridal & HD Airbrush Makeover by Prachi in Jaipur, Jodhpur & Udaipur.",
      callToAction: structured?.data?.callToAction || "Book your consultation date today.",
      sourceReferences: structured?.data?.sourceReferences || ["service:royal-bridal", "brand:makeovers-by-prachi"],
      requiresHumanApproval: true, // ALWAYS true
    };

    return NextResponse.json({
      success: true,
      draftId,
      contentType,
      platform,
      generatedContent,
      status: "AI_GENERATED",
      providerUsed: result.provider,
      modelUsed: result.model,
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
