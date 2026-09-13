import { NextRequest, NextResponse } from "next/server";
import {
  getAuthorizedConversations,
  createOrGetConversation,
  attachBookingToConversation,
} from "../../../../../lib/marketplace/chat-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "cust-101";
    const userRole = (searchParams.get("role") || "CUSTOMER") as any;
    const status = searchParams.get("status") || undefined;

    const conversations = getAuthorizedConversations(userId, userRole, status);
    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, customerId, artistId, listingId, bookingId, action, conversationId } = body;

    if (action === "ATTACH_BOOKING") {
      if (!conversationId || !bookingId || !customerId) {
        return NextResponse.json({ success: false, error: "conversationId, bookingId, customerId required" }, { status: 400 });
      }
      const updated = attachBookingToConversation({
        conversationId,
        bookingId,
        requestingUserId: customerId,
      });
      return NextResponse.json({ success: true, conversation: updated });
    }

    if (!organizationId || !customerId || !artistId) {
      return NextResponse.json(
        { success: false, error: "organizationId, customerId, artistId are required" },
        { status: 400 }
      );
    }

    const conversation = createOrGetConversation({
      organizationId,
      customerId,
      artistId,
      listingId,
      bookingId,
      createdFrom: body.createdFrom || (bookingId ? "BOOKING_LINKED" : "MARKETPLACE_PROFILE"),
    });

    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
