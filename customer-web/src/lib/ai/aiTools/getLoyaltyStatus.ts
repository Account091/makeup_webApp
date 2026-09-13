import { AiAuthContext, AiToolDefinition } from "../types";

export const getLoyaltyStatusTool: AiToolDefinition = {
  toolName: "getLoyaltyStatus",
  description: "Retrieves customer loyalty tier, rewards points, and repeat booking benefits.",
  requiredRole: ["CUSTOMER", "GUEST", "ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      tier: { type: "string" },
      points: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => true,
  execute: async (auth: AiAuthContext) => {
    return {
      tier: "Royal Bride Circle",
      points: 1250,
      perks: ["Complimentary Sangeet Touch-Up Kit", "Priority Calendar Hold"],
    };
  },
};
