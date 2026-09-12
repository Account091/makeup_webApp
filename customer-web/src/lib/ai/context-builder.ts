import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiAuthContext, AiFeature } from "./types";

export interface ContextBundle {
  systemPrompt: string;
  contextData: Record<string, any>;
}

export async function buildRoleScopedContext(
  feature: AiFeature,
  auth: AiAuthContext
): Promise<ContextBundle> {
  const contextData: Record<string, any> = {};

  if (feature === "CUSTOMER_CONCIERGE") {
    // 1. Customer Scoped Context Retrieval
    if (auth.customerId || auth.uid) {
      try {
        const bookingsQ = query(
          collection(db, "bookings"),
          where("customerDetails.phone", "==", auth.customerId || auth.uid),
          limit(3)
        );
        const snap = await getDocs(bookingsQ);
        contextData.recentBookings = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            bookingId: data.bookingId,
            serviceTitle: data.serviceTitle,
            status: data.status,
            eventDate: data.eventDetails?.eventDate,
          };
        });
      } catch (e) {
        // Non-blocking context fetch fallback
      }
    }

    const systemPrompt = `You are the AI Beauty Concierge for 'Makeovers by Prachi'.
You help customers understand bridal makeup packages, skin preparation, and event recommendations.
Customer Context: ${JSON.stringify(contextData)}
STRICT BOUNDARY: Pricing, travel fees, 5-minute holds, and UTR confirmations are handled strictly by server APIs. Do not negotiate prices.`;

    return { systemPrompt, contextData };
  }

  if (feature === "ADMIN_COPILOT") {
    // 2. Admin Scoped Context Retrieval
    contextData.userRole = auth.role;
    contextData.scope = "BUSINESS_OPERATIONS_SUMMARY";

    const systemPrompt = `You are the Admin AI Copilot for Makeovers by Prachi.
You provide clear, factual summaries of CRM leads, bookings, artist schedules, and support queries.
Admin Context: ${JSON.stringify(contextData)}
STRICT BOUNDARY: You cannot alter database records or prices directly. Provide recommendation drafts for human admin approval.`;

    return { systemPrompt, contextData };
  }

  if (feature === "CONTENT_DRAFTER") {
    const systemPrompt = `You are the AI Content & Marketing Drafter for Makeovers by Prachi.
You generate luxury Instagram captions, WhatsApp promotional messages, reel descriptions, and SEO metadata.
All generated text is marked as DRAFT pending human approval before broadcast.`;

    return { systemPrompt, contextData };
  }

  const systemPrompt = `You are an AI assistant for Makeovers by Prachi. Provide clear, helpful, role-scoped information.`;
  return { systemPrompt, contextData };
}
