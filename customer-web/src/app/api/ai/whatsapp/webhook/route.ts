import { NextResponse } from "next/server";
import crypto from "crypto";
import { handleAIRequest } from "../../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../../lib/ai/types";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { sendWhatsAppMessageToCustomer } from "../../../../../lib/ai/whatsapp-sender";

// ----------------------------------------------------------------------
// 1. Meta Webhook GET Verification Handler
// ----------------------------------------------------------------------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    process.env.WHATSAPP_VERIFY_TOKEN ||
    "mbp_whatsapp_verify_token_2026";

  if (mode === "subscribe" && token === verifyToken && challenge) {
    console.log("[WhatsApp Webhook] Verification GET successful! Challenge returned.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[WhatsApp Webhook] Verification GET failed: Invalid verify token or mode.");
  return new Response("Forbidden", { status: 403 });
}

// ----------------------------------------------------------------------
// 2. Meta Webhook POST Message & Event Processing Handler
// ----------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const rawText = await req.text();
    const signatureHeader = req.headers.get("x-hub-signature-256") || "";
    const appSecret = process.env.META_APP_SECRET;

    // ------------------------------------------------------------------
    // HMAC-SHA256 Signature Verification (if META_APP_SECRET is configured)
    // ------------------------------------------------------------------
    if (appSecret && signatureHeader) {
      const expectedSignature =
        "sha256=" +
        crypto.createHmac("sha256", appSecret).update(rawText).digest("hex");

      const sigBuffer = Buffer.from(signatureHeader);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        console.warn("[WhatsApp Webhook] Invalid HMAC-SHA256 signature header.");
        return new Response("Forbidden: Invalid signature", { status: 403 });
      }
    }

    let body: any = {};
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Record Raw Webhook Event in whatsappWebhookEvents/{eventId}
    const eventRef = doc(collection(db, "whatsappWebhookEvents"));
    await setDoc(eventRef, {
      eventId: eventRef.id,
      receivedAt: new Date().toISOString(),
      object: body.object || "whatsapp_business_account",
      payload: body,
      processingStatus: "RECEIVED",
    });

    // Handle Direct API simulation test payloads
    let senderPhone = body.phone || "+919829012345";
    let messageText = body.message || body.text || "Hi, I want bridal makeup.";
    let mediaUrl = body.mediaUrl || null;
    let isImage = body.isImage || Boolean(mediaUrl);
    let metaMessageId = body.metaMessageId || `wamid_${Date.now()}`;
    let isMetaEnvelope = false;

    // Detect Meta Webhook Envelope Payload
    if (body.entry?.[0]?.changes?.[0]?.value) {
      isMetaEnvelope = true;
      const value = body.entry[0].changes[0].value;
      const metadata = value.metadata || {};
      const phoneNumberId = metadata.phone_number_id || null;

      // ----------------------------------------------------------------
      // A. Process Incoming Customer Messages
      // ----------------------------------------------------------------
      if (value.messages && Array.isArray(value.messages) && value.messages.length > 0) {
        const msgObj = value.messages[0];
        senderPhone = `+${msgObj.from}`;
        metaMessageId = msgObj.id;

        if (msgObj.type === "text") {
          messageText = msgObj.text?.body || "";
        } else if (msgObj.type === "image") {
          isImage = true;
          messageText = msgObj.caption || "Payment screenshot sent via WhatsApp";
          mediaUrl = msgObj.image?.url || "https://firebase-storage.example.com/payment_screenshot.jpg";
        }

        // Idempotency check: Ignore duplicate webhook retries from Meta
        const existingMsgRef = doc(db, "whatsappMessages", metaMessageId);
        const existingMsgSnap = await getDoc(existingMsgRef);
        if (existingMsgSnap.exists()) {
          console.log(`[WhatsApp Webhook] Duplicate message ${metaMessageId} ignored.`);
          await updateDoc(eventRef, { processingStatus: "PROCESSED_DUPLICATE" });
          return NextResponse.json({ success: true, duplicate: true });
        }
      }

      // ----------------------------------------------------------------
      // B. Process Message Delivery Status Notifications (sent/delivered/read/failed)
      // ----------------------------------------------------------------
      if (value.statuses && Array.isArray(value.statuses) && value.statuses.length > 0) {
        for (const statusObj of value.statuses) {
          const statusId = statusObj.id;
          const statusRef = doc(collection(db, "whatsappMessageStatuses"));
          await setDoc(statusRef, {
            statusId: statusRef.id,
            eventId: eventRef.id,
            messageId: statusId,
            phoneNumberId,
            recipientId: statusObj.recipient_id || null,
            status: statusObj.status || null,
            timestamp: statusObj.timestamp || null,
            rawStatus: statusObj,
            receivedAt: new Date().toISOString(),
          });

          // Update deliveryStatus on original message if it exists
          const origMsgRef = doc(db, "whatsappMessages", statusId);
          const origMsgSnap = await getDoc(origMsgRef);
          if (origMsgSnap.exists()) {
            await updateDoc(origMsgRef, {
              deliveryStatus: statusObj.status || null,
              lastStatusAt: new Date().toISOString(),
            });
          }
        }

        await updateDoc(eventRef, { processingStatus: "PROCESSED_STATUS_ONLY" });
        return NextResponse.json({ success: true, statusLogged: true });
      }
    }

    // ------------------------------------------------------------------
    // Conversation Management in whatsappConversations/{id}
    // ------------------------------------------------------------------
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
    const inboundMsgRef = doc(db, "whatsappMessages", metaMessageId);
    await setDoc(inboundMsgRef, {
      messageId: metaMessageId,
      eventId: eventRef.id,
      conversationId,
      customerPhone: senderPhone,
      direction: "INBOUND",
      messageType: isImage ? "image" : "text",
      messageText,
      mediaReference: mediaUrl,
      timestamp: new Date().toISOString(),
      providerMessageId: metaMessageId,
      aiGenerated: false,
      status: "RECEIVED",
      deliveryStatus: "received",
    });

    // If AI is paused or requires human handoff, skip auto-reply
    if (!aiEnabled || currentStatus === "PAUSED" || currentStatus === "HANDOFF_REQUIRED") {
      await updateDoc(eventRef, { processingStatus: "PROCESSED_HUMAN_HANDOFF" });
      return NextResponse.json({
        success: true,
        message: "AI Automation is currently paused for this conversation. Message routed to Admin Inbox.",
        aiReplied: false,
        conversationStatus: currentStatus,
      });
    }

    // ------------------------------------------------------------------
    // AI Assistant Processing via Universal AI Gateway
    // ------------------------------------------------------------------
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

    // Detect human escalation trigger
    let nextStatus = currentStatus;
    if (actionType === "HANDOFF_REQUIRED" || aiResult.requiresHumanApproval) {
      const lowerMsg = messageText.toLowerCase();
      if (
        lowerMsg.includes("refund") ||
        lowerMsg.includes("dispute") ||
        lowerMsg.includes("angry") ||
        lowerMsg.includes("complain") ||
        lowerMsg.includes("reschedule")
      ) {
        nextStatus = "HANDOFF_REQUIRED";
        await updateDoc(convRef, {
          status: "HANDOFF_REQUIRED",
          aiEnabled: false,
          lastMessageAt: new Date().toISOString(),
        });

        await addDoc(collection(db, "whatsappHandoffs"), {
          conversationId,
          phone: senderPhone,
          reason: `Human handoff triggered by customer message: "${messageText}"`,
          status: "OPEN",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Dispatch Outbound Message to Customer via Meta Cloud API
    const metaSendResult = await sendWhatsAppMessageToCustomer({
      toPhone: senderPhone,
      messageText: aiReplyText,
    });

    // Record Outbound Message in whatsappMessages/{id}
    const outboundMsgRef = doc(collection(db, "whatsappMessages"));
    await setDoc(outboundMsgRef, {
      messageId: outboundMsgRef.id,
      conversationId,
      customerPhone: senderPhone,
      direction: "OUTBOUND",
      messageType: "text",
      messageText: aiReplyText,
      timestamp: new Date().toISOString(),
      providerMessageId: metaSendResult.metaMessageId || `wamid_out_${Date.now()}`,
      aiGenerated: true,
      status: metaSendResult.success ? "SENT" : "FAILED",
      requestId: aiResult.requestId,
    });

    // Update Conversation Last Message Snippet
    await updateDoc(convRef, {
      lastMessageAt: new Date().toISOString(),
      lastMessageSnippet: aiReplyText,
    });

    await updateDoc(eventRef, { processingStatus: "PROCESSED_SUCCESS" });

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
