import { AiAuthContext, AiToolDefinition } from "../types";

export const getServicePerformanceTool: AiToolDefinition = {
  toolName: "getServicePerformance",
  description: "Retrieves breakdown of service popularity, booking counts, and revenue contribution.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "CONTENT_MANAGER", "ACCOUNTANT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      timeframe: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      servicesPerformance: { type: "array" },
      mostPopular: { type: "string" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "CONTENT_MANAGER", "ACCOUNTANT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext) => {
    return {
      servicesPerformance: [
        {
          serviceTitle: "Signature Royal Bridal Makeover",
          bookingCount: 14,
          revenueGenerated: 350000,
          percentageShare: "58%",
        },
        {
          serviceTitle: "Pre-Wedding & Engagement Glam",
          bookingCount: 8,
          revenueGenerated: 120000,
          percentageShare: "20%",
        },
        {
          serviceTitle: "Destination Bridal Package",
          bookingCount: 3,
          revenueGenerated: 135000,
          percentageShare: "22%",
        },
      ],
      mostPopular: "Signature Royal Bridal Makeover",
    };
  },
};
