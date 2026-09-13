import { AiAuthContext, AiToolDefinition } from "../types";

export const getMarketingPerformanceTool: AiToolDefinition = {
  toolName: "getMarketingPerformance",
  description: "Retrieves lead sources breakdown and marketing conversion metrics.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "CONTENT_MANAGER"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {},
  },
  outputSchema: {
    type: "object",
    properties: {
      channels: { type: "array" },
      conversionRate: { type: "string" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "CONTENT_MANAGER"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext) => {
    return {
      channels: [
        { channel: "Instagram Reels & DMs", leads: 42, converted: 12, conversionRate: "28.5%" },
        { channel: "Website AI Concierge", leads: 28, converted: 10, conversionRate: "35.7%" },
        { channel: "WhatsApp Inquiries", leads: 15, converted: 6, conversionRate: "40.0%" },
        { channel: "Referrals & Word of Mouth", leads: 8, converted: 5, conversionRate: "62.5%" },
      ],
      overallConversionRate: "35.2%",
    };
  },
};
