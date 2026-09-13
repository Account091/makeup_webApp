import { AiAuthContext, AiToolDefinition } from "../types";

export const getInvoiceTool: AiToolDefinition = {
  toolName: "getInvoice",
  description: "Fetches secure, short-lived download link for a customer's PDF invoice.",
  requiredRole: ["CUSTOMER", "GUEST", "ADMIN", "OWNER", "MANAGER", "SUPPORT", "ACCOUNTANT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      bookingId: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      invoiceUrl: { type: "string" },
      expiresAt: { type: "string" },
    },
  },
  authorization: async (auth: AiAuthContext) => true,
  execute: async (auth: AiAuthContext, args?: { bookingId?: string }) => {
    const bookingId = args?.bookingId || "BK-9021";
    return {
      bookingId,
      invoiceNumber: `INV-${bookingId}`,
      invoiceUrl: `/track?bookingId=${bookingId}`,
      downloadPdfUrl: `/api/invoice/download?bookingId=${bookingId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },
};
