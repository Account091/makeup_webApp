import {
  DestinationRiskRecord,
  TravelItineraryRecord,
  AccommodationPlanRecord,
  PaymentScheduleMilestone,
  WeddingLookboardRecord,
} from "./destination-ops-types";

export function generateDestinationRisks(params: {
  travel: TravelItineraryRecord[];
  accommodations: AccommodationPlanRecord[];
  payments: PaymentScheduleMilestone[];
  lookboards: WeddingLookboardRecord[];
}): DestinationRiskRecord[] {
  const risks: DestinationRiskRecord[] = [];
  const now = new Date().toISOString();

  // 1. Check Travel Status
  const unconfirmedTravel = params.travel.find((t) => t.status !== "CONFIRMED");
  if (unconfirmedTravel) {
    risks.push({
      riskId: `risk_travel_${unconfirmedTravel.itineraryId}`,
      weddingId: unconfirmedTravel.weddingId,
      type: "TRAVEL_NOT_BOOKED",
      title: "Outbound Travel Not Confirmed",
      description: `Flight itinerary for ${unconfirmedTravel.destinationCity} on ${unconfirmedTravel.travelDate} is awaiting final ticket confirmation.`,
      severity: "CRITICAL",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  // 2. Check Hotel Accommodations
  const unconfirmedHotel = params.accommodations.find((a) => a.status !== "CONFIRMED");
  if (unconfirmedHotel) {
    risks.push({
      riskId: `risk_hotel_${unconfirmedHotel.accommodationId}`,
      weddingId: unconfirmedHotel.weddingId,
      type: "HOTEL_NOT_CONFIRMED",
      title: "Hotel Stay Confirmation Pending",
      description: `Stay reservation at ${unconfirmedHotel.hotelName} for ${unconfirmedHotel.roomsRequired} rooms requires voucher upload.`,
      severity: "HIGH",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  // 3. Check Overdue Payments
  const overduePayment = params.payments.find((p) => p.status === "OVERDUE" || (p.status === "PENDING" && p.milestoneLabel === "SECOND_PAYMENT"));
  if (overduePayment) {
    risks.push({
      riskId: `risk_pay_${overduePayment.milestoneId}`,
      weddingId: overduePayment.weddingId,
      type: "PAYMENT_OVERDUE",
      title: "Payment Milestone Due",
      description: `Milestone '${overduePayment.milestoneLabel}' (₹${overduePayment.amount.toLocaleString()}) payment status is pending.`,
      severity: "HIGH",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  // 4. Check Lookboard Approvals
  const pendingLook = params.lookboards.find((l) => l.approvalStatus === "PENDING" || l.approvalStatus === "REVISION_REQUESTED");
  if (pendingLook) {
    risks.push({
      riskId: `risk_look_${pendingLook.lookboardId}`,
      weddingId: pendingLook.weddingId,
      type: "LOOK_NOT_APPROVED",
      title: "Bridal Look Approval Pending",
      description: `Function '${pendingLook.functionType}' lookboard '${pendingLook.lookTitle}' is awaiting bride's final look confirmation.`,
      severity: "MEDIUM",
      status: "ACTIVE",
      detectedAt: now,
    });
  }

  return risks;
}
