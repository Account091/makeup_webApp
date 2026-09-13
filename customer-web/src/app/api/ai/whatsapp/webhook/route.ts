import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../../lib/ai/types";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";

// Meta Webhook Verification Handler (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "mbp_whatsapp_verify_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful!");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden: Invalid verify token" }, { status: 403 });
}

// Meta Webhook Message Processing Handler (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support direct API payload testing or Meta webhook envelope payload
    let senderPhone = body.phone || "+919829012345";
    let messageText = body.message || body.text || "Hi, I want bridal makeup.";
    let mediaUrl = body.mediaUrl || null;
    let isImage = body.isImage || Boolean(mediaUrl);
    let metaMessageId = body.metaMessageId || `wamid_${Date.now()}`;

    // If Meta payload structure is detected:
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msgObj = body.entry[0].changes[0].value.messages[0];
      senderPhone = `+${msgObj.from}`;
      metaMessageId = msgObj.id;

      if (msgObj.type === "text") {
        messageText = msgObj.text?.body || "";
      } else if (msgObj.type === "image") {
        isImage = true;
        messageText = msgObj.caption || "Payment screenshot sent via WhatsApp";
        mediaUrl = msgObj.image?.url || "https://firebase-storage.example.com/payment_screenshot.jpg";
      }
    }

    const conversationId = `conv_${senderPhone.replace(/[^0-9]/g, "")}`;
    const convRef = doc(db, "whatsappConversations", conversationId);
    let convSnap = await getDoc(convRef);

    let aiEnabled = true;
    let currentStatus = "ACTIVE";

    if (convSnap.exists()) {
      const convData = convSnap.data();
      aiEnabled = convData.aiEnabled ?? true;
      currentStatus = convData.status || "ACTIVE";
    } else {
      // Create new WhatsApp conversation
      await setDoc(convRef, {
        conversationId,
        phone: senderPhone,
        customerId: senderPhone,
        channel: "WHATSAPP",
        status: "ACTIVE",
        lastMessageAt: new Date().toISOString(),
        assignedTo: null,
        aiEnabled: true,
        createdAt: new Date().toISOString(),
      });
    }

    // Record Inbound Message in whatsappMessages/{id}
    const inboundMsgRef = doc(collection(db, "whatsappMessages"));
    await setDoc(inboundMsgRef, {
      messageId: inboundMsgRef.id,
      conversationId,
      direction: "INBOUND",
      messageType: isImage ? "image" : "text",
      messageText,
      mediaReference: mediaUrl,
      timestamp: new Date().toISOString(),
      providerMessageId: metaMessageId,
      aiGenerated: false,
      status: "RECEIVED",
    });

    // Check if AI automation is paused or requires human handoff
    if (!aiEnabled || currentStatus === "PAUSED" || currentStatus === "HANDOFF_REQUIRED") {
      return NextResponse.json({
        success: true,
        message: "AI Automation is currently paused for this conversation. Message routed to Admin Inbox.",
        aiReplied: false,
        conversationStatus: currentStatus,
      });
    }

    // Prepare AI Gateway Request Context
    const auth: AiAuthContext = {
      uid: senderPhone,
      role: "CUSTOMER",
      organizationId: "makeovers_by_prachi",
      customerId: senderPhone,
      requestId: `req_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    let userPrompt = messageText;
    if (isImage) {
      userPrompt = `[CUSTOMER SENT IMAGE/SCREENSHOT VIA WHATSAPP]\nMedia URL: ${mediaUrl}\nCaption: ${messageText}`;
    }

    // Call Universal AI Gateway
    const aiResult = await handleAIRequest(
      {
        feature: "WHATSAPP_ASSISTANT",
        messages: [{ role: "user" as const, content: userPrompt }],
        auth,
      },
      true
    );

    const structured = aiResult.structuredResponse;
    const aiReplyText = structured?.answer || aiResult.content;
    const actionType = structured?.recommendedMutationAction?.actionType || null;

    // Detect if human handoff is required
    let nextStatus = currentStatus;
    if (actionType === "HANDOFF_REQUIRED" || aiResult.requiresHumanApproval) {
      const lowerMsg = messageText.toLowerCase();
      if (
        lowerMsg.includes("refund") ||
        lowerMsg.includes("dispute") ||
        lowerMsg.includes("angry") ||
        lowerMsg.includes("complain")
      ) {
        nextStatus = "HANDOFF_REQUIRED";
        await updateDoc(convRef, {
          status: "HANDOFF_REQUIRED",
          aiEnabled: false,
          lastMessageAt: new Date().toISOString(),
        });

        // Create Handoff Ticket in whatsappHandoffs/{id}
        await addDoc(collection(db, "whatsappHandoffs"), {
          conversationId,
          phone: senderPhone,
          reason: `Human handoff triggered by customer message: "${messageText}"`,
          status: "OPEN",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Record Outbound Message in whatsappMessages/{id}
    const outboundMsgRef = doc(collection(db, "whatsappMessages"));
    await setDoc(outboundMsgRef, {
      messageId: outboundMsgRef.id,
      conversationId,
      direction: "OUTBOUND",
      messageType: "text",
      messageText: aiReplyText,
      timestamp: new Date().toISOString(),
      providerMessageId: `wamid_out_${Date.now()}`,
      aiGenerated: true,
      status: "SENT",
      requestId: aiResult.requestId,
    });

    // Update Conversation Last Message
    await updateDoc(convRef, {
      lastMessageAt: new Date().toISOString(),
      lastMessageSnippet: aiReplyText,
    });

    return NextResponse.json({
      success: true,
      aiReplied: true,
      conversationId,
      replyText: aiReplyText,
      conversationStatus: nextStatus,
      providerUsed: aiResult.provider,
      modelUsed: aiResult.model,
      requestId: aiResult.requestId,
    });
  } catch (err: any) {
    console.error("[API /api/ai/whatsapp/webhook] Error:", err);
    return NextResponse.json(
      { error: err?.message || "WhatsApp Assistant API error." },
      { status: err?.statusCode || 500 }
    );
  }
}
