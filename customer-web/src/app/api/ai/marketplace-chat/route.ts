import { NextRequest, NextResponse } from "next/server";
import { generateAIChatDraft, screenMessageSafety } from "../../../../lib/ai/marketplace-chat-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, text, conversationId, mode } = body;

    const queryText = prompt || text;
    if (!queryText || !conversationId) {
      return NextResponse.json(
        { success: false, error: "Text prompt and conversationId are required" },
        { status: 400 }
      );
    }

    // Safety screening
    const safety = screenMessageSafety(queryText);
    if (!safety.safe) {
      return NextResponse.json({
        success: false,
        flagged: true,
        flagReason: safety.flagReason,
        error: `Message flagged for safety review: ${safety.flagReason}`,
      });
    }

    const aiResponse = generateAIChatDraft(queryText, conversationId, mode || "AI_SUGGEST");

    return NextResponse.json({
      success: true,
      aiResponse,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
