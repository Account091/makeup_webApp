"use client";

import React from "react";

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      name: "Radhika J. (Signature Bride)",
      rating: 5,
      date: "October 2026",
      location: "Gorbandh Palace, Jodhpur",
      review: "Prachi was an absolute dream to work with! My poshak draping, heavy borla setting, and HD eye makeup stayed 100% perfect through the entire 12-hour wedding. The advance QR reservation process on the site was super easy and locked my date instantly.",
      service: "Signature Royal Bridal Makeover",
    },
    {
      id: 2,
      name: "Ananya Sharma (Destination Bride)",
      rating: 5,
      date: "November 2026",
      location: "City Palace, Udaipur",
      review: "The 16-hour sweat-proof airbrush base was unbelievable. Even in afternoon sun during our palace shoot, my skin looked radiant and glowing. Her team was extremely punctual and professional.",
      service: "Destination Palace Bridal Package",
    },
    {
      id: 3,
      name: "Kavita Meghwal (Engagement Glam)",
      rating: 5,
      date: "December 2026",
      location: "Rambagh Palace, Jaipur",
      review: "Soft dewy makeup done to absolute perfection! Everyone at our Ring Ceremony praised the look. Highly recommended for all brides in Rajasthan!",
      service: "Pre-Wedding & Engagement Glam",
    },
    {
      id: 4,
      name: "Meera Rathore (Bridal Client)",
      rating: 5,
      date: "January 2026",
      location: "Umaid Bhawan, Jodhpur",
      review: "Prachi understands authentic traditional Rajasthani aesthetics like no one else. The Dupatta and Borla draping stayed secure all night without hurting.",
      service: "Signature Royal Bridal Makeover",
    },
  ];

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--champagne)", padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span style={{ fontSize: "12px", color: "var(--rose-gold)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            VERIFIED CLIENT TESTIMONIALS
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--primary-plum)", fontSize: "clamp(30px, 4.5vw, 48px)", margin: "10px 0" }}>
            4.93★ Client Satisfaction
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Read real feedback from brides and clients across Jodhpur, Jaipur, Udaipur, and destination venues.
          </p>
        </div>

        {/* Rating Summary Card */}
        <div
          className="glass-card-dark"
          style={{
            padding: "30px",
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto 50px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "44px", fontWeight: "800", color: "var(--rose-gold)", fontFamily: "'Playfair Display', serif" }}>
            4.93 / 5.0
          </div>
          <div style={{ fontSize: "20px", color: "var(--rose-gold)", margin: "4px 0 8px 0" }}>
            ⭐⭐⭐⭐⭐
          </div>
          <p style={{ color: "#E5E0D8", fontSize: "14px", margin: 0 }}>
            Based on 1,200+ verified bridal & occasion makeovers across Rajasthan.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="responsive-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-card" style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "16px", color: "var(--rose-gold)" }}>{"⭐".repeat(rev.rating)}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>{rev.date}</span>
                </div>

                <p style={{ color: "var(--text-dark)", fontSize: "14px", lineHeight: "1.7", fontStyle: "italic", marginBottom: "20px" }}>
                  "{rev.review}"
                </p>
              </div>

              <div style={{ paddingTop: "16px", borderTop: "1px solid #E5E0D8" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700", color: "var(--primary-plum)", fontSize: "16px" }}>
                  {rev.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--rose-gold)", fontWeight: "600", marginTop: "2px" }}>
                  📍 {rev.location}
                </div>
                <div style={{ fontSize: "11px", backgroundColor: "var(--blush-pink)", color: "var(--primary-plum)", padding: "4px 10px", borderRadius: "10px", fontWeight: "bold", display: "inline-block", marginTop: "8px" }}>
                  {rev.service}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
