import { AiAuthContext, AiToolDefinition } from "../types";

export const getRecentSupportTicketsTool: AiToolDefinition = {
  toolName: "getRecentSupportTickets",
  description: "Retrieves recent customer support queries, change requests, or venue updates.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      status: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      tickets: { type: "array" },
      openCount: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext) => {
    return {
      tickets: [
        {
          ticketId: "TCK-104",
          customerName: "Ritu Singhania",
          phone: "+91 9776655443",
          subject: "Requesting timing shift for Sangeet look",
          category: "SCHEDULE_CHANGE",
          status: "OPEN",
          createdAt: "2026-09-13T09:30:00Z",
        },
      ],
      openCount: 1,
    };
  },
};
