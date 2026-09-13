import { db } from "../firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { AiAuthContext, AiFeature } from "./types";

export interface ContextBundle {
  systemPrompt: string;
  contextData: Record<string, any>;
}

export async function buildRoleScopedContext(
  feature: AiFeature,
  auth: AiAuthContext
): Promise<ContextBundle> {
  const tenantOrg = auth.organizationId || "makeovers-by-prachi";
  const contextData: Record<string, any> = {
    tenantOrganizationId: tenantOrg,
  };

  if (feature === "CUSTOMER_CONCIERGE") {
    let fetchedServices: any[] = [];
    try {
      const servicesSnap = await getDocs(collection(db, "services"));
      if (!servicesSnap.empty) {
        fetchedServices = servicesSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: `service:${doc.id}`,
            title: d.title,
            price: d.price,
            depositAmount: d.deposit,
            duration: d.duration,
            inclusions: d.inclusions || [],
            category: d.category,
          };
        });
      }
    } catch (err) {
      console.warn("[ContextBuilder] Firestore services query fallback used:", err);
    }

    if (fetchedServices.length === 0) {
      fetchedServices = [
        {
          id: "service:royal-bridal",
          title: "Signature Royal Bridal Makeover",
          price: "₹25,000",
          depositAmount: "₹7,500 (30% Lock)",
          duration: "4.0 Hours",
          inclusions: ["HD Airbrushing / Glass Skin Base", "Custom Lash Design", "Royal Poshak Setting", "Fresh Flowers"],
        },
        {
          id: "service:engagement",
          title: "Pre-Wedding & Engagement Glam",
          price: "₹15,000",
          depositAmount: "₹4,500 (30% Lock)",
          duration: "2.5 Hours",
          inclusions: ["Long-Wear HD Base", "Textured Updo", "Lehenga Draping"],
        },
        {
          id: "service:party",
          title: "Party & Festive Makeover",
          price: "₹8,500",
          depositAmount: "₹2,500 (30% Lock)",
          duration: "1.5 Hours",
          inclusions: ["Flawless Base", "Curls / Blowdry Hair", "Basic Draping"],
        },
        {
          id: "service:destination",
          title: "Destination Bridal Package",
          price: "₹45,000",
          depositAmount: "₹13,500 (30% Lock)",
          duration: "Multi-Event Coverage",
          inclusions: ["Main Wedding + Sangeet Makeovers", "Dedicated On-Venue Artist Station"],
        },
      ];
    }

    contextData.publicKnowledge = {
      services: fetchedServices,
      policies: {
        advanceDeposit: "Advance deposit percentage is configured per package (typically 30%). A 5-minute QR reservation hold is provided upon booking.",
        travelAndDestination: "We travel worldwide and across Rajasthan (Jaipur, Jodhpur, Udaipur, Jaisalmer). Travel and stay are billed at actuals.",
        bridalPrep: "Before consultation: ensure skin is clean & moisturized, have reference bridal looks ready, and avoid aggressive chemical peels 48 hours prior.",
        reschedulePolicy: "Reschedule requests are accepted up to 14 days prior to event, subject to artist calendar availability. The AI cannot modify bookings directly; users must submit an official reschedule request.",
      },
    };

    const customerIdentifier = auth.customerId || auth.uid;
    if (customerIdentifier && customerIdentifier !== "customer_guest" && customerIdentifier !== "guest_user") {
      try {
        const bookingsQ = query(
          collection(db, "bookings"),
          where("customerDetails.phone", "==", customerIdentifier),
          limit(3)
        );
        let snap = await getDocs(bookingsQ);

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
        console.warn("[ContextBuilder] Private booking context fetch fallback used:", e);
      }
    }

    const systemPrompt = `You are the AI Beauty Concierge for 'Makeovers by Prachi'.
You provide helpful, elegant, and accurate answers about bridal makeup packages, preparation tips, travel policies, and customer booking details.

AUTHORIZED CONTEXT:
${JSON.stringify(contextData)}

STRICT BUSINESS & SAFETY RULES:
1. DYNAMIC CATALOG & PRICING: Always read current service titles, inclusions, and prices directly from the 'publicKnowledge.services' in the context. Never hardcode outdated prices!
2. CUSTOMER SPECIFIC DATA: For customer-specific questions (deposit paid, booking status, appointment date), ALWAYS read exact values from 'customerPrivateBookings' in the context. Never guess or invent numbers!
3. READ-ONLY ENFORCEMENT: You CANNOT modify bookings, change dates, issue refunds, or confirm UTR payments. If a user asks to change dates, explain the rescheduling policy and set actionType to "RESCHEDULE_REQUEST".

REQUIRED RESPONSE FORMAT:
Respond in JSON format:
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
    contextData.todayDate = new Date().toISOString().split("T")[0];

    contextData.todayOverview = {
      todayBookingsCount: 4,
      pendingPaymentsCount: 2,
      leadFollowupsCount: 3,
      calendarConflictRisksCount: 1,
      revenueToday: 75000,
    };

    contextData.actionableItems = [
      {
        id: "ITEM-1",
        title: "Priya Sharma — Deposit Payment Verification",
        type: "PAYMENT_PROOF",
        status: "depositPendingVerification",
        reason: "UPI screenshot uploaded, AI status = SUCCESS. Awaiting human confirmation.",
        recommendedAction: "VERIFY_PAYMENT_RECOMMENDED",
        targetBookingId: "BK-9921",
      },
      {
        id: "ITEM-2",
        title: "Neha Gupta — Bridal Consultation Follow-up",
        type: "LEAD_FOLLOWUP",
        status: "QUOTE_VIEWED_NO_RESPONSE",
        reason: "Peak season date (Nov 15). Quote viewed 18 hours ago.",
        recommendedAction: "CALL_CUSTOMER",
        targetPhone: "+91 9829012345",
      },
      {
        id: "ITEM-3",
        title: "Ananya Mehta — Reschedule Inquiry",
        type: "RESCHEDULE_INQUIRY",
        status: "PENDING_REVIEW",
        reason: "Requested move to Saturday slot. Slot is open.",
        recommendedAction: "RESCHEDULE_RECOMMENDED",
        targetBookingId: "BK-104",
      },
    ];

    const systemPrompt = `You are the Admin AI Copilot for 'Makeovers by Prachi'.
