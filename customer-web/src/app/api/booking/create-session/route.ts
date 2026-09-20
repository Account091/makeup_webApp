import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

import { mirrorPaymentSessionStarted } from "../../../../lib/financial/sheets-payment-mirror-engine";

const SERVICE_PRICES: Record<string, number> = {
  "Signature Bridal Makeover": 25000,
  "Pre-Wedding & Engagement Glam": 15000,
  "Party & Festive Makeover": 8500,
  "Destination Bridal Package": 45000,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { service, packageType, date, readyTime, venue, city, guestCount, fullName, phone, email } = body;

    if (!fullName || !phone || !service || !date) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    const isoNow = new Date().toISOString();

    // 1. Server-side Hold Conflict Check in calendarReservations collection
    const activeHoldQuery = query(
      collection(db, "calendarReservations"),
      where("eventDate", "==", date),
      where("status", "==", "HOLD")
    );
    const activeHoldSnap = await getDocs(activeHoldQuery);

    const hasActiveHold = activeHoldSnap.docs.some((docSnap) => {
      const data = docSnap.data();
      return data.expiresAt && data.expiresAt > isoNow;
    });

    if (hasActiveHold) {
      return NextResponse.json(
        { error: "Another customer currently has an active 7-minute reservation hold on this date. Please try another date or wait a few minutes." },
        { status: 409 }
      );
    }

    // 2. Authoritative Pricing Calculation on Server
    const basePrice = SERVICE_PRICES[service] || 25000;
    const cityClean = (city || "").toLowerCase().trim();
    const travelFee = cityClean === "jodhpur" || cityClean === "" ? 0 : cityClean === "jaipur" || cityClean === "udaipur" ? 3500 : 8500;
    const totalAmount = basePrice + travelFee;
    const depositAmount = Math.round(totalAmount * 0.3);

    // 3. Authoritative 7-Minute Expiry (Server Timestamp + 420 seconds)
    const now = Date.now();
    const expiresAtMs = now + 420 * 1000; // 7 minutes (420s)
    const expiresAtIso = new Date(expiresAtMs).toISOString();
    const bookingId = `BK-${now.toString().slice(-6)}`;

    // 4. Create Server Hold in calendarReservations
    const reservationRef = await addDoc(collection(db, "calendarReservations"), {
      reservationId: `RES-${bookingId}`,
      bookingId,
      eventDate: date,
      readyByTime: readyTime,
      status: "HOLD",
      expiresAt: expiresAtIso,
      createdAt: serverTimestamp(),
    });

    // 5. Create Booking Document in Firestore Source of Truth
    const bookingRef = await addDoc(collection(db, "bookings"), {
      bookingId,
      reservationId: reservationRef.id,
      customerDetails: {
        fullName,
        phone,
        email: email || "guest@makeoversbyprachi.com",
      },
      event: {
        type: service,
        date,
        readyByTime: readyTime,
        venue,
        city,
        guestCount: Number(guestCount) || 1,
      },
      serviceTitle: service,
      packageName: packageType,
      commercials: {
        basePrice,
        travelFee,
        totalAmount,
        depositRequired: depositAmount,
        depositPaid: 0,
      },
      payment: {
        upiId: "bhawanisanker1967@okaxis",
        payeeName: "Bhawani Sankar",
        status: "DEPOSIT_PENDING",
      },
      expiresAt: expiresAtIso,
      status: "DEPOSIT_PENDING",
      createdAt: serverTimestamp(),
    });

    // 6. Stage 1 Operational Mirror Dispatch to Google Sheets (Payments & PaymentEvents)
    mirrorPaymentSessionStarted({
      sessionRecord: {
        paymentSessionId: `psess_${bookingId}`,
        bookingId,
        customerId: email || phone,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email || "guest@makeoversbyprachi.com",
        organizationId: "org_default",
        serviceId: service,
        serviceName: service,
        location: city || "Jodhpur",
        eventDate: date,
        eventTime: readyTime || "10:00",
        bookingStatus: "DEPOSIT_PENDING",
        requiredDeposit: depositAmount,
        currency: "INR",
        upiVpa: "bhawanisanker1967@okaxis",
        paymentMethod: "UPI_QR",
        qrType: "STATIC_UPI",
        paymentSessionCreatedAt: isoNow,
        paymentSessionExpiresAt: expiresAtIso,
        paymentSessionStatus: "PENDING",
      },
      requestId: `req_${now}`,
    }).catch(err => console.warn("[Server API] Sheets mirror dispatch notice:", err));

    // 7. Dispatch Real-time Alert to Admin Notification Inbox & FCM
    addDoc(collection(db, "notifications"), {
      title: `🎉 New Bridal Booking: ${fullName}`,
      body: `Booking #${bookingId} received for ${date} at ${readyTime} (${service}). Advance deposit: ₹${depositAmount}.`,
      category: "BOOKING",
      targetRole: "ADMIN",
      bookingId,
      isUnread: true,
      data: {
        bookingId,
        customerName: fullName,
        phone,
        service,
        date,
        depositAmount,
      },
      createdAt: serverTimestamp(),
      isoTimestamp: isoNow,
    }).catch(err => console.warn("[Server API] Admin notification dispatch notice:", err));

    return NextResponse.json({
      success: true,
      bookingId,
      docId: bookingRef.id,
      totalAmount,
      depositAmount,
      expiresAt: expiresAtMs,
      upiVpa: "bhawanisanker1967@okaxis",
      payeeName: "Bhawani Sankar",
    });
  } catch (err: any) {
    console.error("[Server API] create-session error:", err);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
