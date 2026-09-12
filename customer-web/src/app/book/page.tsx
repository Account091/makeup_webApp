"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const GOOGLE_SHEET_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwrW-LiBBsmj2MBqsCaHUw55oqqXuIqWndH5oUJk5OGtQDNu_bNYIP_yGys3J70U9te/exec";

const SERVICE_PRICES: Record<string, { base: number; deposit: number }> = {
  "Signature Bridal Makeover": { base: 25000, deposit: 7500 },
  "Pre-Wedding & Engagement Glam": { base: 15000, deposit: 4500 },
  "Party & Festive Makeover": { base: 8500, deposit: 2500 },
  "Destination Bridal Package": { base: 45000, deposit: 13500 },
};

export default function BookingWizardPage() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState("Signature Bridal Makeover");
  const [packageType, setPackageType] = useState("Royal Rajasthani Poshak Package");
  const [date, setDate] = useState("2026-11-20");
  const [readyTime, setReadyTime] = useState("16:00");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("Jodhpur");
  const [guestCount, setGuestCount] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Payment & Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes = 300s
  const [timerActive, setTimerActive] = useState(false);
  const [paymentProofName, setPaymentProofName] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Price calculations
  const priceInfo = SERVICE_PRICES[service] || { base: 25000, deposit: 7500 };
  const travelFee = city.toLowerCase().trim() === "jodhpur" ? 0 : 3500;
  const totalAmount = priceInfo.base + travelFee;
  const depositAmount = priceInfo.deposit;

  // 5-Minute Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStartPaymentStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Please enter your Full Name and WhatsApp Phone Number.");
      return;
    }
    const generatedId = `BK-${Date.now().toString().slice(-6)}`;
    setBookingId(generatedId);
    setStep(5);
    setTimerSeconds(300);
    setTimerActive(true);
  };

  const resetTimer = () => {
    setTimerSeconds(300);
    setTimerActive(true);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("bhawanisanker1967@okaxis");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timerSeconds <= 0) {
      alert("Your 5-minute reservation window has expired. Please restart the timer to lock your date.");
      return;
    }

    setLoading(true);

    const bookingPayload = {
      timestamp: new Date().toISOString(),
      booking_id: bookingId,
      service_name: service,
      package_name: packageType,
      event_date: date,
      ready_time: readyTime,
      venue_location: venue || "Studio",
      city: city || "Jodhpur",
      guest_count: guestCount,
      payer_name: fullName,
      payer_phone: phone,
      payer_email: email || "guest@makeoversbyprachi.com",
      status: "DEPOSIT_PENDING_VERIFICATION",
      amount_inr: totalAmount,
      deposit_inr: depositAmount,
      payee_name: "Bhawani Sankar",
      upi_id: "bhawanisanker1967@okaxis",
      utr_number: utrNumber || "N/A",
      screenshot_proof: paymentProofName || "uploaded_screenshot.png",
      source: "CUSTOMER_WEB_NEXTJS",
    };

    // 1. Dispatch to Online Google Sheet Web App endpoint
    try {
      await fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });
      console.log("[Next.js Web] Synced payment deposit inquiry to Google Sheet.");
    } catch (err) {
      console.warn("[Next.js Web] Sheet sync notice:", err);
    }

    // 2. Dispatch to Firestore with a 2-second timeout race condition
    try {
      const firestorePromise = addDoc(collection(db, "bookings"), {
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
          basePrice: priceInfo.base,
          travelFee,
          totalAmount,
          depositRequired: depositAmount,
          depositPaid: depositAmount,
        },
        payment: {
          upiId: "bhawanisanker1967@okaxis",
          payeeName: "Bhawani Sankar",
          utrNumber: utrNumber || "N/A",
          proofFile: paymentProofName || "uploaded_screenshot.png",
        },
        status: "depositPendingVerification",
        createdAt: serverTimestamp(),
      });

      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.race([firestorePromise, timeoutPromise]);
    } catch (err) {
      console.error("[Next.js Web] Firestore write error:", err);
    }

    setLoading(false);
    setTimerActive(false);
    setSubmitted(true);
  };

  // QR Code URL for Bhawani Sankar (bhawanisanker1967@okaxis)
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=bhawanisanker1967@okaxis%26pn=Bhawani%20Sankar%26am=${depositAmount}%26cu=INR`;

  if (submitted) {
    return (
      <main
        style={{
          fontFamily: "'Montserrat', sans-serif",
          backgroundColor: "#2C1320",
          backgroundImage: "radial-gradient(circle at 50% 20%, #421D31 0%, #1A0B13 100%)",
          minHeight: "100vh",
          padding: "60px 20px",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "580px",
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            padding: "40px 28px",
            borderRadius: "24px",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>👑</div>
          <span
            style={{
              backgroundColor: "rgba(212, 175, 55, 0.15)",
              color: "#D4AF37",
              border: "1px solid #D4AF37",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            Reservation Priority Locked
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#D4AF37",
              fontSize: "30px",
              margin: "18px 0 8px 0",
            }}
          >
            Deposit & Booking Submitted!
          </h2>
          <p style={{ color: "#E5E0D8", fontSize: "15px", lineHeight: "1.6" }}>
            Thank you <strong>{fullName}</strong>! Your deposit payment of <strong>₹{depositAmount.toLocaleString("en-IN")}</strong> for <strong>{service}</strong> on <strong>{date}</strong> has been logged in our Online Ledger.
          </p>

          <div
            style={{
              margin: "24px 0",
              padding: "20px",
              backgroundColor: "rgba(44, 19, 32, 0.8)",
              borderRadius: "16px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              textAlign: "left",
            }}
          >
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
              <strong style={{ color: "#D4AF37" }}>Booking Ref ID:</strong> #{bookingId}
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
              <strong style={{ color: "#D4AF37" }}>Client Name:</strong> {fullName} ({phone})
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
              <strong style={{ color: "#D4AF37" }}>Service:</strong> {service} ({packageType})
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
              <strong style={{ color: "#D4AF37" }}>Event Location:</strong> {venue || "Studio"}, {city}
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
              <strong style={{ color: "#D4AF37" }}>Total Package Quote:</strong> ₹{totalAmount.toLocaleString("en-IN")}
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
              <strong style={{ color: "#D4AF37" }}>Advance Lock Paid:</strong> ₹{depositAmount.toLocaleString("en-IN")} (UPI: bhawanisanker1967@okaxis)
            </p>
            {utrNumber && (
              <p style={{ margin: "6px 0", fontSize: "14px", color: "#E5E0D8" }}>
                <strong style={{ color: "#D4AF37" }}>Transaction UTR:</strong> {utrNumber}
              </p>
            )}
          </div>

          <p style={{ fontSize: "13px", color: "#B3A598", marginBottom: "24px" }}>
            ⚡ Prachi's team will verify your payment proof and send your official PDF Confirmation Invoice via WhatsApp within 2 hours.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <a
              href="/track"
              style={{
                display: "inline-block",
                backgroundColor: "transparent",
                color: "#D4AF37",
                border: "1px solid #D4AF37",
                padding: "12px 24px",
                borderRadius: "20px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Track Invoice & PDF →
            </a>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
                color: "#2C1320",
                padding: "12px 24px",
                borderRadius: "20px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Return to Website
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        fontFamily: "'Montserrat', sans-serif",
        backgroundColor: "#F9F5F0",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          padding: "36px",
          borderRadius: "24px",
          border: "1px solid #E5E0D8",
          boxShadow: "0 12px 40px rgba(44, 19, 32, 0.08)",
        }}
      >
        {/* Dynamic Progress Bar */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#2C1320", fontWeight: "600" }}>
            <span>Step {step} of 5</span>
            <span>{step === 1 ? "20%" : step === 2 ? "40%" : step === 3 ? "60%" : step === 4 ? "80%" : "100%"} Completed</span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#E5E0D8", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${step * 20}%`,
                height: "100%",
                background: "linear-gradient(90deg, #2C1320, #D4AF37)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1320", fontSize: "26px", textAlign: "center", margin: "0 0 6px 0" }}>
          Bridal & Occasion Date Lock
        </h1>
        <p style={{ textAlign: "center", color: "#776B61", fontSize: "14px", marginBottom: "28px" }}>
          Makeovers by Prachi • Luxury Bridal & Occasion Artistry (Jodhpur, Rajasthan)
        </p>

        {/* Dynamic Live Quote Summary Box */}
        <div
          style={{
            backgroundColor: "#FDF9F5",
            border: "1px solid #E8D9C5",
            borderRadius: "14px",
            padding: "14px 18px",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#8C7A6B", fontWeight: "bold" }}>Selected Package</span>
            <div style={{ fontWeight: "700", color: "#2C1320", fontSize: "15px" }}>{service}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#8C7A6B", fontWeight: "bold" }}>Estimated Total</span>
            <div style={{ fontWeight: "800", color: "#D4AF37", fontSize: "17px" }}>₹{totalAmount.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <form onSubmit={step === 4 ? handleStartPaymentStep : handleFinalSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "14px", fontSize: "18px" }}>1. Select Beauty Service</h3>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E5E0D8",
                  fontSize: "15px",
                  marginBottom: "18px",
                  backgroundColor: "#FFFFFF",
                  color: "#2C1320",
                }}
              >
                <option value="Signature Bridal Makeover">Signature Bridal Makeover — ₹25,000 (Airbrush, HD Lash, Hair & Poshak Draping)</option>
                <option value="Pre-Wedding & Engagement Glam">Pre-Wedding & Engagement Glam — ₹15,000 (HD Makeup & Styling)</option>
                <option value="Party & Festive Makeover">Party & Festive Makeover — ₹8,500 (Glow Finish)</option>
                <option value="Destination Bridal Package">Destination Bridal Package — ₹45,000 (Multi-Event Royal Service)</option>
              </select>

              <h4 style={{ color: "#2C1320", margin: "18px 0 8px 0", fontSize: "15px" }}>Select Royal Styling Inclusions</h4>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #E5E0D8",
                  fontSize: "15px",
                  marginBottom: "28px",
                  backgroundColor: "#FFFFFF",
                  color: "#2C1320",
                }}
              >
                <option value="Royal Rajasthani Poshak Package">Royal Rajasthani Poshak & Jewelry Package</option>
                <option value="Airbrush Glam Package">HD Airbrush & Glass Skin Package</option>
                <option value="Soft Dewy Engagement Package">Soft Dewy Minimalist Engagement Package</option>
              </select>

              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #2C1320, #421D31)",
                  color: "#D4AF37",
                  padding: "16px",
                  borderRadius: "14px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  boxShadow: "0 6px 16px rgba(44, 19, 32, 0.2)",
                }}
              >
                Next: Date & Location Details →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "14px", fontSize: "18px" }}>2. Event Date & Venue Location</h3>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>Event Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 16px 0", fontSize: "15px" }}
              />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>Venue / Hotel Name & Address *</label>
              <input
                type="text"
                placeholder="e.g. Gorbandh Palace, Jodhpur"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 16px 0", fontSize: "15px" }}
              />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>City / Destination *</label>
              <input
                type="text"
                placeholder="Jodhpur / Jaipur / Udaipur / Destination"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 24px 0", fontSize: "15px" }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#2C1320", fontWeight: "600", cursor: "pointer" }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ flex: 2, background: "linear-gradient(135deg, #2C1320, #421D31)", color: "#D4AF37", padding: "14px", borderRadius: "12px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "15px" }}
                >
                  Next: Party & Timing →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "14px", fontSize: "18px" }}>3. Guest Count & Ready-by Time</h3>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>Number of Persons (Bride + Party):</label>
              <input
                type="number"
                min="1"
                max="25"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 16px 0", fontSize: "15px" }}
              />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>Required Ready-by Time:</label>
              <input
                type="time"
                value={readyTime}
                onChange={(e) => setReadyTime(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 24px 0", fontSize: "15px" }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#2C1320", fontWeight: "600", cursor: "pointer" }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  style={{ flex: 2, background: "linear-gradient(135deg, #2C1320, #421D31)", color: "#D4AF37", padding: "14px", borderRadius: "12px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "15px" }}
                >
                  Next: Contact Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "14px", fontSize: "18px" }}>4. Bride / Client Contact Info</h3>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Radhika Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 16px 0", fontSize: "15px" }}
              />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>WhatsApp Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98290 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 16px 0", fontSize: "15px" }}
              />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>Email Address</label>
              <input
                type="email"
                placeholder="radhika@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 24px 0", fontSize: "15px" }}
              />

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#2C1320", fontWeight: "600", cursor: "pointer" }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
                    color: "#2C1320",
                    padding: "16px",
                    borderRadius: "14px",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    boxShadow: "0 6px 18px rgba(212, 175, 55, 0.35)",
                  }}
                >
                  Proceed to UPI Payment & Lock Slot →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: INSTANT UPI PAYMENT & 5-MINUTE TIMER */}
          {step === 5 && (
            <div>
              {/* Live 5-Minute Countdown Timer Banner */}
              <div
                style={{
                  backgroundColor: timerSeconds <= 60 ? "#FFF0F0" : "#FFF9EE",
                  border: `2px solid ${timerSeconds <= 60 ? "#FF3B30" : "#D4AF37"}`,
                  borderRadius: "16px",
                  padding: "16px",
                  textAlign: "center",
                  marginBottom: "24px",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "20px" }}>⏱️</span>
                  <span style={{ fontWeight: "800", color: timerSeconds <= 60 ? "#FF3B30" : "#2C1320", fontSize: "16px" }}>
                    {timerSeconds > 0 ? "5-Minute Date Reservation Active" : "Reservation Timer Expired"}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "36px",
                    fontWeight: "900",
                    color: timerSeconds <= 60 ? "#FF3B30" : "#2C1320",
                    letterSpacing: "2px",
                  }}
                >
                  {formatTimer(timerSeconds)}
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#665C53" }}>
                  {timerSeconds > 0
                    ? "Complete advance deposit within 5 minutes to reserve your wedding date."
                    : "Your 5-minute reservation window has lapsed."}
                </p>
                {timerSeconds === 0 && (
                  <button
                    type="button"
                    onClick={resetTimer}
                    style={{
                      marginTop: "12px",
                      backgroundColor: "#2C1320",
                      color: "#D4AF37",
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    🔄 Restart 5-Minute Timer
                  </button>
                )}
              </div>

              {/* UPI QR Code Container */}
              <div style={{ textAlign: "center", backgroundColor: "#F9F5F0", padding: "20px", borderRadius: "18px", border: "1px solid #E5E0D8", marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2C1320", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Scan UPI QR Code to Pay Deposit
                </div>
                
                <div style={{ display: "inline-block", backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "16px", border: "2px solid #D4AF37", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
                  <img
                    src={upiQrUrl}
                    alt="UPI Payment QR Code"
                    style={{ width: "220px", height: "220px", borderRadius: "8px", display: "block", margin: "0 auto" }}
                  />
                </div>

                {/* Payee Details */}
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#2C1320" }}>Payee: Bhawani Sankar</div>
                  <div style={{ fontSize: "14px", color: "#421D31", margin: "4px 0 10px 0" }}>
                    UPI ID: <strong>bhawanisanker1967@okaxis</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                      backgroundColor: "#2C1320",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "✓ Copied to Clipboard!" : "📋 Copy UPI ID"}
                  </button>
                </div>

                <div
                  style={{
                    margin: "16px 0 0 0",
                    padding: "10px 14px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#2C1320",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                  }}
                >
                  <span>30% Advance Deposit:</span>
                  <span style={{ color: "#D4AF37", fontSize: "15px" }}>₹{depositAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Upload Screenshot / UTR Number Form */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>
                  Transaction UTR / Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 426189023412 or UPI Ref"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E5E0D8", margin: "0 0 14px 0", fontSize: "15px" }}
                />

                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px", color: "#2C1320" }}>
                  Upload Payment Screenshot / Proof
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPaymentProofName(e.target.files[0].name);
                    }
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E5E0D8", fontSize: "14px" }}
                />
                {paymentProofName && (
                  <div style={{ fontSize: "12px", color: "#28A745", fontWeight: "bold", marginTop: "6px" }}>
                    ✓ Selected proof: {paymentProofName}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", color: "#2C1320", fontWeight: "600", cursor: "pointer" }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || timerSeconds === 0}
                  style={{
                    flex: 2,
                    background: timerSeconds === 0 ? "#A8A8A8" : "linear-gradient(135deg, #D4AF37, #AA7C11)",
                    color: "#2C1320",
                    padding: "16px",
                    borderRadius: "14px",
                    fontWeight: "bold",
                    border: "none",
                    cursor: timerSeconds === 0 ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    boxShadow: timerSeconds === 0 ? "none" : "0 6px 18px rgba(212, 175, 55, 0.35)",
                  }}
                >
                  {loading ? "Verifying & Syncing Ledger..." : "Submit Payment & Lock Booking →"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
