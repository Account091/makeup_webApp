import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "../../../../lib/firebase-admin";
import { clientIp, expireBooking, isHoldActive, jsonError, rateLimit, REVIEW_HOLD_EXTENSION_MS } from "../../../../lib/booking/server";
import { BOOKING_ID_PATTERN, normalizeBookingId, normalizePhone } from "../../../../lib/booking/types";
import { mirrorPaymentProofSubmitted } from "../../../../lib/financial/sheets-payment-mirror-engine";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const NOT_FOUND = "No booking found with that ID and phone number.";

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function safeFileName(name: string, contentType: string): string {
  const ext = (contentType.split("/")[1] || "img").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "img";
  const base = (name || "")
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `${base || "payment-proof"}.${ext}`;
}

export async function POST(req: Request) {
  if (!rateLimit(`proof:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
    return jsonError("Too many attempts. Please wait a few minutes and try again.", 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Please upload the payment screenshot using the form.", 400);
  }

  const bookingId = normalizeBookingId(form.get("bookingId"));
  const phone = normalizePhone(form.get("phone"));
  const utrRaw = String(form.get("utrNumber") || "")
    .replace(/\s+/g, "")
    .toUpperCase();
  const file = form.get("file");

  if (!BOOKING_ID_PATTERN.test(bookingId) || !phone) return jsonError(NOT_FOUND, 404);
  // UPI references are normally 12 digits; accept 10-22 alphanumerics to be lenient with other apps.
  if (!/^[A-Z0-9]{10,22}$/.test(utrRaw)) {
    return jsonError("Please enter the 12-digit UPI reference (UTR) number from your payment app.", 400);
  }
  if (!file || typeof file === "string" || typeof (file as Blob).arrayBuffer !== "function") {
    return jsonError("Please attach a screenshot of your payment.", 400);
  }
  const blob = file as File;
  const contentType = (blob.type || "").toLowerCase();
  if (!contentType.startsWith("image/")) return jsonError("The payment proof must be an image (JPG, PNG or similar).", 400);
  if (blob.size === 0) return jsonError("The screenshot file is empty. Please choose it again.", 400);
  if (blob.size > MAX_FILE_BYTES) return jsonError("The screenshot is larger than 5 MB. Please upload a smaller image.", 400);

  try {
    const db = adminDb();
    const bookingRef = db.doc(`bookings/${bookingId}`);
    const nowMs = Date.now();

    // ---- 1. Validate the booking before touching the UTR index or Storage ----
    const snap = await bookingRef.get();
    const booking = snap.data();
    if (!snap.exists || !booking || booking.customerDetails?.phone !== phone) return jsonError(NOT_FOUND, 404);

    if (booking.status === "PAYMENT_PROOF_SUBMITTED") {
      return jsonError("We've already received your payment proof. We'll confirm your booking after verification.", 409);
    }
    if (booking.status !== "DEPOSIT_PENDING") {
      if (booking.status === "EXPIRED") return jsonError("This booking hold has expired. Please start a new booking.", 410);
      return jsonError("This booking is no longer waiting for a payment.", 409);
    }
    const expiresMs = Date.parse(booking.expiresAt || "");
    if (!Number.isFinite(expiresMs) || expiresMs <= nowMs) {
      await expireBooking(bookingId).catch((e) => console.warn("[submit-proof] lazy expiry failed:", e));
      return jsonError(
        "Sorry, the time to pay for this booking ran out and the date was released. Please start a new booking.",
        410
      );
    }

    // ---- 2. Upload the screenshot ----
    const proofPath = `payment_proofs/${bookingId}/${nowMs}-${safeFileName(blob.name, contentType)}`;
    const bucket = adminBucket();
    const buffer = Buffer.from(await blob.arrayBuffer());
    await bucket.file(proofPath).save(buffer, {
      resumable: false,
      contentType,
      metadata: { contentType, metadata: { bookingId, utrNumber: utrRaw } },
    });

    // ---- 3. Atomically: claim UTR, update booking, extend calendar hold, notify admin ----
    const utrRef = db.doc(`paymentUtrIndex/${utrRaw}`);
    const calRef = db.doc(`calendar/${booking.event?.date}`);
    try {
      await db.runTransaction(async (tx) => {
        const [bSnap, utrSnap, calSnap] = await Promise.all([tx.get(bookingRef), tx.get(utrRef), tx.get(calRef)]);
        const b = bSnap.data();
        if (!b || b.status !== "DEPOSIT_PENDING") {
          throw new HttpError(409, "This booking is no longer waiting for a payment.");
        }
        if (Date.parse(b.expiresAt || "") <= Date.now()) {
          throw new HttpError(410, "Sorry, the time to pay for this booking ran out. Please start a new booking.");
        }
        if (utrSnap.exists && utrSnap.data()?.bookingId !== bookingId) {
          throw new HttpError(409, "This UPI reference number has already been used for another booking. Please check it and try again.");
        }

        tx.set(utrRef, {
          utrNumber: utrRaw,
          bookingId,
          createdAt: FieldValue.serverTimestamp(),
        });

        tx.update(bookingRef, {
          status: "PAYMENT_PROOF_SUBMITTED",
          "payment.status": "VERIFICATION_PENDING",
          "payment.utrNumber": utrRaw,
          "payment.proofPath": proofPath,
          "payment.submittedAt": FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Keep the date held while the studio reviews the proof. The original
        // hold is only `holdMinutes` long; we extend the calendar HOLD by 30 days so
        // nobody else can grab the date before admin approves (-> BOOKED) or
        // rejects (-> freed). The admin app shows the pending proof until then;
        // the long window only guards against a forgotten review.
        const cal = calSnap.data() as { status?: string; bookingId?: string; expiresAt?: string } | undefined;
        const extendedIso = new Date(Date.now() + REVIEW_HOLD_EXTENSION_MS).toISOString();
        if (!cal || (cal.status === "HOLD" && (cal.bookingId === bookingId || !isHoldActive(cal)))) {
          tx.set(calRef, {
            status: "HOLD",
            bookingId,
            expiresAt: extendedIso,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        tx.create(db.collection("notifications").doc(), {
          title: `Payment proof received: ${b.customerDetails?.fullName || "Customer"}`,
          body: `${bookingId} · UTR ${utrRaw} · deposit ₹${Number(b.commercials?.depositRequired || 0).toLocaleString("en-IN")}. Please verify.`,
          category: "PAYMENT",
          bookingId,
          isUnread: true,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
    } catch (txErr) {
      // Don't leave orphaned screenshots behind if the booking update failed.
      await bucket.file(proofPath).delete({ ignoreNotFound: true }).catch(() => undefined);
      throw txErr;
    }

    // Optional operational mirror; no-op unless GOOGLE_SHEETS_SCRIPT_URL is set; never blocks.
    void mirrorPaymentProofSubmitted({
      sessionRecord: {
        paymentSessionId: `psess_${bookingId}`,
        bookingId,
        customerId: phone,
        customerName: booking.customerDetails?.fullName || "",
        customerPhone: phone,
        customerEmail: booking.customerDetails?.email || "",
        organizationId: "makeovers_by_prachi",
        serviceId: booking.serviceId || "",
        serviceName: booking.serviceTitle || "",
        packageName: booking.packageName || "",
        venue: booking.event?.venue || "",
        city: booking.event?.city || "",
        location: booking.event?.city || "",
        eventDate: booking.event?.date || "",
        eventTime: booking.event?.readyByTime || "",
        guestCount: Number(booking.event?.guestCount) || 1,
        totalAmount: booking.commercials?.totalAmount,
        requiredDeposit: booking.commercials?.depositRequired,
        remainingBalance: (booking.commercials?.totalAmount || 0) - (booking.commercials?.depositRequired || 0),
        bookingStatus: "PAYMENT_PROOF_SUBMITTED",
        currency: "INR",
        upiVpa: booking.payment?.upiId || "",
        paymentMethod: "UPI_QR",
        qrType: "DYNAMIC_UPI_INTENT",
        paymentSessionCreatedAt: booking.createdAt?.toDate?.()?.toISOString() || "",
        paymentSessionExpiresAt: booking.expiresAt || "",
        paymentSessionStatus: "PROOF_SUBMITTED",
        proofSubmittedAt: new Date().toISOString(),
        proofFileReference: proofPath,
        verificationStatus: "VERIFICATION_PENDING",
      },
      proofFileRef: proofPath,
      aiResultRef: "",
    }).catch(() => undefined);

    return NextResponse.json({ bookingId, status: "PAYMENT_PROOF_SUBMITTED" });
  } catch (err: any) {
    if (err instanceof HttpError) return jsonError(err.message, err.status);
    console.error("[submit-proof] error:", err);
    return jsonError("We couldn't upload your payment proof right now. Please try again in a moment.", 500);
  }
}
