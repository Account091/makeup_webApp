import { AiAuthContext, AiToolDefinition } from "../types";

export const getRevenueSummaryTool: AiToolDefinition = {
  toolName: "getRevenueSummary",
  description: "Retrieves overall business revenue, collected deposits, and pending balances.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      period: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      totalBookedValue: { type: "number" },
      depositsCollected: { type: "number" },
      pendingBalances: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext) => {
    return {
      period: "Current Month",
      totalBookedValue: 605000,
      depositsCollected: 181500,
      pendingBalances: 423500,
      verifiedUpiTransactions: 15,
      pendingVerificationValue: 7500,
    };
  },
};
