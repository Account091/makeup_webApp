import {
  DestinationOpsData,
  DestinationWeddingRecord,
  WeddingFunctionRecord,
  WeddingVenueRecord,
  TravelItineraryRecord,
  AccommodationPlanRecord,
  LogisticsChecklistItem,
  PaymentScheduleMilestone,
  WeddingLookboardRecord,
  DestinationOpsSummaryKPIs,
} from "./destination-ops-types";
import { generateDestinationRisks } from "./destination-risk-engine";

export function calculateDestinationOpsData(): DestinationOpsData {
  const dataAsOf = new Date().toISOString();

  // 1. Destination Weddings
  const weddings: DestinationWeddingRecord[] = [
    {
      weddingId: "wed_rathore_udaipur",
      customerId: "cust_priya_01",
      brideName: "Priya Rathore",
      groomName: "Vikram Singh",
      destinationCity: "Udaipur",
      state: "Rajasthan",
      country: "India",
      startDate: "2026-09-26",
      endDate: "2026-09-29",
      guestCount: 150,
      status: "CONFIRMED",
      quoteId: "quote_udaipur_99",
      totalQuoteAmount: 240000,
      totalPaidAmount: 168000,
      outstandingBalance: 72000,
      createdAt: "2026-08-15T10:00:00Z",
      updatedAt: dataAsOf,
    },
    {
      weddingId: "wed_kapoor_jaipur",
      customerId: "cust_rhea_02",
      brideName: "Rhea Kapoor",
      groomName: "Aman Verma",
      destinationCity: "Jaipur",
      state: "Rajasthan",
      country: "India",
      startDate: "2026-10-12",
      endDate: "2026-10-15",
      guestCount: 200,
      status: "PLANNING",
      quoteId: "quote_jaipur_44",
      totalQuoteAmount: 320000,
      totalPaidAmount: 96000,
      outstandingBalance: 224000,
      createdAt: "2026-09-01T12:00:00Z",
      updatedAt: dataAsOf,
    },
  ];

  // 2. Wedding Functions
  const functions: WeddingFunctionRecord[] = [
    {
      functionId: "fn_rathore_mehndi",
      weddingId: "wed_rathore_udaipur",
      functionType: "Mehndi",
      date: "2026-09-26",
      startTime: "16:00",
      readyByTime: "15:30",
      venueName: "Taj Lake Palace — Poolside Lawn",
      guestCount: 60,
      serviceIds: ["pre-wedding-glam"],
      assignedArtistIds: ["artist_ananya"],
      notes: "Vibrant floral look with lightweight HD makeup.",
      status: "SCHEDULED",
    },
    {
      functionId: "fn_rathore_sangeet",
      weddingId: "wed_rathore_udaipur",
      functionType: "Sangeet",
      date: "2026-09-27",
      startTime: "19:30",
      readyByTime: "18:30",
      venueName: "Taj Lake Palace — Royal Ballroom",
      guestCount: 150,
      serviceIds: ["royal-bridal"],
      assignedArtistIds: ["artist_prachi", "artist_rahul"],
      notes: "Glamorous smokey eye with diamond jewelry styling.",
      status: "SCHEDULED",
    },
    {
      functionId: "fn_rathore_wedding",
      weddingId: "wed_rathore_udaipur",
      functionType: "Wedding",
      date: "2026-09-28",
      startTime: "15:00",
      readyByTime: "14:00",
      venueName: "Taj Lake Palace — Lake Mandap",
      guestCount: 150,
      serviceIds: ["royal-bridal"],
      assignedArtistIds: ["artist_prachi", "artist_ananya", "artist_rahul"],
      notes: "Traditional Royal Rajputi Poshak & Borla draping.",
      status: "SCHEDULED",
    },
  ];

  // 3. Wedding Venues
  const venues: WeddingVenueRecord[] = [
    {
      venueId: "venue_taj_udaipur",
      venueName: "Taj Lake Palace Udaipur",
      address: "Pichola, Udaipur, Rajasthan 313001",
      city: "Udaipur",
      contactName: "Mr. Rajeev Sharma (Event Director)",
      contactPhone: "+91 98290 12345",
      accessNotes: "Boat transport required to reach island venue. Loading dock available at Rameshwar Ghat.",
      parkingNotes: "Valet parking available at private ghat.",
    },
  ];

  // 4. Travel Itineraries
  const travelItineraries: TravelItineraryRecord[] = [
    {
      itineraryId: "trv_rathore_outbound",
      weddingId: "wed_rathore_udaipur",
      travelDate: "2026-09-26",
      originCity: "Jodhpur",
      destinationCity: "Udaipur",
      travelMode: "FLIGHT",
      departureTime: "08:30",
      arrivalTime: "09:45",
      artistIds: ["artist_prachi", "artist_ananya", "artist_rahul"],
      estimatedCost: 24000,
      status: "BOOKED",
    },
  ];

  // 5. Accommodation Plans
  const accommodations: AccommodationPlanRecord[] = [
    {
      accommodationId: "acc_rathore_hotel",
      weddingId: "wed_rathore_udaipur",
      hotelName: "Taj Lake Palace (Artist Heritage Suite)",
      checkInDate: "2026-09-26",
      checkOutDate: "2026-09-29",
      roomsRequired: 2,
      artistIds: ["artist_prachi", "artist_ananya", "artist_rahul"],
      bookingReference: "TAJ_UDR_88219",
      totalCost: 36000,
      status: "CONFIRMED",
    },
  ];

  // 6. Logistics Checklist
  const logistics: LogisticsChecklistItem[] = [
    {
      itemId: "log_01",
      weddingId: "wed_rathore_udaipur",
      title: "Flight Tickets & ID Verification",
      status: "COMPLETED",
      ownerRole: "ADMIN",
      dueDate: "2026-09-20",
    },
    {
      itemId: "log_02",
      weddingId: "wed_rathore_udaipur",
      title: "Ring Light & HD Kit Airport Security Clearance",
      status: "COMPLETED",
      ownerRole: "LEAD_ARTIST",
      dueDate: "2026-09-24",
    },
    {
      itemId: "log_03",
      weddingId: "wed_rathore_udaipur",
      title: "Island Boat Transport Schedule Sync",
      status: "IN_PROGRESS",
      ownerRole: "LOGISTICS",
      dueDate: "2026-09-25",
    },
  ];

  // 7. Payment Schedule Milestones
  const paymentSchedules: PaymentScheduleMilestone[] = [
    {
      milestoneId: "pay_ms_1",
      weddingId: "wed_rathore_udaipur",
      milestoneLabel: "DEPOSIT",
      amount: 72000,
      dueDate: "2026-08-15",
      status: "PAID",
      paymentRecordId: "rec_dep_99",
    },
    {
      milestoneId: "pay_ms_2",
      weddingId: "wed_rathore_udaipur",
      milestoneLabel: "SECOND_PAYMENT",
      amount: 96000,
      dueDate: "2026-09-10",
      status: "PAID",
      paymentRecordId: "rec_2nd_99",
    },
    {
      milestoneId: "pay_ms_3",
      weddingId: "wed_rathore_udaipur",
      milestoneLabel: "FINAL_BALANCE",
      amount: 72000,
      dueDate: "2026-09-28",
      status: "PENDING",
    },
  ];

  // 8. Wedding Lookboards
  const lookboards: WeddingLookboardRecord[] = [
    {
      lookboardId: "look_rathore_wedding",
      weddingId: "wed_rathore_udaipur",
      functionType: "Wedding",
      lookTitle: "Royal Rajputi Traditional Red Poshak Look",
      hairStylePreference: "Classic Low Bun with Real Jasmine Gajra",
      drapingPoshakStyle: "Traditional Sheeshphool & Rajputi Dupatta Draping",
      referenceImageUrls: ["https://makeoversbyprachi.com/gallery/rajputi_01.jpg"],
      approvalStatus: "APPROVED",
      customerNotes: "Approved final look during bridal trial in Jodhpur.",
    },
  ];

  // 9. Risk Anomaly Detection
  const risks = generateDestinationRisks({
    travel: travelItineraries,
    accommodations,
    payments: paymentSchedules,
    lookboards,
  });

  const totalActiveWeddings = weddings.length;
  const pipelineQuoteValue = weddings.reduce((acc, w) => acc + w.totalQuoteAmount, 0);
  const confirmedRevenueValue = weddings.reduce((acc, w) => acc + w.totalPaidAmount, 0);
  const criticalRisksCount = risks.filter((r) => r.severity === "CRITICAL" || r.severity === "HIGH").length;

  const summary: DestinationOpsSummaryKPIs = {
    totalActiveWeddings,
    upcomingWeddings30Days: 2,
    pipelineQuoteValue,
    confirmedRevenueValue,
    criticalRisksCount,
    averageContributionMarginPercent: 55.4,
  };

  return {
    dataAsOf,
    summary,
    weddings,
    functions,
    venues,
    travelItineraries,
    accommodations,
    logistics,
    paymentSchedules,
    lookboards,
    risks,
  };
}
