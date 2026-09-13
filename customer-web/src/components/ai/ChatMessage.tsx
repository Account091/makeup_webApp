"use client";

import React from "react";
import { Sparkles, Tag, ArrowRight, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  recommendations?: string[];
  requiresHumanAction?: boolean;
  actionType?: string | null;
  timestamp?: string;
  onRecommendationClick?: (prompt: string) => void;
  onActionClick?: (actionType: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  sources = [],
  recommendations = [],
  requiresHumanAction = false,
  actionType = null,
  timestamp,
  onRecommendationClick,
  onActionClick,
}) => {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          maxWidth: isUser ? "85%" : "92%",
          width: isUser ? "auto" : "100%",
        }}
      >
        {/* Assistant Header Avatar */}
        {!isUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 10px rgba(212, 175, 55, 0.4)",
              }}
            >
              <Sparkles size={13} style={{ color: "#000" }} />
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#D4AF37",
                letterSpacing: "0.5px",
              }}
            >
              BEAUTY CONCIERGE
            </span>
            {timestamp && (
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
                {timestamp}
              </span>
            )}
          </div>
        )}

        {/* Bubble Box */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(140, 100, 20, 0.3) 100%)"
              : "rgba(18, 18, 22, 0.85)",
            border: isUser
              ? "1px solid rgba(212, 175, 55, 0.4)"
              : "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(12px)",
            boxShadow: isUser
              ? "0 4px 16px rgba(212, 175, 55, 0.15)"
              : "0 4px 20px rgba(0, 0, 0, 0.35)",
            color: isUser ? "#FFF8E7" : "#F3F4F6",
            fontSize: "14px",
            lineHeight: "1.6",
            whiteSpace: "pre-line",
          }}
        >
          {content}

          {/* Sources Tags */}
          {!isUser && sources && sources.length > 0 && (
            <div
              style={{
                marginTop: "12px",
                paddingTop: "10px",
                borderTop: "1px dashed rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Tag size={11} /> Verified Sources:
              </span>
              {sources.map((src, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                    color: "#E6C665",
                  }}
                >
                  {src}
                </span>
              ))}
            </div>
          )}

          {/* Action Card if human action / mutation is recommended */}
          {!isUser && (requiresHumanAction || actionType) && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={16} style={{ color: "#F87171", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#FCA5A5" }}>
                  Official Action Required
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                {actionType === "RESCHEDULE_REQUEST"
                  ? "The AI Concierge cannot modify your booking date directly. Please submit your official reschedule request below."
                  : "This request involves account changes. Please use the official request workflow."}
              </p>
              <button
                onClick={() => onActionClick && onActionClick(actionType || "GENERAL_ACTION")}
                style={{
                  alignSelf: "flex-start",
                  marginTop: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  border: "none",
                  color: "#FFF",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                }}
              >
                {actionType === "RESCHEDULE_REQUEST" ? (
                  <>
                    <Calendar size={13} /> Launch Reschedule Workflow <ArrowRight size={13} />
                  </>
                ) : (
                  <>
                    Proceed with Action <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Recommendation Chips */}
        {!isUser && recommendations && recommendations.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {recommendations.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => onRecommendationClick && onRecommendationClick(rec)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#E5E7EB",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
              >
                <span>{rec}</span>
                <ArrowRight size={11} style={{ color: "#D4AF37" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
