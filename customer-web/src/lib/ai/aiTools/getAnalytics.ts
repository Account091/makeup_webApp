import { AiAuthContext, AiToolDefinition } from "../types";

export const getAnalyticsTool: AiToolDefinition = {
  toolName: "getAnalytics",
  description: "Retrieves business intelligence analytics for authorized admin roles",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"],
  actionType: "READ",
  inputSchema: { timeframe: "string" },
  outputSchema: { totalBookings: "number", totalRevenueINR: "number", conversionRate: "number" },

  authorization: async (auth: AiAuthContext): Promise<boolean> => {
    return ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"].includes(auth.role);
  },

  execute: async (): Promise<any> => {
    return {
      timeframe: "30_DAYS",
      totalBookings: 42,
      pendingVerifications: 3,
      totalRevenueINR: 1185000,
      conversionRate: 0.78,
    };
  },
};