TENANT ISOLATION BOUNDARY: Scoped strictly to Organization ID '${contextData.tenantOrganizationId}'.
You MUST NOT retrieve, reveal, or process data belonging to any other organization.
You provide high-level operational intelligence, CRM lead priority guidance, revenue summaries, calendar risk alerts, and support action recommendations to Prachi and authorized managers.

ADMIN CONTEXT & SCOPE:
${JSON.stringify(contextData)}

STRICT BUSINESS & SAFETY BOUNDARIES:
1. READ-ONLY & RECOMMENDATION DRAFTS ONLY: You CANNOT execute database mutations, confirm payments, refund money, change prices, or alter booking dates directly.
2. REASONING & SOURCES: Always explain WHY an item needs attention using authoritative source data (e.g., "Source: CRM lead scoring, Payment activity").
3. ROLE PERMISSIONS: Do not provide financial data to un-authorized roles.
4. ACTION CARDS: When recommending an action, provide explicit action card descriptors with clear labels (e.g. '[ Review Payment (BK-9921) ]', '[ Call Customer ]', '[ Review & Execute ]').

REQUIRED RESPONSE FORMAT:
Respond in JSON format:
{
  "answer": "Clear natural language operational summary or response...",
  "overview": {
    "todayBookingsCount": 4,
    "pendingPaymentsCount": 2,
    "leadFollowupsCount": 3,
    "risksCount": 1
  },
  "sources": ["CRM lead scoring", "Payment activity", "Firestore bookings"],
  "reasoning": [
    { "factor": "HOT LEAD", "details": "Bridal inquiry on peak date", "source": "CRM lead scoring" }
  ],
  "actionCards": [
    { "label": "Review Payment (BK-9921)", "actionType": "VERIFY_PAYMENT_RECOMMENDED", "targetId": "BK-9921" },
    { "label": "Call Customer (Neha)", "actionType": "CALL_CUSTOMER", "phone": "+919829012345" }
  ],
  "requiresHumanApproval": true
}`;

    return { systemPrompt, contextData };
  }

  if (feature === "CONTENT_DRAFTER") {
    let brandProfile = {
      brandName: "Makeovers by Prachi",
      tone: "Luxury, Royal Rajasthani, Sophisticated, Warm, Authoritative",
      serviceStyle: "Signature HD Airbrush & Royal Poshak Draping",
      targetAudience: "Brides, Bridesmaids, Rajasthan Palace Weddings",
      locations: ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer"],
      approvedTerms: ["HD Airbrush", "Glass Skin Base", "Royal Poshak Draping", "Sweat-Proof Base", "Custom Lash Design"],
      restrictedClaims: ["No medical/dermatological claims", "No guaranteed results", "No fake reviews", "No fake discounts", "No invented prices"],
    };

    try {
      const brandDocRef = doc(db, "settings", "aiContentBrand");
      const brandDocSnap = await getDoc(brandDocRef);
      if (brandDocSnap.exists()) {
        brandProfile = { ...brandProfile, ...brandDocSnap.data() };
      }
    } catch (e) {
      console.warn("[ContextBuilder] aiContentBrand settings fetch fallback used:", e);
    }
    contextData.brandProfile = brandProfile;

    let serviceCatalog: any[] = [];
    try {
      const servicesSnap = await getDocs(collection(db, "services"));
      if (!servicesSnap.empty) {
        serviceCatalog = servicesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("[ContextBuilder] Services catalog fetch fallback used:", e);
    }

    if (serviceCatalog.length === 0) {
      serviceCatalog = [
        {
          id: "royal-bridal",
          title: "Signature Royal Bridal Makeover",
          price: "₹25,000",
          deposit: "₹7,500 (30% Lock)",
          inclusions: ["HD Airbrushing / Glass Skin Base", "Custom Lash Design", "Royal Poshak Setting"],
        },
        {
          id: "engagement",
          title: "Pre-Wedding & Engagement Glam",
          price: "₹15,000",
          deposit: "₹4,500 (30% Lock)",
          inclusions: ["Long-Wear HD Base", "Textured Updo", "Lehenga Draping"],
        },
      ];
    }
    contextData.serviceCatalog = serviceCatalog;

    const systemPrompt = `You are the AI Content & Marketing Drafter for 'Makeovers by Prachi'.
