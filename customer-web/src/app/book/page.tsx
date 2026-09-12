"use client";

import React, { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const GOOGLE_SHEET_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwrW-LiBBsmj2MBqsCaHUw55oqqXuIqWndH5oUJk5OGtQDNu_bNYIP_yGys3J70U9te/exec";

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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Please enter your Full Name and WhatsApp Phone Number.");
      return;
    }

    setLoading(true);

    const bookingPayload = {
      timestamp: new Date().toISOString(),
      booking_id: `BK-${Date.now()}`,
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
      status: "AWAITING_APPROVAL",
      source: "CUSTOMER_WEB_NEXTJS",
    };

    // 1. Dispatch to Online Google Sheet Web App endpoint
    try {
      await fetch(GOOGLE_SHEET_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });
      console.log("[Next.js Web] Synced booking inquiry to Google Sheet.");
    } catch (err) {
      console.warn("[Next.js Web] Sheet sync notice:", err);
    }

    // 2. Dispatch to Firestore with a 2-second timeout race condition
    try {
      const firestorePromise = addDoc(collection(db, "bookings"), {
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
          basePrice: 25000,
          travelFee: city.toLowerCase() === "jodhpur" ? 0 : 3500,
          depositRequired: 7500,
          depositPaid: 0,
        },
        status: "awaitingApproval",
        createdAt: serverTimestamp(),
      });

      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.race([firestorePromise, timeoutPromise]);
    } catch (err) {
      console.error("[Next.js Web] Firestore write error:", err);
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#F9F5F0", minHeight: "100vh", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: "550px", margin: "0 auto", backgroundColor: "#FFFFFF", padding: "40px 24px", borderRadius: "20px", border: "1px solid #E5E0D8", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "50px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "28px", margin: "0 0 12px 0" }}>Booking Request Received!</h2>
          <p style={{ color: "#2C1320", fontSize: "15px", lineHeight: "1.6" }}>
            Thank you <strong>{fullName}</strong>! Your inquiry for <strong>{service}</strong> on <strong>{date}</strong> in <strong>{city}</strong> has been logged in our Online Ledger and sent to Prachi.
          </p>
          <div style={{ margin: "24px 0", padding: "16px", backgroundColor: "#F7EBE8", borderRadius: "12px", textAlign: "left" }}>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#2C1320" }}><strong>Selected Service:</strong> {service}</p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#2C1320" }}><strong>Estimated Quote:</strong> ₹25,000 + GST</p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "#2C1320" }}><strong>Deposit Required:</strong> ₹7,500 (30% Lock)</p>
          </div>
          <a href="/" style={{ display: "inline-block", backgroundColor: "#2C1320", color: "#FFFFFF", padding: "14px 28px", borderRadius: "20px", textDecoration: "none", fontWeight: "bold" }}>
            Return to Homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#F9F5F0", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "650px", margin: "0 auto", backgroundColor: "#FFFFFF", padding: "32px", borderRadius: "20px", border: "1px solid #E5E0D8", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "26px", textAlign: "center", margin: "0 0 8px 0" }}>
          Book Your Date | Step {step} of 4
        </h1>
        <p style={{ textAlign: "center", color: "#8E8E93", fontSize: "14px", marginBottom: "24px" }}>
          Luxury Bridal & Occasion Artistry by Prachi (Jodhpur, Rajasthan)
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "12px" }}>1. Select Beauty Service</h3>
              <select value={service} onChange={(e) => setService(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #E5E0D8", fontSize: "15px", marginBottom: "16px" }}>
                <option value="Signature Bridal Makeover">Signature Bridal Makeover — ₹25,000 (Airbrush, HD Lash, Hair & Draping)</option>
                <option value="Pre-Wedding & Engagement Glam">Pre-Wedding & Engagement Glam — ₹15,000 (HD Makeup & Styling)</option>
                <option value="Party & Festive Makeover">Party & Festive Makeover — ₹8,500 (Glow Finish)</option>
                <option value="Destination Bridal Package">Destination Bridal Package — ₹45,000 (Multi-Event Royal Service)</option>
              </select>

              <h4 style={{ color: "#2C1320", margin: "16px 0 8px 0" }}>Select Bridal Package</h4>
              <select value={packageType} onChange={(e) => setPackageType(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #E5E0D8", fontSize: "15px", marginBottom: "24px" }}>
                <option value="Royal Rajasthani Poshak Package">Royal Rajasthani Poshak & Jewelry Package</option>
                <option value="Airbrush Glam Package">HD Airbrush & Glass Skin Package</option>
                <option value="Soft Dewy Engagement Package">Soft Dewy Minimalist Engagement Package</option>
              </select>

              <button type="button" onClick={() => setStep(2)} style={{ width: "100%", background: "#2C1320", color: "#D4AF37", padding: "14px", borderRadius: "20px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "16px" }}>
                Next: Event Date & Venue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "12px" }}>2. Date & Location Details</h3>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Event Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 16px 0" }} />
              
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Venue / Hotel Address *</label>
              <input type="text" placeholder="e.g. Gorbandh Palace, Jodhpur" value={venue} onChange={(e) => setVenue(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 16px 0" }} />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>City *</label>
              <input type="text" placeholder="Jodhpur / Jaipur / Udaipur" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 24px 0" }} />

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", cursor: "pointer" }}>Back</button>
                <button type="button" onClick={() => setStep(3)} style={{ flex: 2, background: "#2C1320", color: "#D4AF37", padding: "14px", borderRadius: "20px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Next: Party & Ready Time →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "12px" }}>3. Guest Count & Timing</h3>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Number of People to get makeover:</label>
              <input type="number" min="1" max="20" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 16px 0" }} />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Required Ready-by Time:</label>
              <input type="time" value={readyTime} onChange={(e) => setReadyTime(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 24px 0" }} />

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", cursor: "pointer" }}>Back</button>
                <button type="button" onClick={() => setStep(4)} style={{ flex: 2, background: "#2C1320", color: "#D4AF37", padding: "14px", borderRadius: "20px", fontWeight: "bold", border: "none", cursor: "pointer" }}>Next: Contact Details →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ color: "#2C1320", marginBottom: "12px" }}>4. Contact Details</h3>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Full Name *</label>
              <input type="text" required placeholder="harsh vyas" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 16px 0" }} />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>WhatsApp Phone Number *</label>
              <input type="tel" required placeholder="+91 98290 12345" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 16px 0" }} />

              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "14px" }}>Email Address</label>
              <input type="email" placeholder="harshitvyas880@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #E5E0D8", margin: "0 0 24px 0" }} />

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setStep(3)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #E5E0D8", backgroundColor: "#FFFFFF", cursor: "pointer" }}>Back</button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: "linear-gradient(135deg, #D4AF37, #AA7C11)", color: "#2C1320", padding: "14px", borderRadius: "20px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "16px" }}>
                  {loading ? "Submitting..." : "Submit Booking Request"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
