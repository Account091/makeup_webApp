import { NextRequest, NextResponse } from "next/server";
import { reportConversation } from "../../../../../lib/marketplace/chat-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, reportedBy, reason, description } = body;

    if (!conversationId || !reportedBy || !reason || !description) {
      return NextResponse.json(
        { success: false, error: "conversationId, reportedBy, reason, description required" },
        { status: 400 }
      );
    }

    const report = reportConversation({
      conversationId,
      reportedBy,
      reason,
      description,
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
