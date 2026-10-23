import { NextResponse } from "next/server";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { adminDb } from "../../../../lib/firebase-admin";
import {
  clientIp,
  generateBookingId,
  isHoldActive,
  jsonError,
  loadSettings,
  rateLimit,
} from "../../../../lib/booking/server";
import { computePrice, normalizePhone, todayIST, type CreateSessionResponse } from "../../../../lib/booking/types";
import { mirrorPaymentSessionStarted } from "../../../../lib/financial/sheets-payment-mirror-engine";

export const dynamic = "force-dynamic";

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function text(v: unknown, field: string, min: number, max: number, required = true): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) {
    if (required) throw new HttpError(400, `Please enter ${field}.`);
    return "";
  }
  if (s.length < min) throw new HttpError(400, `${field[0].toUpperCase()}${field.slice(1)} is too short.`);
  if (s.length > max) throw new HttpError(400, `${field[0].toUpperCase()}${field.slice(1)} is too long (max ${max} characters).`);
  return s;
}

function validateDate(v: unknown): string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new HttpError(400, "Please choose a valid event date.");
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) throw new HttpError(400, "Please choose a valid event date.");
  const today = todayIST();
  if (v < today) throw new HttpError(400, "The event date cannot be in the past.");
  const max = new Date(`${today}T00:00:00Z`);
  max.setUTCFullYear(max.getUTCFullYear() + 2);
  if (d > max) throw new HttpError(400, "We take bookings up to 2 years in advance. Please contact us for later dates.");
  return v;
}

