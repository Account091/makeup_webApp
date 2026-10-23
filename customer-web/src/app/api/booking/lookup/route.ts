import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";
import { clientIp, expireBooking, jsonError, rateLimit } from "../../../../lib/booking/server";
import {
  BOOKING_ID_PATTERN,
  normalizeBookingId,
  normalizePhone,
  type SanitizedBooking,
} from "../../../../lib/booking/types";

export const dynamic = "force-dynamic";

const NOT_FOUND = "No booking found with that ID and phone number.";

export async function POST(req: Request) {
  if (!rateLimit(`lookup:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return jsonError("Too many lookups. Please wait a few minutes and try again.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request.", 400);
  }

  const bookingId = normalizeBookingId(body.bookingId);
  const phone = normalizePhone(body.phone);
  if (!bookingId || !phone) return jsonError("Please enter your booking ID and the 10-digit mobile number used to book.", 400);
  if (!BOOKING_ID_PATTERN.test(bookingId)) return jsonError(NOT_FOUND, 404);

  try {
    const ref = adminDb().doc(`bookings/${bookingId}`);
    let snap = await ref.get();
    let b = snap.data();
    if (!snap.exists || !b || b.customerDetails?.phone !== phone) return jsonError(NOT_FOUND, 404);

    // Lazy expiry: a DEPOSIT_PENDING booking whose hold has lapsed becomes EXPIRED.
    if (b.status === "DEPOSIT_PENDING" && Date.parse(b.expiresAt || "") <= Date.now()) {
      await expireBooking(bookingId).catch((e) => console.warn("[lookup] lazy expiry failed:", e));
      snap = await ref.get();
      b = snap.data() || b;
    }

    const pending = b.status === "DEPOSIT_PENDING";
    const utr: string = b.payment?.utrNumber || "";
    const booking: SanitizedBooking = {
      bookingId,
      status: b.status,
      serviceTitle: b.serviceTitle || b.event?.type || "",
      packageName: b.packageName || null,
      customerName: (b.customerDetails?.fullName || "").split(" ")[0] || "",
      event: {
        date: b.event?.date || "",
        readyByTime: b.event?.readyByTime || "",
        venue: b.event?.venue || "",
        city: b.event?.city || "",
        guestCount: Number(b.event?.guestCount) || 1,
      },
      commercials: {
        basePrice: Number(b.commercials?.basePrice) || 0,
        travelFee: Number(b.commercials?.travelFee) || 0,
        totalAmount: Number(b.commercials?.totalAmount) || 0,
        depositRequired: Number(b.commercials?.depositRequired) || 0,
        depositPaid: Number(b.commercials?.depositPaid) || 0,
      },
      payment: {
        status: b.payment?.status || "",
        utrLast4: utr ? utr.slice(-4) : null,
        rejectionReason: b.payment?.rejectionReason || null,
        upiId: pending ? b.payment?.upiId || null : null,
        payeeName: pending ? b.payment?.payeeName || null : null,
      },
      expiresAt: pending ? b.expiresAt || null : null,
    };
    return NextResponse.json({ booking });
  } catch (err) {
    console.error("[lookup] error:", err);
    return jsonError("We couldn't look up your booking right now. Please try again in a moment.", 500);
  }
}
