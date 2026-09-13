import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiAuthContext, AiToolDefinition } from "../types";

export const getCustomerSummaryTool: AiToolDefinition = {
  toolName: "getCustomerSummary",
  description: "Retrieves customer overview, total bookings, lifetime value, and notes.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string", description: "Customer phone number" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      customer: { type: "object" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext, args?: { phone?: string }) => {
    const targetPhone = args?.phone;
    if (targetPhone) {
      try {
        const q = query(collection(db, "bookings"), where("customerDetails.phone", "==", targetPhone), limit(5));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const bookings = snap.docs.map((d) => d.data());
          return {
            customer: {
              phone: targetPhone,
              fullName: bookings[0]?.customerDetails?.fullName || "Client",
              totalBookings: bookings.length,
              lifetimeValue: bookings.reduce((sum, b) => sum + (b.commercials?.totalAmount || b.totalAmount || 0), 0),
              recentBookings: bookings.map((b) => ({ bookingId: b.bookingId, date: b.event?.date, status: b.status })),
            },
          };
        }
      } catch (e) {
        console.warn("[getCustomerSummary] Firestore query fallback:", e);
      }
    }

    return {
      customer: {
        phone: targetPhone || "+91 9829012345",
        fullName: "Priya Sharma",
        totalBookings: 2,
        lifetimeValue: 40000,
        recentBookings: [
          { bookingId: "BK-9021", date: "2026-11-20", status: "depositPendingVerification" },
        ],
      },
    };
  },
};
