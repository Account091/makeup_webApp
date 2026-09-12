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
          padding: "80px 20px",
          textAlign: "center"
        }}
      >
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "36px", letterSpacing: "2px" }}>
          MAKEOVERS BY PRACHI
        </h1>
        <p style={{ fontSize: "16px", color: "#E8C5C8", marginTop: "10px" }}>
          Luxury Bridal & Occasion Makeup Artistry • Jodhpur, Rajasthan
        </p>
        <p style={{ maxWidth: "600px", margin: "20px auto", color: "#E5E0D8", fontSize: "14px", lineHeight: "1.6" }}>
          Specializing in seamless HD/Airbrush bridal aesthetics, traditional Rajasthani Poshak draping, and royal jewelry coordination.
        </p>
        <div style={{ marginTop: "30px" }}>
          <a
            href="/book"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
              color: "#2C1320",
              padding: "14px 28px",
              borderRadius: "24px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block",
              marginRight: "12px"
            }}
          >
            Book Your Wedding Date
          </a>
          <a
            href="#services"
            style={{
              border: "1px solid #D4AF37",
              color: "#D4AF37",
              padding: "14px 28px",
              borderRadius: "24px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            Explore Bridal Work
          </a>
        </div>
      </section>

      {/* 2. Trust Proof Bar */}
      <section style={{ backgroundColor: "#E8C5C8", padding: "16px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto", fontSize: "13px", fontWeight: "600" }}>
          <span>✓ Certified Professional Makeup Artist</span>
          <span>✓ Jodhpur Studio & Destination Travel</span>
          <span>✓ Traditional Rajasthani Poshak Styling</span>
        </div>
      </section>

      {/* 3. Signature Showcase */}
      <section style={{ padding: "60px 20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", textAlign: "center", fontSize: "28px" }}>
          Signature Royal Rajasthani Styling
        </h2>
        <p style={{ textAlign: "center", color: "#8E8E93", marginBottom: "30px" }}>
          Traditional Poshak & Dupatta Draping paired with heavy royal jewelry coordination
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <img
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"
            alt="Rajasthani Bridal Look"
            style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "16px" }}
          />
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
            alt="Engagement Dewy Glam"
            style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "16px" }}
          />
        </div>
      </section>

      {/* 4. Services Section */}
      <section id="services" style={{ backgroundColor: "#FFFFFF", padding: "60px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", textAlign: "center", fontSize: "28px", marginBottom: "40px" }}>
            Luxury Beauty Services & Packages
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {/* Service 1 */}
            <div style={{ border: "1px solid #E5E0D8", borderRadius: "16px", padding: "24px", backgroundColor: "#F9F5F0" }}>
              <span style={{ fontSize: "12px", background: "#E8C5C8", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>BRIDAL</span>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "20px", marginTop: "12px" }}>Signature Bridal Makeover</h3>
              <p style={{ color: "#D4AF37", fontWeight: "bold", fontSize: "16px" }}>Starting at ₹15,000</p>
              <p style={{ color: "#8E8E93", fontSize: "13px", margin: "12px 0" }}>HD/Airbrush finish, traditional Poshak draping, lashes, and hair extensions placement.</p>
              <a href="/book" style={{ color: "#2C1320", fontWeight: "bold", textDecoration: "underline", fontSize: "14px" }}>Request Date →</a>
            </div>
            {/* Service 2 */}
            <div style={{ border: "1px solid #E5E0D8", borderRadius: "16px", padding: "24px", backgroundColor: "#F9F5F0" }}>
              <span style={{ fontSize: "12px", background: "#E8C5C8", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>ENGAGEMENT</span>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "20px", marginTop: "12px" }}>Pre-Wedding & Engagement Glam</h3>
              <p style={{ color: "#D4AF37", fontWeight: "bold", fontSize: "16px" }}>Starting at ₹8,000</p>
              <p style={{ color: "#8E8E93", fontSize: "13px", margin: "12px 0" }}>Soft, romantic dewy makeup tailored for engagement functions and pre-wedding shoots.</p>
              <a href="/book" style={{ color: "#2C1320", fontWeight: "bold", textDecoration: "underline", fontSize: "14px" }}>Request Date →</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer style={{ backgroundColor: "#2C1320", color: "#FFFFFF", padding: "40px 20px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "22px" }}>MAKEOVERS BY PRACHI</h3>
        <p style={{ color: "#E8C5C8", fontSize: "13px", marginTop: "6px" }}>Jodhpur, Rajasthan • WhatsApp: +91 98290 12345</p>
        <p style={{ color: "#8E8E93", fontSize: "11px", marginTop: "20px" }}>© 2026 Makeovers by Prachi. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
