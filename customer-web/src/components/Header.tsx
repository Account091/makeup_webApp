"use client";

import React, { useState } from "react";
import AiBeautyConciergeModal from "./AiBeautyConciergeModal";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <>
      <header
        style={{
          backgroundColor: "rgba(26, 11, 19, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: "#FFFFFF",
          padding: "clamp(12px, 2vw, 18px) clamp(16px, 4vw, 36px)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Brand Logo */}
          <a href="/" style={{ textDecoration: "none" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--rose-gold, #D4AF37)",
                fontSize: "clamp(18px, 2.2vw, 24px)",
                margin: 0,
                letterSpacing: "1.5px",
                fontWeight: "700",
              }}
            >
              MAKEOVERS BY PRACHI
            </h2>
            <span style={{ fontSize: "11px", color: "#E8C5C8", display: "block", marginTop: "2px", letterSpacing: "0.5px" }}>
              Luxury Bridal & Occasion Artistry
            </span>
          </a>

          {/* Desktop Navigation Bar */}
          <nav
            style={{
              display: "flex",
              gap: "clamp(14px, 2vw, 24px)",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: "500",
            }}
            className="desktop-nav-container"
          >
            <a href="/" style={{ color: "#FFFFFF", textDecoration: "none", transition: "color 0.2s" }}>
              Home
            </a>
            <a href="/services" style={{ color: "#E5E0D8", textDecoration: "none", transition: "color 0.2s" }}>
              Services & Rates
            </a>
            <a href="/gallery" style={{ color: "#E5E0D8", textDecoration: "none", transition: "color 0.2s" }}>
              Bridal Gallery
            </a>
            <a href="/reviews" style={{ color: "#E5E0D8", textDecoration: "none", transition: "color 0.2s" }}>
              Reviews (4.93★)
            </a>
            <a href="/track" style={{ color: "#E5E0D8", textDecoration: "none", transition: "color 0.2s" }}>
              Track Invoice
            </a>

            {/* AI Concierge Trigger Button */}
            <button
              onClick={() => setAiModalOpen(true)}
              style={{
                background: "rgba(212, 175, 55, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.6)",
                color: "#E8C5C8",
                padding: "8px 16px",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <span>AI Concierge</span>
              <span>✨</span>
            </button>

            <a
              href="/book"
              style={{
                background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
                color: "#2C1320",
                padding: "10px 22px",
                borderRadius: "24px",
                fontWeight: "700",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.4)",
                transition: "transform 0.2s, boxShadow 0.2s",
              }}
            >
              Book Date →
            </a>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              background: "transparent",
              border: "1.5px solid #D4AF37",
              color: "#D4AF37",
              padding: "8px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "18px",
              display: "none",
            }}
            className="mobile-hamburger-btn"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileOpen && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
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
              🧾 Track PDF Invoice
            </a>

            <button
              onClick={() => {
                setMobileOpen(false);
                setAiModalOpen(true);
              }}
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid rgba(212, 175, 55, 0.6)",
                color: "#E8C5C8",
                padding: "12px 18px",
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>✨ AI Beauty Concierge</span>
              <span>Ask AI →</span>
            </button>

            <a
              href="/book"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "linear-gradient(135deg, #D4AF37, #AA7C11)",
                color: "#2C1320",
                padding: "14px 20px",
                borderRadius: "24px",
                fontWeight: "bold",
                textDecoration: "none",
                textAlign: "center",
                marginTop: "6px",
              }}
            >
              Book Your Date →
            </a>
          </div>
        )}

        <style jsx>{`
          @media (max-width: 868px) {
            :global(.desktop-nav-container) {
              display: none !important;
            }
            :global(.mobile-hamburger-btn) {
              display: block !important;
            }
          }
        `}</style>
      </header>

      {/* AI Beauty Concierge Modal */}
      <AiBeautyConciergeModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  );
}

