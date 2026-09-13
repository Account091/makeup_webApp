import { NextRequest, NextResponse } from "next/server";
import {
  getMessagesForConversation,
  sendMessage,
  markConversationRead,
} from "../../../../../lib/marketplace/chat-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const userId = searchParams.get("userId") || "cust-101";
    const role = (searchParams.get("role") || "CUSTOMER") as any;

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "conversationId is required" }, { status: 400 });
    }

    const messages = getMessagesForConversation(conversationId, userId, role);
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, senderType, senderId, messageType, text, mediaUrl } = body;

    if (!conversationId || !senderType || !senderId || !text) {
      return NextResponse.json(
        { success: false, error: "conversationId, senderType, senderId, text required" },
        { status: 400 }
      );
    }

    const message = sendMessage({
      conversationId,
      senderType,
      senderId,
      messageType,
      text,
      mediaUrl,
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, userId, userRole } = body;

    if (!conversationId || !userId || !userRole) {
      return NextResponse.json({ success: false, error: "conversationId, userId, userRole required" }, { status: 400 });
    }

    const updated = markConversationRead(conversationId, userId, userRole);
    return NextResponse.json({ success: true, markedRead: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
