import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiAuthContext, AiToolDefinition } from "../types";

export const getBookingScheduleTool: AiToolDefinition = {
  toolName: "getBookingSchedule",
  description: "Retrieves event start time, readyBy deadline, and artist arrival time for a booking.",
  requiredRole: ["CUSTOMER", "GUEST", "ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string" },
      bookingId: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      appointmentStart: { type: "string" },
      readyByTime: { type: "string" },
      artistArrivalTime: { type: "string" },
    },
  },
  authorization: async (auth: AiAuthContext) => true,
  execute: async (auth: AiAuthContext, args?: { phone?: string; bookingId?: string }) => {
    return {
      bookingId: args?.bookingId || "BK-9021",
      eventDate: "2026-11-20",
      artistArrivalTime: "10:30 AM",
      appointmentStart: "11:00 AM",
      readyByTime: "03:00 PM (Before Baraat Arrival)",
      location: "Gorbandh Palace, Jodhpur",
    };
  },
};
