"use client";

import React, { useState } from "react";

export default function TrackPage() {
  const [bookingId, setBookingId] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", padding: "60px 20px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "32px", margin: "0 0 10px 0" }}>
          Track Booking & PDF Receipt
        </h1>
        <p style={{ color: "#8E8E93", fontSize: "14px" }}>
          Enter your Booking Reference Number (e.g. BK-2026-001)
        </p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", padding: "30px", borderRadius: "20px", border: "1px solid #E5E0D8", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder="e.g. BK-2026-001"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid #E5E0D8", fontSize: "15px" }}
          />
          <button
            onClick={() => setSearched(true)}
            style={{ backgroundColor: "#2C1320", color: "#D4AF37", border: "none", padding: "14px 24px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
          >
            Track Status
          </button>
        </div>

        {searched && (
          <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#F7EBE8", borderRadius: "12px" }}>
            <span style={{ fontSize: "12px", backgroundColor: "#27AE60", color: "#FFFFFF", padding: "4px 10px", borderRadius: "8px", fontWeight: "bold" }}>
              CONFIRMED & DEPOSIT LOGGED
            </span>
            <h3 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "20px", marginTop: "12px" }}>
              Booking #{bookingId || "BK-2026-001"}
            </h3>
            <p style={{ margin: "6px 0", fontSize: "14px" }}><strong>Customer:</strong> Priya Sharma</p>
            <p style={{ margin: "6px 0", fontSize: "14px" }}><strong>Service:</strong> Signature Royal Bridal Makeover</p>
            <p style={{ margin: "6px 0", fontSize: "14px" }}><strong>Location:</strong> Gorbandh Palace, Jodhpur</p>
            <p style={{ margin: "6px 0", fontSize: "14px" }}><strong>Advance Deposit Paid:</strong> ₹7,500 (Verified via UPI QR)</p>
          </div>
        )}
      </div>
    </main>
  );
}
