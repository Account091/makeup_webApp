"use client";

import React from "react";
import Header from "../../components/Header";
import { BeautyConcierge } from "../../components/ai/BeautyConcierge";
import { Sparkles, ShieldCheck, Clock, Award, HelpCircle } from "lucide-react";

export default function ConciergePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D070B",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15) 0%, rgba(26, 11, 19, 0.95) 70%)",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 40px) clamp(16px, 3vw, 24px)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Banner Title */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              color: "#F3E5AB",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} style={{ color: "#D4AF37" }} /> AI Beauty Concierge V5.1
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 4vw, 42px)",
              color: "#F3E5AB",
              margin: "0 0 10px 0",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Your Personal Luxury Bridal & Makeover Assistant
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 1.8vw, 16px)",
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "750px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Ask anything about our signature Royal Bridal packages, Jaipur travel policies, advance
            deposit rates, skincare preparation, or verify your personalized booking details.
          </p>
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ShieldCheck size={20} style={{ color: "#D4AF37", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>
                Authoritative Data
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                Strict Firestore retrieval
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Clock size={20} style={{ color: "#D4AF37", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>
                Instant 24/7 Guidance
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                Hugging Face LLM speed
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Award size={20} style={{ color: "#D4AF37", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>
                Zero Guesswork
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                Exact deposit & terms
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <HelpCircle size={20} style={{ color: "#D4AF37", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>
                Customer Data Isolated
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>
                Private session security
              </div>
            </div>
          </div>
        </div>

        {/* Beauty Concierge Container */}
        <div style={{ height: "680px", width: "100%" }}>
          <BeautyConcierge isFloating={false} />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.5)",
          marginTop: "auto",
        }}
      >
        © {new Date().getFullYear()} Makeovers by Prachi. All rights reserved. • Powered by AI Gateway
      </footer>
    </div>
  );
}
