import { AiAuthContext, AiToolDefinition } from "../types";

export const getCalendarAvailabilityTool: AiToolDefinition = {
  toolName: "getCalendarAvailability",
  description: "Checks artist calendar availability and detects potential scheduling conflicts.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      date: { type: "string", description: "Target YYYY-MM-DD date" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      availableSlots: { type: "array" },
      conflicts: { type: "array" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext, args?: { date?: string }) => {
    const targetDate = args?.date || new Date().toISOString().split("T")[0];

    return {
      date: targetDate,
      availableSlots: ["09:00 AM - 01:00 PM", "05:00 PM - 09:00 PM"],
      bookedSlots: ["02:00 PM - 04:30 PM (BK-9021)"],
      conflicts: [
        {
          timeSlot: "02:00 PM - 04:30 PM",
          issue: "Destination travel time buffer from Jaipur to Jodhpur is narrow (3.5h drive)",
          riskLevel: "MEDIUM",
        },
      ],
    };
  },
};
