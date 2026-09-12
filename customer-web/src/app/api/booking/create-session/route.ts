import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    if (!fullName || !phone || !service) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    // 1. Authoritative Pricing Calculation on Server
    const basePrice = SERVICE_PRICES[service] || 25000;
    const cityClean = (city || "").toLowerCase().trim();
    const travelFee = cityClean === "jodhpur" || cityClean === "" ? 0 : cityClean === "jaipur" || cityClean === "udaipur" ? 3500 : 8500;
    const totalAmount = basePrice + travelFee;
    const depositAmount = Math.round(totalAmount * 0.3);

    // 2. Authoritative 5-Minute Expiry (Server Timestamp + 300 seconds)
    const now = Date.now();
    const expiresAt = now + 300 * 1000; // 5 minutes
    const bookingId = `BK-${now.toString().slice(-6)}`;

    // 3. Create Document in Firestore Source of Truth
    const docRef = await addDoc(collection(db, "bookings"), {
      bookingId,
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
      expiresAt: new Date(expiresAt).toISOString(),
      status: "DEPOSIT_PENDING",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      bookingId,
      docId: docRef.id,
      totalAmount,
      depositAmount,
      expiresAt,
      upiVpa: "bhawanisanker1967@okaxis",
      payeeName: "Bhawani Sankar",
    });
  } catch (err: any) {
    console.error("[Server API] create-session error:", err);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
