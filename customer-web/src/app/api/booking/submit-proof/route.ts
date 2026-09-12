import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const GOOGLE_SHEET_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwrW-LiBBsmj2MBqsCaHUw55oqqXuIqWndH5oUJk5OGtQDNu_bNYIP_yGys3J70U9te/exec";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, utrNumber, paymentProofName } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing Booking Ref ID" }, { status: 400 });
    }

    // 1. Query Firestore Source of Truth for session
    const q = query(collection(db, "bookings"), where("bookingId", "==", bookingId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Booking session not found" }, { status: 404 });
    }

    const bookingDoc = querySnapshot.docs[0];
    const bookingData = bookingDoc.data();

    // 2. Server-side Expiry Enforcement
    const expiresAtMs = new Date(bookingData.expiresAt).getTime();
    const nowMs = Date.now();

    if (nowMs > expiresAtMs) {
      await updateDoc(doc(db, "bookings", bookingDoc.id), {
        status: "EXPIRED",
        "payment.status": "EXPIRED",
      });
      return NextResponse.json(
        { error: "5-Minute reservation window has expired. Please restart the booking session." },
        { status: 410 }
      );
    }

    // 3. Server-authoritative update in Firestore
    await updateDoc(doc(db, "bookings", bookingDoc.id), {
      status: "PAYMENT_PROOF_SUBMITTED",
      "payment.utrNumber": utrNumber || "N/A",
      "payment.proofFileName": paymentProofName || "uploaded_screenshot.png",
      "payment.status": "VERIFICATION_PENDING",
      submittedAt: new Date().toISOString(),
    });

    // 4. Server-Side Dispatch to Google Sheets Secondary Mirror
    const ledgerPayload = {
      timestamp: new Date().toISOString(),
      booking_id: bookingId,
      customer_name: bookingData.customerDetails?.fullName,
      phone: bookingData.customerDetails?.phone,
      service_name: bookingData.serviceTitle,
      package_name: bookingData.packageName,
      total_amount_inr: bookingData.commercials?.totalAmount,
      deposit_amount_inr: bookingData.commercials?.depositRequired,
      utr_number: utrNumber || "N/A",
      proof_file: paymentProofName || "uploaded_screenshot.png",
      status: "PAYMENT_PROOF_SUBMITTED",
      source: "SERVER_AUTHORITATIVE_API",
    };

    try {
      await fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ledgerPayload),
      });
      console.log("[Server API] Dispatched operational ledger mirror entry to Google Sheets.");
    } catch (sheetErr) {
      console.warn("[Server API] Sheets mirror dispatch notice:", sheetErr);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      status: "PAYMENT_PROOF_SUBMITTED",
      message: "Payment proof submitted for admin verification",
    });
  } catch (err: any) {
    console.error("[Server API] submit-proof error:", err);
    return NextResponse.json({ error: "Failed to submit payment proof" }, { status: 500 });
  }
}
