import { CustomerTimelineEvent } from "./customer-types";

/**
 * Standardized Customer Timeline Engine:
 * Generates unified chronological activity stream across all customer touchpoints.
 */
export function generateCustomerTimelineEvents(customerId: string): CustomerTimelineEvent[] {
  return [
    {
      id: "evt_101",
      customerId,
      type: "INQUIRY",
      source: "WEBSITE",
      referenceId: "inq_9921",
      title: "Bridal Inquiry Submitted",
      description: "Client submitted online inquiry for Royal Bridal Package in Jodhpur.",
      timestamp: "2026-09-01T10:00:00Z",
      visibility: "ADMIN",
    },
    {
      id: "evt_102",
      customerId,
      type: "QUOTE_SENT",
      source: "ADMIN_CONSOLE",
      referenceId: "quote_9921",
      title: "PDF Quote Sent via WhatsApp",
      description: "Quoted ₹25,000 base service + ₹1,500 travel fee.",
      timestamp: "2026-09-01T11:30:00Z",
      visibility: "ADMIN",
    },
    {
      id: "evt_103",
      customerId,
      type: "QUOTE_VIEWED",
      source: "WEBSITE",
      referenceId: "quote_9921",
      title: "PDF Quote Viewed",
      description: "Client opened digital quote document in browser.",
      timestamp: "2026-09-01T14:15:00Z",
      visibility: "ADMIN",
    },
    {
      id: "evt_104",
      customerId,
      type: "PAYMENT",
      source: "PAYMENT_GATEWAY",
      referenceId: "pay_7721",
      title: "Advance Deposit Verified",
      description: "AI Vision & Admin verified ₹7,500 UPI advance deposit.",
      timestamp: "2026-09-02T09:45:00Z",
      visibility: "ADMIN",
    },
    {
      id: "evt_105",
      customerId,
      type: "CONSULTATION",
      source: "MOBILE_APP",
      referenceId: "cons_8812",
      title: "Bridal Consultation Completed",
      description: "HD Airbrush look & natural finish preferences recorded.",
      timestamp: "2026-09-05T16:00:00Z",
      visibility: "ADMIN",
    },
    {
      id: "evt_106",
      customerId,
      type: "LOYALTY",
      source: "ADMIN_CONSOLE",
      referenceId: "loy_101",
      title: "Loyalty Tier Upgraded",
      description: "Upgraded to 'Royal VIP Bride' tier (+500 bonus points).",
      timestamp: "2026-09-05T16:05:00Z",
      visibility: "ADMIN",
    },
  ];
}
