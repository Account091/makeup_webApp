import { NextRequest, NextResponse } from "next/server";
import { blockConversation } from "../../../../../lib/marketplace/chat-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, blockedBy, blockType, reason } = body;

    if (!conversationId || !blockedBy || !blockType) {
      return NextResponse.json(
        { success: false, error: "conversationId, blockedBy, blockType required" },
        { status: 400 }
      );
    }

    const block = blockConversation({
      conversationId,
      blockedBy,
      blockType,
      reason,
    });

    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
