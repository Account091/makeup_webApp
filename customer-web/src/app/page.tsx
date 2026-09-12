"use client";

import React, { useState } from "react";
import { localBusinessSchema } from "../lib/seo";

export default function CustomerHomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const stats = [
    { value: "1,200+", label: "Brides Styled", icon: "👑" },
    { value: "4.93★", label: "Client CSAT Rating", icon: "⭐" },
    { value: "100%", label: "Date Lock Guarantee", icon: "🔒" },
    { value: "16-Hr", label: "Sweat-Proof HD Base", icon: "✨" },
  ];

  const showcases = [
    {
      title: "Royal Rajasthani Poshak Look",
      subtitle: "Jodhpur & Palace Weddings",
      img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      desc: "Traditional heavy Borla & Dupatta draping paired with 16-hour sweat-proof HD Airbrush base.",
      tag: "SIGNATURE BRIDAL",
    },
    {
      title: "Soft Dewy Engagement Glam",
      subtitle: "Pre-Wedding & Ring Ceremonies",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      desc: "Radiant glass-skin finish with customized soft textured waves for cocktail & sangeet nights.",
      tag: "ENGAGEMENT",
    },
    {
      title: "Destination Palace Bridal",
      subtitle: "Jaipur, Udaipur & Rajasthan",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      desc: "Full-day multi-event coverage with dedicated on-venue touch-up assistant station.",
      tag: "DESTINATION",
    },
  ];

  const faqs = [
    {
      q: "How far in advance should I book my wedding date?",
      a: "We recommend locking your date 3 to 6 months in advance, especially for peak wedding season (October to March) in Rajasthan.",
    },
    {
      q: "Do you travel to venues outside Jodhpur?",
      a: "Yes! Prachi and her senior team travel for destination weddings across Jaipur, Udaipur, Jaisalmer, and all major cities in India.",
    },
    {
      q: "Is traditional Rajasthani Poshak draping included?",
      a: "Yes! Traditional Poshak & dupatta setting, Borla placement, and authentic royal jewelry coordination are included in all Signature Bridal Packages.",
    },
    {
      q: "How does the 5-minute date reservation & deposit work?",
      a: "When you select your date in the Booking Wizard, your slot is held for 5 minutes while you scan the UPI QR code to pay the 30% advance deposit.",
    },
  ];

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--champagne)" }}>
      {/* JSON-LD LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* 1. HERO SECTION */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(135deg, rgba(26, 11, 19, 0.92) 0%, rgba(44, 19, 32, 0.88) 50%, rgba(26, 11, 19, 0.95) 100%), url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600') center/cover no-repeat",
          color: "#FFFFFF",
          padding: "clamp(60px, 10vw, 120px) clamp(16px, 5vw, 40px)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.18)",
                color: "var(--rose-gold)",
                border: "1px solid var(--rose-gold)",
                padding: "8px 20px",
                borderRadius: "30px",
                fontSize: "clamp(11px, 1.2vw, 13px)",
                fontWeight: "700",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                display: "inline-block",
              }}
            >
              👑 Official Digital Flagship
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--rose-gold)",
              fontSize: "clamp(32px, 6vw, 64px)",
              letterSpacing: "2px",
              fontWeight: "700",
              margin: "12px 0 16px 0",
              lineHeight: "1.15",
            }}
          >
            MAKEOVERS BY PRACHI
          </h1>

          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(15px, 2vw, 22px)",
              color: "#E8C5C8",
              marginBottom: "20px",
              letterSpacing: "1px",
            }}
          >
            Luxury Royal Rajasthani Bridal & Occasion Artistry
          </p>

          <p
            style={{
              maxWidth: "750px",
              margin: "0 auto 36px auto",
              color: "#E5E0D8",
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: "1.7",
              fontWeight: "300",
            }}
          >
            Specializing in seamless HD/Airbrush bridal aesthetics, traditional Rajasthani Poshak & Dupatta draping, and royal jewelry coordination across Jodhpur, Jaipur & Udaipur.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "50px",
            }}
          >
            <a href="/book" className="btn-gold animate-pulse-glow">
              <span>Book Your Wedding Date</span>
              <span>→</span>
            </a>
            <a href="/services" className="btn-outline-gold">
              View Pricing & Packages
            </a>
          </div>

          {/* DYNAMIC STATS BAR */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              maxWidth: "900px",
              margin: "0 auto",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(12px)",
              padding: "24px",
              borderRadius: "20px",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            {stats.map((s, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: "700", color: "var(--rose-gold)" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", color: "#E8C5C8", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE SHOWCASE SECTION */}
      <section style={{ padding: "clamp(50px, 8vw, 90px) clamp(16px, 5vw, 40px)", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "12px", color: "var(--rose-gold)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            EXQUISITE ARTISTRY
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "var(--primary-plum)", margin: "8px 0 12px 0" }}>
            Signature Royal Styling
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Tailored bridal transformations honoring traditional Indian skin tones and royal heritage
          </p>
        </div>

        <div className="responsive-grid">
          {showcases.map((card, idx) => (
            <div key={idx} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="zoom-img-container" style={{ height: "260px", position: "relative" }}>
                <img src={card.img} alt={card.title} className="zoom-img" />
                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    backgroundColor: "var(--primary-plum)",
                    color: "var(--rose-gold)",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  {card.tag}
                </span>
              </div>

              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "var(--primary-plum)", margin: "0 0 4px 0" }}>
                    {card.title}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--rose-gold)", fontWeight: "600", marginBottom: "12px" }}>
                    {card.subtitle}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                    {card.desc}
                  </p>
                </div>

                <a
                  href="/book"
                  style={{
                    color: "var(--primary-plum)",
                    fontWeight: "700",
                    textDecoration: "none",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Reserve This Look</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REVIEWS & TRUST SECTION */}
      <section
        style={{
          backgroundColor: "var(--primary-plum)",
          color: "#FFFFFF",
          padding: "clamp(50px, 8vw, 90px) clamp(16px, 5vw, 40px)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--rose-gold)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            VERIFIED BRIDE REVIEWS
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "var(--rose-gold)", margin: "8px 0 36px 0" }}>
            Loved by 1,200+ Royal Brides
          </h2>

          <div className="responsive-grid">
            {[
              {
                name: "Radhika J. (Bridal Client)",
                loc: "Gorbandh Palace, Jodhpur",
                text: "Prachi was an absolute dream! My poshak draping and HD eye makeup stayed flawless through the entire 12-hour wedding ceremony in October.",
                rating: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Ananya S. (Destination Bride)",
                loc: "City Palace, Udaipur",
                text: "The 16-hour sweat-proof airbrush base was unbelievable. Even in November afternoon heat, my skin looked radiant and glass-smooth in every photo!",
                rating: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Kavita M. (Engagement Glam)",
                loc: "Rambagh Palace, Jaipur",
                text: "Soft dewy makeup done to perfection! Everyone complimented my look. Booking online with the 5-minute QR reservation was seamless.",
                rating: "⭐⭐⭐⭐⭐",
              },
            ].map((rev, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "18px", marginBottom: "10px" }}>{rev.rating}</div>
                <p style={{ color: "#E5E0D8", fontSize: "14px", lineHeight: "1.7", marginBottom: "16px", fontStyle: "italic" }}>
                  "{rev.text}"
                </p>
                <div style={{ fontWeight: "700", color: "var(--rose-gold)", fontSize: "15px" }}>{rev.name}</div>
                <div style={{ fontSize: "12px", color: "#E8C5C8" }}>📍 {rev.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section style={{ padding: "clamp(50px, 8vw, 90px) clamp(16px, 5vw, 40px)", maxWidth: "850px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 38px)", color: "var(--primary-plum)" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Everything you need to know before locking your wedding date</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E5E0D8",
                padding: "20px 24px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "var(--primary-plum)", margin: 0 }}>
                  {faq.q}
                </h4>
                <span style={{ fontSize: "20px", color: "var(--rose-gold)", fontWeight: "bold" }}>
                  {activeFaq === idx ? "−" : "+"}
                </span>
              </div>
              {activeFaq === idx && (
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginTop: "14px" }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer style={{ backgroundColor: "var(--plum-dark)", color: "#FFFFFF", padding: "60px 20px 30px 20px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--rose-gold)", fontSize: "26px", margin: 0 }}>
          MAKEOVERS BY PRACHI
        </h3>
        <p style={{ color: "#E8C5C8", fontSize: "14px", marginTop: "8px" }}>
          Jodhpur Studio • Destination Weddings Across Rajasthan • WhatsApp: +91 98290 12345
        </p>

        <div style={{ margin: "24px 0", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", fontSize: "14px" }}>
          <a href="/" style={{ color: "#E5E0D8", textDecoration: "none" }}>Home</a>
          <a href="/services" style={{ color: "#E5E0D8", textDecoration: "none" }}>Services & Rates</a>
          <a href="/gallery" style={{ color: "#E5E0D8", textDecoration: "none" }}>Bridal Gallery</a>
          <a href="/reviews" style={{ color: "#E5E0D8", textDecoration: "none" }}>Reviews (4.93★)</a>
          <a href="/track" style={{ color: "#E5E0D8", textDecoration: "none" }}>Track PDF Invoice</a>
          <a href="/book" style={{ color: "var(--rose-gold)", fontWeight: "bold", textDecoration: "none" }}>Book Date →</a>
        </div>

        <p style={{ color: "#8E8E93", fontSize: "12px", marginTop: "30px" }}>
          © 2026 Makeovers by Prachi. All Rights Reserved. Luxury Bridal Artistry Engine.
        </p>
      </footer>
    </main>
  );
}
