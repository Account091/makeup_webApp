/**
 * Meta WhatsApp Cloud API Outbound Message Sender
 * Sends real WhatsApp messages from Makeovers by Prachi (Sender) to the Booking Customer (Recipient).
 */

export interface SendWhatsAppParams {
  toPhone: string; // Customer's WhatsApp phone number (e.g., "+919829012345")
  messageText: string;
  templateName?: string;
  templateLanguage?: string;
}

export async function sendWhatsAppMessageToCustomer(params: SendWhatsAppParams): Promise<{ success: boolean; metaMessageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1249797228224448";

  // Sanitize phone number to digits with country code (e.g. 919829012345)
  let cleanPhone = params.toPhone.replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  if (!token) {
    console.log(`[WhatsApp Sender Simulation] Outbound message to ${cleanPhone}: "${params.messageText}"`);
    return {
      success: true,
      metaMessageId: `wamid_sim_${Date.now()}`,
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    
    let bodyPayload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: {
        preview_url: false,
        body: params.messageText,
      },
    };

    // If template message is specified
    if (params.templateName) {
      bodyPayload = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: params.templateName,
          language: { code: params.templateLanguage || "en_US" },
        },
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Meta WhatsApp API Error]:", data);
      return {
        success: false,
        error: data.error?.message || "Failed to dispatch WhatsApp message via Meta API.",
      };
    }

    const metaMessageId = data.messages?.[0]?.id || `wamid_${Date.now()}`;
    console.log(`[Meta WhatsApp API Success] Sent message #${metaMessageId} to ${cleanPhone}`);

    return {
      success: true,
      metaMessageId,
    };
  } catch (err: any) {
    console.error("[WhatsApp Outbound Exception]:", err);
    return {
      success: false,
      error: err.message || "Network exception sending WhatsApp message.",
    };
  }
}
