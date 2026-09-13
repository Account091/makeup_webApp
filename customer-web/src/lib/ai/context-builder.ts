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
    // 1. Controlled Public Knowledge Layer
    contextData.publicKnowledge = {
      services: [
        {
          id: "service:royal-bridal",
          title: "Signature Royal Bridal Makeover",
          price: 25000,
          depositAmount: 7500,
          depositPercentage: "30%",
          duration: "4.0 Hours",
          inclusions: [
            "HD Airbrushing / Glass Skin Base",
            "Custom Lash Design & Eye Makeup",
            "Royal Poshak & Dupatta Setting",
            "Bridal Hair Styling & Fresh Flowers",
            "Emergency Touch-Up Kit",
          ],
        },
        {
          id: "service:engagement",
          title: "Pre-Wedding & Engagement Glam",
          price: 15000,
          depositAmount: 4500,
          depositPercentage: "30%",
          duration: "2.5 Hours",
          inclusions: ["Long-Wear HD Base", "Textured Updo", "Lehenga Draping", "Lash Application"],
        },
        {
          id: "service:party",
          title: "Party & Festive Makeover",
          price: 8500,
          depositAmount: 2500,
          depositPercentage: "30%",
          duration: "1.5 Hours",
          inclusions: ["Flawless Base & Eye Look", "Curls / Blowdry Hair Styling", "Basic Draping"],
        },
        {
          id: "service:destination",
          title: "Destination Bridal Package",
          price: 45000,
          depositAmount: 13500,
          depositPercentage: "30%",
          duration: "Full Multi-Event Coverage",
          inclusions: ["Main Wedding + Sangeet Makeovers", "Dedicated On-Venue Artist Station", "Senior Assistant Artist Included"],
        },
      ],
      policies: {
        advanceDeposit: "A 30% advance deposit is mandatory to lock your date. A 5-minute QR reservation hold is provided upon booking.",
        travelAndDestination: "We travel worldwide and across Rajasthan (Jaipur, Jodhpur, Udaipur, Jaisalmer). Travel and stay are billed at actuals.",
        bridalPrep: "Before consultation: ensure skin is clean & moisturized, have reference bridal looks ready, and avoid aggressive chemical peels 48 hours prior.",
        reschedulePolicy: "Reschedule requests are accepted up to 14 days prior to event, subject to artist calendar availability. The AI cannot modify bookings directly; users must submit an official reschedule request.",
      },
    };

    // 2. Private Customer Context Retrieval (STRICT ISOLATION)
    const customerIdentifier = auth.customerId || auth.uid;
    if (customerIdentifier && customerIdentifier !== "customer_guest" && customerIdentifier !== "guest_user") {
      try {
        const bookingsQ = query(
          collection(db, "bookings"),
          where("customerDetails.phone", "==", customerIdentifier),
          limit(3)
        );
        let snap = await getDocs(bookingsQ);

        // Fallback search by bookingId if phone match returns empty
        if (snap.empty) {
          const bookingIdQ = query(
            collection(db, "bookings"),
            where("bookingId", "==", customerIdentifier),
            limit(1)
          );
          snap = await getDocs(bookingIdQ);
        }

        if (!snap.empty) {
          contextData.customerPrivateBookings = snap.docs.map((doc) => {
            const d = doc.data();
            return {
              bookingId: d.bookingId,
              customerName: d.customerDetails?.fullName,
              serviceTitle: d.serviceTitle || d.event?.type,
              status: d.status,
              eventDate: d.event?.date || d.eventDetails?.eventDate,
              venue: d.event?.venue,
              city: d.event?.city,
              pricing: {
                totalAmount: d.commercials?.totalAmount || d.totalAmount,
                depositAmount: d.commercials?.depositPaid || d.depositAmount || d.pricing?.depositAmount,
                depositStatus: d.status === "confirmed" ? "PAID" : "PENDING_VERIFICATION",
              },
            };
          });
        }
      } catch (e) {
        console.warn("[ContextBuilder] Non-blocking private booking context fetch failed:", e);
      }
    }

    // 3. System Prompt Construction
    const systemPrompt = `You are the AI Beauty Concierge for 'Makeovers by Prachi'.
You provide helpful, elegant, and accurate answers about bridal makeup packages, preparation tips, travel policies, and customer booking details.

AUTHORIZED CONTEXT:
${JSON.stringify(contextData)}

STRICT BUSINESS & SAFETY RULES:
1. CUSTOMER SPECIFIC DATA: For customer-specific questions (deposit paid, booking status, appointment date), ALWAYS read exact values from 'customerPrivateBookings' in the context. Never guess or invent numbers! If no booking is found, politely ask the user to provide their phone number or Booking ID.
2. READ-ONLY ENFORCEMENT: You CANNOT modify bookings, change dates, issue refunds, or confirm UTR payments. If a user asks to change dates, explain the rescheduling policy and set actionType to "RESCHEDULE_REQUEST".
3. PRICING & TRAVEL: Signature Royal Bridal is ₹25,000 (₹7,500 deposit). Pre-Wedding Glam is ₹15,000 (₹4,500 deposit). Party Makeover is ₹8,500 (₹2,500 deposit). Travel to Jaipur/outstation is billed at actuals.

REQUIRED RESPONSE FORMAT:
Respond in JSON format with the following structure:
{
  "answer": "Clear and detailed natural language response here...",
  "sources": ["service:royal-bridal", "policy:reschedule"],
  "recommendations": ["Book a consultation", "View Royal Bridal package"],
  "requiresHumanAction": false,
  "actionType": null
}`;

    return { systemPrompt, contextData };
  }

  if (feature === "ADMIN_COPILOT") {
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
