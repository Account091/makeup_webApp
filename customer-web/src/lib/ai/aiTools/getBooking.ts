import { AiAuthContext, AiToolDefinition } from "../types";
import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const getBookingTool: AiToolDefinition = {
  toolName: "getBooking",
  description: "Retrieves specific booking record for the authorized client or admin",
  requiredRole: ["CUSTOMER", "ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: { bookingId: "string" },
  outputSchema: { bookingId: "string", serviceTitle: "string", status: "string", depositAmount: "number" },

  authorization: async (auth: AiAuthContext, args?: any): Promise<boolean> => {
    if (["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role)) return true;
    if (!args?.bookingId) return false;
    // Customer authorization check will be checked in query
    return auth.role === "CUSTOMER";
  },

  execute: async (auth: AiAuthContext, args?: any): Promise<any> => {
    if (!args?.bookingId) return { error: "Missing bookingId" };
    const q = query(collection(db, "bookings"), where("bookingId", "==", args.bookingId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return { error: "Booking not found" };
    const data = snap.docs[0].data();

    // Verify customer ownership if customer
    if (auth.role === "CUSTOMER" && data.customerDetails?.phone !== auth.customerId && data.customerDetails?.phone !== auth.uid) {
      return { error: "Unauthorized access to this booking document" };
    }

    return {
      bookingId: data.bookingId,
      serviceTitle: data.serviceTitle,
      status: data.status,
      eventDate: data.eventDetails?.eventDate,
      totalAmount: data.commercials?.totalAmount,
      depositRequired: data.commercials?.depositRequired,
    };
  },
};
