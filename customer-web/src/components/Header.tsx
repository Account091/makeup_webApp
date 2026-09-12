"use client";

import React, { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        backgroundColor: "rgba(44, 19, 32, 0.95)",
        backdropFilter: "blur(12px)",
        color: "#FFFFFF",
        padding: "16px 24px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#D4AF37",
              fontSize: "22px",
              margin: 0,
              letterSpacing: "1.5px",
            }}
          >
            MAKEOVERS BY PRACHI
          </h2>
          <span style={{ fontSize: "11px", color: "#E8C5C8", display: "block", marginTop: "2px" }}>
            Luxury Bridal & Occasion Artistry
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: "500",
          }}
          className="desktop-nav"
        >
          <a href="/" style={{ color: "#FFFFFF", textDecoration: "none" }}>
            Home
          </a>
          <a href="/services" style={{ color: "#E5E0D8", textDecoration: "none" }}>
            Services & Rates
          </a>
          <a href="/gallery" style={{ color: "#E5E0D8", textDecoration: "none" }}>
            Bridal Gallery
          </a>
          <a href="/reviews" style={{ color: "#E5E0D8", textDecoration: "none" }}>
            Reviews (4.93★)
          </a>
          <a href="/track" style={{ color: "#E5E0D8", textDecoration: "none" }}>
            Track Invoice
          </a>
          <a
            href="/book"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
              color: "#2C1320",
              padding: "10px 22px",
              borderRadius: "20px",
              fontWeight: "bold",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
            }}
          >
            Book Date →
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "1px solid #D4AF37",
            color: "#D4AF37",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
          className="mobile-hamburger"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            fontSize: "15px",
          }}
        >
          <a href="/" onClick={() => setMobileOpen(false)} style={{ color: "#FFFFFF", textDecoration: "none" }}>
            🏠 Home
          </a>
          <a href="/services" onClick={() => setMobileOpen(false)} style={{ color: "#E5E0D8", textDecoration: "none" }}>
            ✨ Services & Rates
          </a>
          <a href="/gallery" onClick={() => setMobileOpen(false)} style={{ color: "#E5E0D8", textDecoration: "none" }}>
            📸 Bridal Gallery
          </a>
          <a href="/reviews" onClick={() => setMobileOpen(false)} style={{ color: "#E5E0D8", textDecoration: "none" }}>
            ⭐ 4.93★ Client Reviews
          </a>
          <a href="/track" onClick={() => setMobileOpen(false)} style={{ color: "#E5E0D8", textDecoration: "none" }}>
            🧾 Track Invoice & PDF
          </a>
          <a
            href="/book"
            onClick={() => setMobileOpen(false)}
            style={{
              background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
              color: "#2C1320",
              padding: "12px 20px",
              borderRadius: "20px",
              fontWeight: "bold",
              textDecoration: "none",
              textAlign: "center",
              marginTop: "8px",
            }}
          >
            Book Your Date →
          </a>
        </div>
      )}
    </header>
  );
}
