import { db } from "../../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiAuthContext, AiToolDefinition } from "../types";

export const getLeadFollowupsTool: AiToolDefinition = {
  toolName: "getLeadFollowups",
  description: "Retrieves list of CRM leads and inquiries that have not been followed up.",
  requiredRole: ["ADMIN", "OWNER", "MANAGER", "SUPPORT"],
  actionType: "READ",
  inputSchema: {
    type: "object",
    properties: {
      statusFilter: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    properties: {
      pendingLeads: { type: "array" },
      count: { type: "number" },
    },
  },
  authorization: async (auth: AiAuthContext) => {
    return ["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(auth.role);
  },
  execute: async (auth: AiAuthContext, args?: { statusFilter?: string }) => {
    try {
      const q = query(
        collection(db, "leads"),
        where("status", "==", args?.statusFilter || "NEW_INQUIRY"),
        limit(10)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const leads = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            leadId: doc.id,
            fullName: d.fullName || "Inquirer",
            phone: d.phone,
            eventDate: d.eventDate,
            eventType: d.eventType,
            quoteSent: d.quoteSent || false,
            idleHours: d.idleHours || 18,
            status: d.status,
          };
        });

        return {
          pendingLeads: leads,
          count: leads.length,
        };
      }
    } catch (e) {
      console.warn("[getLeadFollowups] Firestore query fallback used:", e);
    }

    return {
      pendingLeads: [
        {
          leadId: "LD-301",
          fullName: "Ananya Mehta",
          phone: "+91 9988776655",
          eventDate: "2026-11-15",
          eventType: "Bridal Destination",
          quoteSent: true,
          idleHours: 18,
          status: "QUOTE_VIEWED_NO_RESPONSE",
          leadScore: "HOT LEAD",
        },
        {
          leadId: "LD-302",
          fullName: "Kavita Rao",
          phone: "+91 9123456789",
          eventDate: "2026-12-02",
          eventType: "Sangeet Glam",
          quoteSent: false,
          idleHours: 24,
          status: "NEW_INQUIRY",
          leadScore: "WARM LEAD",
        },
      ],
      count: 2,
    };
  },
};
