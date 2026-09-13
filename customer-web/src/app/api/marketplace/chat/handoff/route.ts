import { NextRequest, NextResponse } from "next/server";
import { conversationsStore, createSystemMessage } from "../../../../../lib/marketplace/chat-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, reason } = body;

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "conversationId is required" }, { status: 400 });
    }

    const conversation = conversationsStore.find((c) => c.conversationId === conversationId);
    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    conversation.status = "HUMAN_HANDOFF";
    conversation.updatedAt = new Date().toISOString();

    const systemMsg = createSystemMessage(
      conversationId,
      "HUMAN_HANDOFF_TRIGGERED",
      `Conversation transferred to human support team. Reason: ${reason || "Manual Handoff Request"}`
    );

    return NextResponse.json({ success: true, conversation, systemMsg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
