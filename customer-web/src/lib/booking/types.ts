// Client-safe shared types & pure helpers for the booking flow.
// See docs/BOOKING_CONTRACT.md — field names here must match it exactly.

export type BookingStatus =
  | "DEPOSIT_PENDING"
  | "PAYMENT_PROOF_SUBMITTED"
  | "CONFIRMED"
  | "PAYMENT_REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "COMPLETED";

export type PaymentStatus = "DEPOSIT_PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";

export interface PublicService {
  id: string;
  title: string;
  description: string;
  price: number | null;
  category: string;
  durationMinutes: number | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface PublicSettings {
  businessName: string;
  upiId: string;
  payeeName: string;
  whatsappNumber: string; // digits incl. country code, e.g. 919800000000
  phoneDisplay: string;
  email: string;
  studioAddress: string;
  depositPercent: number;
  holdMinutes: number;
  travelFees: Record<string, number>;
}

export interface PublicConfig {
  services: PublicService[];
  settings: PublicSettings;
  /** false when Firestore could not be reached / settings doc missing */
  available: boolean;
}

export interface CreateSessionResponse {
  bookingId: string;
  totalAmount: number;
  depositAmount: number;
  expiresAt: number; // ms epoch
  upiId: string;
  payeeName: string;
}

export interface SanitizedBooking {
  bookingId: string;
  status: BookingStatus;
  serviceTitle: string;
  packageName: string | null;
  customerName: string;
  event: {
    date: string;
    readyByTime: string;
    venue: string;
    city: string;
    guestCount: number;
  };
  commercials: {
    basePrice: number;
    travelFee: number;
    totalAmount: number;
    depositRequired: number;
    depositPaid: number;
  };
  payment: {
    status: PaymentStatus | string;
    utrLast4: string | null;
    rejectionReason: string | null;
    upiId: string | null; // only while DEPOSIT_PENDING
    payeeName: string | null; // only while DEPOSIT_PENDING
  };
  expiresAt: string | null;
}

export const CITY_OPTIONS = ["Jodhpur", "Jaipur", "Udaipur", "Other"] as const;

export const BOOKING_ID_PATTERN = /^MBP-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

/** Strip +91 / spaces / dashes and return a 10-digit Indian mobile, or null. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let digits = input.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9][0-9]{9}$/.test(digits) ? digits : null;
}

export function normalizeBookingId(input: unknown): string {
  if (typeof input !== "string") return "";
  let v = input.trim().toUpperCase().replace(/\s+/g, "");
  if (v.startsWith("#")) v = v.slice(1);
  if (/^[A-Z0-9]{6}$/.test(v)) v = `MBP-${v}`;
  if (/^MBP[A-Z0-9]{6}$/.test(v)) v = `MBP-${v.slice(3)}`;
  return v;
}

/** Travel fee lookup by lower-cased city key, falling back to "other". */
export function travelFeeFor(city: string, travelFees: Record<string, number>): number {
  const key = (city || "").trim().toLowerCase();
  const fee = key in travelFees ? travelFees[key] : travelFees.other;
  return Number.isFinite(Number(fee)) ? Number(fee) : 0;
}

export function computePrice(basePrice: number, city: string, settings: Pick<PublicSettings, "travelFees" | "depositPercent">) {
  const travelFee = travelFeeFor(city, settings.travelFees);
  const totalAmount = basePrice + travelFee;
  const depositAmount = Math.round((totalAmount * settings.depositPercent) / 100);
  return { basePrice, travelFee, totalAmount, depositAmount };
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "—";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function buildUpiUri(opts: { upiId: string; payeeName: string; amount: number; note: string }): string {
  const params = new URLSearchParams({
    pa: opts.upiId,
    pn: opts.payeeName,
    am: opts.amount.toFixed(2),
    cu: "INR",
    tn: opts.note,
  });
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
}

export function whatsappLink(number: string, text?: string): string | null {
  const digits = (number || "").replace(/[^0-9]/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** YYYY-MM-DD for "today" in India (studio's timezone). */
export function todayIST(now: Date = new Date()): string {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export function formatEventDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
