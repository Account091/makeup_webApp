import { AiAuthContext, AiToolDefinition } from "../types";

export const getOperationalRisksTool: AiToolDefinition = {
  toolName: "getOperationalRisks",
  description: "Analyzes operational risks such as tight travel schedules, pending deposits on upcoming dates, and unassigned staff.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {},
  },
  outputSchema: {
    type: "object",
    properties: {
      risks: { type: "array" },
      totalRisks: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext) => {
    return {
      risks: [
        {
          riskId: "RISK-01",
          severity: "HIGH",
          title: "Tight Travel Buffer (Jaipur to Jodhpur)",
          description: "Booking BK-9021 in Jodhpur starts 3.5 hours after Jaipur morning appointment ends.",
          recommendedAction: "Confirm dedicated driver dispatch and set 1-hour buffer.",
        },
        {
          riskId: "RISK-02",
          severity: "MEDIUM",
          title: "Pending Payment Proof (BK-9921)",
          description: "Event date in 2 days, deposit screenshot pending manual approval.",
          recommendedAction: "Review UTR screenshot or call client Priya Sharma.",
        },
      ],
      totalRisks: 2,
    };
  },
};
