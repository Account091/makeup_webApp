"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, Tag, MessageCircle, X } from "lucide-react";

interface FirstVisitorWelcomeCardProps {
  onCheckDateClick: () => void;
  onSeePackagesClick: () => void;
  onTalkToTeamClick: () => void;
}

export const FirstVisitorWelcomeCard: React.FC<FirstVisitorWelcomeCardProps> = ({
  onCheckDateClick,
  onSeePackagesClick,
  onTalkToTeamClick,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if previously dismissed
    try {
      const dismissed = localStorage.getItem("prachi_welcome_card_dismissed_v1");
      if (!dismissed) {
        // Subtle appearance after 2.5 seconds
        const timer = setTimeout(() => {
          setVisible(true);
        }, 2200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore localstorage errors (e.g. incognito)
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem("prachi_welcome_card_dismissed_v1", "true");
    } catch (e) {
      // Ignore
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Welcome Assistant"
      style={{
        position: "fixed",
        bottom: "96px",
        left: "clamp(16px, 3vw, 28px)",
        maxWidth: "380px",
        width: "calc(100% - 32px)",
        backgroundColor: "rgba(42, 8, 69, 0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1.5px solid rgba(212, 175, 55, 0.55)",
        borderRadius: "20px",
        padding: "18px 20px",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
        zIndex: 998,
        color: "#FFFFFF",
        animation: "fadeIn 0.35s ease-out forwards",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37 0%, #8C6D23 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2A0845",
              fontSize: "16px",
            }}
          >
            👑
          </div>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "14px",
                fontFamily: "'Playfair Display', serif",
                color: "#D4AF37",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              Welcome to Prachi's Studio
            </h4>
            <span style={{ fontSize: "11px", color: "#E8D3C7" }}>Royal Rajputi Bridal Artistry</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss welcome card"
          style={{
            background: "transparent",
            border: "none",
            color: "#E8D3C7",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "color 0.2s",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <p
        style={{
          margin: "12px 0 14px 0",
          fontSize: "13px",
          lineHeight: "1.5",
          color: "#FDFBF7",
          fontWeight: "400",
        }}
      >
        Tell me your wedding date and city, and I'll show what's available for your celebration!
      </p>

      {/* 3 Quick Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={() => {
            handleDismiss();
            onCheckDateClick();
          }}
          style={{
            background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
            color: "#2A0845",
            border: "none",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={15} /> Check a date
          </span>
          <span style={{ fontSize: "12px" }}>→</span>
        </button>

        <button
          onClick={() => {
            handleDismiss();
            onSeePackagesClick();
          }}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(212, 175, 55, 0.35)",
            color: "#FDFBF7",
            borderRadius: "12px",
            padding: "9px 14px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={14} style={{ color: "#D4AF37" }} /> See packages & prices
          </span>
          <span style={{ color: "#D4AF37", fontSize: "11px" }}>From ₹18,000</span>
        </button>

        <button
          onClick={() => {
            handleDismiss();
            onTalkToTeamClick();
          }}
          style={{
            background: "rgba(37, 211, 102, 0.15)",
            border: "1px solid rgba(37, 211, 102, 0.5)",
            color: "#68D391",
            borderRadius: "12px",
            padding: "9px 14px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageCircle size={14} /> Talk to Prachi's team
          </span>
          <span style={{ fontSize: "11px" }}>WhatsApp</span>
        </button>
      </div>

      <div style={{ marginTop: "10px", textAlign: "right" }}>
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#E8D3C7",
            fontSize: "11px",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Dismiss & explore on my own
        </button>
      </div>
    </aside>
  );
};
