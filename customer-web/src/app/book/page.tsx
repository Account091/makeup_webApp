"use client";

import React, { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    try {
      // SUBMIT REQUEST METADATA ONLY (Commercial prices are computed server-side in Cloud Functions)
      await addDoc(collection(db, "bookings"), {
        customerDetails: {
          fullName,
          phone,
          email: email || "guest@example.com",
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
          basePrice: 0,
          travelFee: 0,
          depositRequired: 0,
          depositPaid: 0,
        },
        status: "awaitingApproval",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Booking inquiry error:", err);
      alert("Submission error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#F9F5F0", minHeight: "100vh", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", backgroundColor: "#FFFFFF", padding: "40px 24px", borderRadius: "20px", border: "1px solid #E5E0D8" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "28px" }}>Booking Request Received! 🎉</h2>
          <p style={{ color: "#2C1320", marginTop: "12px", lineHeight: "1.6" }}>
            Thank you <strong>{fullName}</strong>. Prachi will review your date availability for <strong>{date}</strong> in <strong>{city}</strong> and send a customized quote.
          </p>
          <a href="/" style={{ marginTop: "24px", display: "inline-block", backgroundColor: "#2C1320", color: "#FFFFFF", padding: "12px 24px", borderRadius: "20px", textDecoration: "none" }}>
            Return to Homepage
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#F9F5F0", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "20px", border: "1px solid #E5E0D8" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "24px", textAlign: "center" }}>
          Book Your Date | Step {step} of 4
        </h1>

        <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
          {step === 1 && (
            <div>
              <h3>1. Select Service</h3>
              <select value={service} onChange={(e) => setService(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "12px 0" }}>
                <option value="Signature Bridal Makeover">Signature Bridal Makeover</option>
                <option value="Pre-Wedding & Engagement Glam">Pre-Wedding & Engagement Glam</option>
                <option value="Party & Festive Makeover">Party & Festive Makeover</option>
                <option value="Destination Bridal Package">Destination Bridal Package</option>
              </select>
              <button type="button" onClick={() => setStep(2)} style={{ width: "100%", background: "#2C1320", color: "#D4AF37", padding: "12px", borderRadius: "20px", fontWeight: "bold" }}>
                Next: Event Date & Location →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>2. Date & Venue Details</h3>
              <label>Event Date:</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />
              
              <label>Venue / Hotel Address:</label>
              <input type="text" placeholder="Gorbandh Palace" value={venue} onChange={(e) => setVenue(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <label>City:</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "12px" }}>Back</button>
                <button type="button" onClick={() => setStep(3)} style={{ flex: 1, background: "#2C1320", color: "#D4AF37", padding: "12px", borderRadius: "20px", fontWeight: "bold" }}>Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>3. Party Size & Ready Time</h3>
              <label>Number of People:</label>
              <input type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <label>Ready-by Time:</label>
              <input type="time" value={readyTime} onChange={(e) => setReadyTime(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "12px" }}>Back</button>
                <button type="button" onClick={() => setStep(4)} style={{ flex: 1, background: "#2C1320", color: "#D4AF37", padding: "12px", borderRadius: "20px", fontWeight: "bold" }}>Next: Contact Info →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3>4. Contact Details</h3>
              <label>Full Name *</label>
              <input type="text" required placeholder="Priya Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <label>WhatsApp Phone Number *</label>
              <input type="tel" required placeholder="+91 98290 12345" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <label>Email Address</label>
              <input type="email" placeholder="priya@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", margin: "8px 0 16px 0" }} />

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setStep(3)} style={{ flex: 1, padding: "12px" }}>Back</button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: "linear-gradient(135deg, #D4AF37, #AA7C11)", color: "#2C1320", padding: "12px", borderRadius: "20px", fontWeight: "bold" }}>
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
