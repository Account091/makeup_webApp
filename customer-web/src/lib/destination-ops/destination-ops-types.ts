export type DestinationWeddingStatus =
  | "INQUIRY"
  | "PLANNING"
  | "QUOTE_DRAFT"
  | "QUOTE_SENT"
  | "QUOTE_ACCEPTED"
  | "DEPOSIT_PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type WeddingFunctionType = "Mehndi" | "Haldi" | "Sangeet" | "Wedding" | "Reception" | "Custom";

export interface DestinationWeddingRecord {
  weddingId: string;
  customerId: string;
  brideName: string;
  groomName?: string;
  destinationCity: string;
  state: string;
  country: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  status: DestinationWeddingStatus;
  quoteId: string;
  totalQuoteAmount: number;
  totalPaidAmount: number;
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingFunctionRecord {
  functionId: string;
  weddingId: string;
  functionType: WeddingFunctionType;
  date: string;
  startTime: string;
  readyByTime: string;
  venueName: string;
  guestCount: number;
  serviceIds: string[];
  assignedArtistIds: string[];
  notes: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "READY" | "COMPLETED";
}

export interface WeddingVenueRecord {
  venueId: string;
  venueName: string;
  address: string;
  city: string;
  contactName: string;
  contactPhone: string;
  accessNotes: string;
  parkingNotes: string;
}

export interface TravelItineraryRecord {
  itineraryId: string;
  weddingId: string;
  travelDate: string;
  originCity: string;
  destinationCity: string;
  travelMode: "FLIGHT" | "TRAIN" | "CAR" | "TAXI";
  departureTime: string;
  arrivalTime: string;
  artistIds: string[];
  estimatedCost: number;
  status: "REQUIRED" | "BOOKED" | "CONFIRMED";
}

export interface AccommodationPlanRecord {
  accommodationId: string;
  weddingId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  roomsRequired: number;
  artistIds: string[];
  bookingReference: string;
  totalCost: number;
  status: "REQUIRED" | "QUOTED" | "BOOKED" | "CONFIRMED";
}

export interface LogisticsChecklistItem {
  itemId: string;
  weddingId: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  ownerRole: "ADMIN" | "LEAD_ARTIST" | "LOGISTICS";
  dueDate: string;
  notes?: string;
}

export interface PaymentScheduleMilestone {
  milestoneId: string;
  weddingId: string;
  milestoneLabel: "DEPOSIT" | "SECOND_PAYMENT" | "FINAL_BALANCE";
  amount: number;
  dueDate: string;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  paymentRecordId?: string;
}

export interface WeddingLookboardRecord {
  lookboardId: string;
  weddingId: string;
  functionType: WeddingFunctionType;
  lookTitle: string;
  hairStylePreference: string;
  drapingPoshakStyle: string;
  referenceImageUrls: string[];
  approvalStatus: "PENDING" | "APPROVED" | "REVISION_REQUESTED";
  customerNotes?: string;
}

export type DestinationRiskType =
  | "TRAVEL_NOT_BOOKED"
  | "HOTEL_NOT_CONFIRMED"
  | "ARTIST_CONFLICT"
  | "BUFFER_CONFLICT"
  | "PAYMENT_OVERDUE"
  | "LOOK_NOT_APPROVED"
  | "READY_TIME_RISK";

export interface DestinationRiskRecord {
  riskId: string;
  weddingId: string;
  type: DestinationRiskType;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "RESOLVED";
  detectedAt: string;
}

export interface DestinationOpsSummaryKPIs {
  totalActiveWeddings: number;
  upcomingWeddings30Days: number;
  pipelineQuoteValue: number;
  confirmedRevenueValue: number;
  criticalRisksCount: number;
  averageContributionMarginPercent: number;
}

export interface DestinationOpsData {
  dataAsOf: string;
  summary: DestinationOpsSummaryKPIs;
  weddings: DestinationWeddingRecord[];
  functions: WeddingFunctionRecord[];
  venues: WeddingVenueRecord[];
  travelItineraries: TravelItineraryRecord[];
  accommodations: AccommodationPlanRecord[];
  logistics: LogisticsChecklistItem[];
  paymentSchedules: PaymentScheduleMilestone[];
  lookboards: WeddingLookboardRecord[];
  risks: DestinationRiskRecord[];
}
