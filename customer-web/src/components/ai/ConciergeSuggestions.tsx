"use client";

import React from "react";
import { Sparkles, Calendar, HelpCircle, MapPin, Package, Clock, RefreshCw } from "lucide-react";

export interface ConciergeSuggestionsProps {
  onSelectSuggestion: (prompt: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  {
    icon: Package,
    label: "Bridal packages",
    prompt: "What bridal makeup packages do you have?",
  },
  {
    icon: Sparkles,
    label: "What's included?",
    prompt: "What's included in the Royal Bridal package?",
  },
  {
    icon: HelpCircle,
    label: "Advance payment",
    prompt: "How much advance do I need to pay?",
  },
  {
    icon: MapPin,
    label: "Travel & Jaipur",
    prompt: "Can I book for Jaipur?",
  },
  {
    icon: Clock,
    label: "Bridal prep tips",
    prompt: "What should I prepare before my bridal consultation?",
  },
  {
    icon: RefreshCw,
    label: "Reschedule date",
    prompt: "Can I change my booking date?",
  },
  {
    icon: Calendar,
    label: "Check my booking",
    prompt: "What is my booking status?",
  },
  {
    icon: Clock,
    label: "Appointment time",
    prompt: "When is my makeup appointment?",
  },
];

export const ConciergeSuggestions: React.FC<ConciergeSuggestionsProps> = ({
  onSelectSuggestion,
  disabled = false,
}) => {
  return (
    <div style={{ padding: "8px 0" }}>
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.6)",
          marginBottom: "10px",
          fontWeight: 500,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Sparkles size={13} style={{ color: "#D4AF37" }} /> Suggested Questions
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectSuggestion(item.prompt)}
              disabled={disabled}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                color: "#F3E5AB",
                fontSize: "13px",
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease-in-out",
                opacity: disabled ? 0.5 : 1,
                backdropFilter: "blur(8px)",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.6)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <Icon size={14} style={{ color: "#D4AF37", flexShrink: 0 }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