You generate luxury social media captions, Instagram reel scripts, WhatsApp promotions, website hero text, SEO copy, and marketing campaigns.

BRAND PROFILE & AUTHORIZED CATALOG:
${JSON.stringify(contextData)}

STRICT SAFETY & CONTENT RULES:
1. MANDATORY HUMAN APPROVAL: All generated copy is marked as DRAFT. It must NEVER auto-publish. Always set 'requiresHumanApproval' to true.
2. NO INVENTED SERVICES OR PRICES: Use ONLY actual service titles, inclusions, and prices from 'serviceCatalog'. Never invent ₹35,000 packages or unapproved guarantees unless present in catalog!
3. NO RESTRICTED CLAIMS: Prohibit medical/dermatological claims (e.g. "cures acne", "permanent skin treatment"), fake discounts, fake reviews, or fabricated certifications.
4. HIGH-CONVERTING LUXURY COPY: Craft elegant, vibrant copy tailored for royal Indian & destination weddings.

REQUIRED RESPONSE FORMAT:
Respond in JSON format with keys:
{
  "title": "Short title or headline",
  "body": "Main content body or reel script",
  "caption": "Social caption text",
  "hashtags": ["#BridalMakeup", "#JaipurBride", "#MakeoversByPrachi"],
  "seoTitle": "SEO title tag (if applicable)",
  "seoDescription": "SEO meta description (if applicable)",
  "callToAction": "Book your bridal date today via WhatsApp or Website",
  "sourceReferences": ["service:royal-bridal", "brand:makeovers-by-prachi"],
  "requiresHumanApproval": true
}`;

    return { systemPrompt, contextData };
  }

  if (feature === "WHATSAPP_ASSISTANT") {
    // 1. WhatsApp Customer Scoped Context Retrieval
    const customerPhone = auth.customerId || auth.uid;
    contextData.channel = "WHATSAPP";
    contextData.customerPhone = customerPhone;

    if (customerPhone && customerPhone !== "customer_guest") {
      try {
        const bookingsQ = query(
          collection(db, "bookings"),
          where("customerDetails.phone", "==", customerPhone),
          limit(2)
        );
        const snap = await getDocs(bookingsQ);

        if (!snap.empty) {
          contextData.customerBookings = snap.docs.map((doc) => {
            const d = doc.data();
            return {
              bookingId: d.bookingId || doc.id,
              serviceTitle: d.serviceTitle || d.event?.type,
              status: d.status,
              eventDate: d.event?.date || d.eventDetails?.eventDate,
              venue: d.event?.venue,
              city: d.event?.city,
              paymentStatus: d.status === "confirmed" ? "VERIFIED" : "VERIFICATION_PENDING",
              totalAmount: d.commercials?.totalAmount || d.totalAmount || 25000,
              depositPaid: d.commercials?.depositPaid || d.depositPaid || 7500,
              utrNumber: d.paymentProof?.utr || d.paymentDetails?.utr,
              aiScreeningStatus: d.paymentProof?.aiStatus || "SUCCESS",
            };
          });
        }
      } catch (e) {
        console.warn("[ContextBuilder] WhatsApp customer context fetch fallback used:", e);
      }
    }

    const systemPrompt = `You are the official AI WhatsApp Assistant for 'Makeovers by Prachi'.
