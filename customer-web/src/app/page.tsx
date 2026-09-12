import React from "react";
import { localBusinessSchema } from "../lib/seo";

export default function CustomerHomePage() {
  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#F9F5F0", color: "#2C1320" }}>
      {/* JSON-LD LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* 1. Hero Section */}
      <section
        style={{
          background: "linear-gradient(rgba(44, 19, 32, 0.85), rgba(44, 19, 32, 0.85)), url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200') center/cover",
          color: "#FFFFFF",
          padding: "90px 20px",
          textAlign: "center"
        }}
      >
        <span style={{ fontSize: "12px", letterSpacing: "3px", color: "#D4AF37", textTransform: "uppercase", fontWeight: "bold" }}>
          Official Digital Flagship
        </span>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "40px", letterSpacing: "2px", margin: "10px 0" }}>
          MAKEOVERS BY PRACHI
        </h1>
        <p style={{ fontSize: "17px", color: "#E8C5C8", marginTop: "6px" }}>
          Luxury Royal Rajasthani Bridal & Occasion Artistry • Jodhpur, Jaipur & Udaipur
        </p>
        <p style={{ maxWidth: "650px", margin: "20px auto", color: "#E5E0D8", fontSize: "15px", lineHeight: "1.6" }}>
          Seamless HD/Airbrush bridal aesthetics, traditional Poshak & Dupatta draping, and royal jewelry coordination. Certified professional with 4.93★ customer satisfaction rating.
        </p>
        <div style={{ marginTop: "34px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/book"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
              color: "#2C1320",
              padding: "16px 32px",
              borderRadius: "28px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            Book Your Wedding Date →
          </a>
          <a
            href="/services"
            style={{
              border: "1px solid #D4AF37",
              color: "#D4AF37",
              padding: "16px 32px",
              borderRadius: "28px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            View Pricing & Inclusions
          </a>
        </div>
      </section>

      {/* 2. Quick Access Multipage Navigation Bar */}
      <section style={{ backgroundColor: "#2C1320", padding: "20px", borderBottom: "1px solid rgba(212, 175, 55, 0.2)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "16px", textAlign: "center" }}>
          <a href="/services" style={{ color: "#E8C5C8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            ✨ Services & Rates
          </a>
          <a href="/gallery" style={{ color: "#E8C5C8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            📸 Bridal Gallery
          </a>
          <a href="/reviews" style={{ color: "#E8C5C8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            ⭐ 4.93★ Client Reviews
          </a>
          <a href="/jodhpur" style={{ color: "#E8C5C8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            📍 Jodhpur Studio Hub
          </a>
          <a href="/track" style={{ color: "#E8C5C8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            🧾 Track PDF Receipt
          </a>
        </div>
      </section>

      {/* 3. Signature Showcase Grid */}
      <section style={{ padding: "60px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", textAlign: "center", fontSize: "32px", margin: 0 }}>
          Signature Royal Rajasthani Styling
        </h2>
        <p style={{ textAlign: "center", color: "#8E8E93", marginBottom: "36px", fontSize: "15px" }}>
          Traditional Poshak & Dupatta Draping paired with heavy royal jewelry coordination
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", overflow: "hidden", border: "1px solid #E5E0D8" }}>
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"
              alt="Rajasthani Bridal Look"
              style={{ width: "100%", height: "280px", objectFit: "cover" }}
            />
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", margin: "0 0 6px 0", fontSize: "20px" }}>Royal Rajasthani Poshak Look</h3>
              <p style={{ color: "#555", fontSize: "13px" }}>Heavy Borla & Dupatta setting with sweat-proof 16-hour airbrush base.</p>
              <a href="/gallery" style={{ color: "#2C1320", fontWeight: "bold", textDecoration: "none", fontSize: "13px" }}>View Gallery →</a>
            </div>
          </div>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", overflow: "hidden", border: "1px solid #E5E0D8" }}>
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
              alt="Engagement Dewy Glam"
              style={{ width: "100%", height: "280px", objectFit: "cover" }}
            />
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", margin: "0 0 6px 0", fontSize: "20px" }}>Soft Dewy Engagement Glam</h3>
              <p style={{ color: "#555", fontSize: "13px" }}>Glowing glass-skin finish with romantic soft waves for Ring Ceremonies.</p>
              <a href="/gallery" style={{ color: "#2C1320", fontWeight: "bold", textDecoration: "none", fontSize: "13px" }}>View Gallery →</a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer style={{ backgroundColor: "#2C1320", color: "#FFFFFF", padding: "50px 20px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "24px", margin: 0 }}>MAKEOVERS BY PRACHI</h3>
        <p style={{ color: "#E8C5C8", fontSize: "14px", marginTop: "8px" }}>Jodhpur, Rajasthan • WhatsApp: +91 98290 12345</p>
        <div style={{ margin: "20px 0", display: "flex", gap: "20px", justifyContent: "center", fontSize: "13px" }}>
          <a href="/services" style={{ color: "#E5E0D8", textDecoration: "none" }}>Services</a>
          <a href="/gallery" style={{ color: "#E5E0D8", textDecoration: "none" }}>Gallery</a>
          <a href="/reviews" style={{ color: "#E5E0D8", textDecoration: "none" }}>Reviews</a>
          <a href="/book" style={{ color: "#D4AF37", textDecoration: "none", fontWeight: "bold" }}>Book Now</a>
        </div>
        <p style={{ color: "#8E8E93", fontSize: "11px", marginTop: "20px" }}>© 2026 Makeovers by Prachi. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
