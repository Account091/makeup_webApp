import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiAuthContext, AiToolDefinition } from "../types";

export const getUpcomingEventsTool: AiToolDefinition = {
  toolName: "getUpcomingEvents",
  description: "Retrieves upcoming makeover events for the next 7 to 30 days.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      daysAhead: { type: "number" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      upcomingEvents: { type: "array" },
      count: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext, args?: { daysAhead?: number }) => {
    return {
      upcomingEvents: [
        {
          bookingId: "BK-9021",
          customerName: "Priya Sharma",
          eventDate: "2026-09-14",
          serviceTitle: "Signature Royal Bridal Makeover",
          city: "Jodhpur",
          venue: "Gorbandh Palace",
        },
        {
          bookingId: "BK-9022",
          customerName: "Neha Gupta",
          eventDate: "2026-09-15",
          serviceTitle: "Pre-Wedding Glam",
          city: "Jaipur",
          venue: "Rambagh Palace",
        },
      ],
      count: 2,
    };
  },
};