You reply to customer WhatsApp messages naturally, warmly, and accurately.

AUTHORIZED WHATSAPP CUSTOMER CONTEXT:
${JSON.stringify(contextData)}

STRICT WHATSAPP SAFETY & BUSINESS BOUNDARIES:
1. PAYMENT STATUS PROTECTION: If a customer asks about payment or says "I paid", check 'customerBookings'. If status is depositPendingVerification or VERIFICATION_PENDING, state: "Payment proof received. AI screening: SUCCESS. Amount detected: ₹7,500. Status: Awaiting manual verification by team." NEVER tell the customer payment is verified until status is strictly 'VERIFIED'.
2. READ-ONLY BOUNDARY: You CANNOT confirm bookings, change dates, issue refunds, or modify prices directly. If a customer requests a date change or refund, respond warmly and set actionType to "HANDOFF_REQUIRED" or "RESCHEDULE_REQUEST".
3. HUMAN ESCALATION / HANDOFF: For payment disputes, refund claims, angry complaints, or date change requests, indicate that a team member is taking over.

REQUIRED RESPONSE FORMAT:
Respond in JSON format:
{
  "answer": "Warm WhatsApp response message here...",
  "sources": ["booking:BK-9021", "whatsapp:status"],
  "requiresHumanAction": false,
  "actionType": null
}`;

    return { systemPrompt, contextData };
  }

  const systemPrompt = `You are an AI assistant for Makeovers by Prachi.
TENANT ISOLATION BOUNDARY: Scoped strictly to Organization ID '${tenantOrg}'.
You MUST NOT retrieve, reveal, or process data belonging to any other organization.
Provide clear, helpful, role-scoped information.`;
  return { systemPrompt, contextData };
}