export async function POST(req: Request) {
  if (!rateLimit(`create:${clientIp(req)}`, 15, 10 * 60 * 1000)) {
    return jsonError("Too many booking attempts. Please wait a few minutes and try again.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request.", 400);
  }

  try {
    const serviceId = text(body.serviceId, "a service", 1, 120);
    if (serviceId.includes("/")) throw new HttpError(400, "Please choose a valid service.");
    const packageName = text(body.packageName, "package name", 1, 120, false);
    const date = validateDate(body.date);
    const readyTime = typeof body.readyTime === "string" ? body.readyTime.trim() : "";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(readyTime)) throw new HttpError(400, "Please choose the time you need to be ready by.");
    const venue = text(body.venue, "the venue", 2, 200);
    const city = text(body.city, "the city", 2, 60);
    const guestCountRaw = body.guestCount === undefined || body.guestCount === "" ? 1 : Number(body.guestCount);
    if (!Number.isInteger(guestCountRaw) || guestCountRaw < 1 || guestCountRaw > 50) {
      throw new HttpError(400, "Number of people getting ready must be between 1 and 50.");
    }
    const guestCount = guestCountRaw;
    const fullName = text(body.fullName, "your full name", 2, 80);
    const phone = normalizePhone(body.phone);
    if (!phone) throw new HttpError(400, "Please enter a valid 10-digit mobile number.");
    const email = text(body.email, "email", 3, 120, false);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please enter a valid email address.");
    const notes = text(body.notes, "notes", 1, 1000, false);

    const db = adminDb();
    const [serviceSnap, { settings, exists: settingsExist }] = await Promise.all([
      db.doc(`services/${serviceId}`).get(),
      loadSettings(db),
    ]);

    const service = serviceSnap.data();
    if (!serviceSnap.exists || !service || service.active !== true) {
      throw new HttpError(400, "That service is no longer available. Please choose another.");
    }
    const basePrice = Number(service.price);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      throw new HttpError(400, "This service is priced on request. Please contact us on WhatsApp to book it.");
    }
    if (!settingsExist || !settings.upiId) {
      console.error("[create-session] settings/business missing or has no upiId");
      throw new HttpError(503, "Online booking is temporarily unavailable. Please contact us on WhatsApp.");
    }

    const { travelFee, totalAmount, depositAmount } = computePrice(basePrice, city, settings);
    const serviceTitle = String(service.title || "Makeup service");

    const nowMs = Date.now();
    const expiresAtMs = nowMs + settings.holdMinutes * 60 * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();
    const calRef = db.doc(`calendar/${date}`);

    const bookingId = await db.runTransaction(async (tx) => {
      // ---- reads (all reads must happen before any write) ----
      const calSnap = await tx.get(calRef);
      const cal = calSnap.data() as { status?: string; bookingId?: string; expiresAt?: string } | undefined;
      let previousToExpire: DocumentReference | null = null;

      if (cal) {
        if (cal.status === "BOOKED" || cal.status === "BLOCKED") {
          throw new HttpError(409, "This date is already taken. Please choose another date.");
        }
        if (cal.status === "HOLD" && cal.bookingId) {
          const prevRef = db.doc(`bookings/${cal.bookingId}`);
          const prevSnap = await tx.get(prevRef);
          const prev = prevSnap.data();
          if (isHoldActive(cal, nowMs)) {
            const samePerson = prev?.customerDetails?.phone === phone;
            if (samePerson && prev?.status === "DEPOSIT_PENDING") {
              // Same customer re-taking their own unexpired hold (e.g. pressed Back
              // and changed details): release the old one and issue a fresh hold.
              previousToExpire = prevRef;
            } else if (samePerson && prev?.status === "PAYMENT_PROOF_SUBMITTED") {
              throw new HttpError(
                409,
                `You already have a booking for this date (${cal.bookingId}) awaiting payment verification. Track it on the Track booking page.`
              );
            } else {
              throw new HttpError(409, "This date is already taken. Please choose another date.");
            }
          } else if (prev?.status === "DEPOSIT_PENDING") {
            // Lazy expiry of a lapsed hold.
            previousToExpire = prevRef;
          }
        }
      }

      let newId = "";
      for (let i = 0; i < 6 && !newId; i++) {
        const candidate = generateBookingId();
        const snap = await tx.get(db.doc(`bookings/${candidate}`));
        if (!snap.exists) newId = candidate;
      }
      if (!newId) throw new HttpError(500, "Could not create a booking reference. Please try again.");

      // ---- writes ----
      if (previousToExpire) {
        tx.update(previousToExpire, {
          status: "EXPIRED",
          "payment.status": "EXPIRED",
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      tx.set(calRef, {
        status: "HOLD",
        bookingId: newId,
        expiresAt: expiresAtIso,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.create(db.doc(`bookings/${newId}`), {
        bookingId: newId,
        status: "DEPOSIT_PENDING",
        customerDetails: { fullName, phone, email },
        event: { type: serviceTitle, date, readyByTime: readyTime, venue, city, guestCount },
        serviceId,
        serviceTitle,
        packageName: packageName || null,
        notes: notes || null,
        commercials: {
          basePrice,
          travelFee,
          totalAmount,
          depositRequired: depositAmount,
          depositPaid: 0,
        },
        payment: {
          upiId: settings.upiId,
          payeeName: settings.payeeName,
          status: "DEPOSIT_PENDING",
        },
        expiresAt: expiresAtIso,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.create(db.collection("notifications").doc(), {
        title: `New booking request: ${fullName}`,
        body: `${newId} · ${serviceTitle} on ${date} (${city}). Deposit ₹${depositAmount.toLocaleString("en-IN")} pending.`,
        category: "BOOKING",
        bookingId: newId,
        isUnread: true,
        createdAt: FieldValue.serverTimestamp(),
      });

      return newId;
    });

    // Optional operational mirror; no-op unless GOOGLE_SHEETS_SCRIPT_URL is set; never blocks or fails the booking.
    void mirrorPaymentSessionStarted({
      sessionRecord: {
        paymentSessionId: `psess_${bookingId}`,
        bookingId,
        customerId: phone,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        organizationId: "makeovers_by_prachi",
        serviceId,
        serviceName: serviceTitle,
        location: city,
        venue,
        city,
        packageName,
        totalAmount,
        guestCount,
        eventDate: date,
        eventTime: readyTime,
        bookingStatus: "DEPOSIT_PENDING",
        requiredDeposit: depositAmount,
        currency: "INR",
        upiVpa: settings.upiId,
        paymentMethod: "UPI_QR",
        qrType: "DYNAMIC_UPI_INTENT",
        paymentSessionCreatedAt: new Date(nowMs).toISOString(),
        paymentSessionExpiresAt: expiresAtIso,
        paymentSessionStatus: "PENDING",
      },
    }).catch(() => undefined);

    const response: CreateSessionResponse = {
      bookingId,
      totalAmount,
      depositAmount,
      expiresAt: expiresAtMs,
      upiId: settings.upiId,
      payeeName: settings.payeeName,
    };
    return NextResponse.json(response);
  } catch (err: any) {
    if (err instanceof HttpError) return jsonError(err.message, err.status);
    console.error("[create-session] error:", err);
    return jsonError("We couldn't create your booking right now. Please try again in a moment.", 500);
  }
}
