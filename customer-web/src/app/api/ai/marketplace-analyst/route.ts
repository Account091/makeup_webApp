import { NextRequest, NextResponse } from "next/server";
import { answerMarketplaceAnalystQuery } from "../../../../lib/ai/marketplace-ai-analyst";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.query;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const aiAnalystResponse = answerMarketplaceAnalystQuery(prompt);

    return NextResponse.json({
      success: true,
      aiAnalystResponse,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
