export interface WhatsAppSimulationPayload {
  phone: string;
  message: string;
  mediaUrl?: string;
  isImage?: boolean;
}

export interface WhatsAppSimulationResponse {
  success: boolean;
  aiReplied: boolean;
  conversationId: string;
  replyText: string;
  conversationStatus: string;
  providerUsed?: string;
  modelUsed?: string;
  requestId?: string;
  error?: string;
}

export interface WhatsAppAdminActionPayload {
  action: "PAUSE_AI" | "RESUME_AI" | "TAKE_OVER" | "RESOLVE_HANDOFF";
  conversationId: string;
  adminUid?: string;
  authPayload?: {
    role?: string;
  };
}

/**
 * Client helper to simulate or test WhatsApp incoming webhook messages.
 */
export async function simulateWhatsAppMessage(
  payload: WhatsAppSimulationPayload
): Promise<WhatsAppSimulationResponse> {
  const response = await fetch("/api/ai/whatsapp/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "WhatsApp simulation failed.");
  }
  return data;
}

/**
 * Client helper for Admin WhatsApp takeover or pause/resume control.
 */
export async function executeWhatsAppAdminAction(
  payload: WhatsAppAdminActionPayload
): Promise<any> {
  const response = await fetch("/api/ai/whatsapp/admin-action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "WhatsApp admin action failed.");
  }
  return data;
}
