import { AiAuthContext, AiToolDefinition } from "../types";
import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const getCustomerProfileTool: AiToolDefinition = {
  toolName: "getCustomerProfile",
  description: "Retrieves role-scoped customer profile data for the authenticated customer or admin",
  requiredRole: ["CUSTOMER", "ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: { customerId: "string" },
  outputSchema: { fullName: "string", phone: "string", email: "string", loyaltyPoints: "number" },

  authorization: async (auth: AiAuthContext, args?: any): Promise<boolean> => {
    if (["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role)) return true;
    if (auth.role === "CUSTOMER" && (args?.customerId === auth.customerId || args?.customerId === auth.uid)) return true;
    return false;
  },

  execute: async (auth: AiAuthContext, args?: any): Promise<any> => {
    const targetId = args?.customerId || auth.customerId || auth.uid;
    const q = query(collection(db, "customerProfiles"), where("uid", "==", targetId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { customerId: targetId, note: "Profile not found or new client" };
    }
    const data = snap.docs[0].data();
    return {
      fullName: data.fullName || "Valued Client",
      phone: data.phone || "N/A",
      email: data.email || "N/A",
      loyaltyPoints: data.loyaltyPoints || 0,
    };
  },
};
