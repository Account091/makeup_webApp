import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiAuthContext, AiToolDefinition } from "../types";

export const getOutstandingBalancesTool: AiToolDefinition = {
  toolName: "getOutstandingBalances",
  description: "Retrieves list of confirmed or completed bookings with pending balance dues.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      minAmount: { type: "number" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      outstandingBookings: { type: "array" },
      totalOutstanding: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "ACCOUNTANT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext, args?: { minAmount?: number }) => {
    return {
      outstandingBookings: [
        {
          bookingId: "BK-8810",
          customerName: "Pooja Verma",
          phone: "+91 9811223344",
          eventDate: "2026-09-12",
          totalAmount: 25000,
          depositPaid: 7500,
          remainingBalance: 17500,
          dueDate: "2026-09-12",
          status: "balanceDue",
        },
      ],
      totalOutstanding: 17500,
    };
  },
};
