"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  PhoneCall,
  Clock,
  TrendingUp,
  DollarSign,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { askAdminCopilot, AdminCopilotResponseData, ActionCardItem } from "../../lib/ai/admin-copilot-client";

export const AdminAiCopilot: React.FC = () => {
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");
  const [responses, setResponses] = useState<
    Array<{
      id: string;
      query: string;
      data: AdminCopilotResponseData;
      timestamp: string;
    }>
  >([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuery = async (customQuery?: string, toolName?: string) => {
    const textToSend = customQuery || queryInput.trim();
    if ((!textToSend && !toolName) || loading) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await askAdminCopilot({
        query: textToSend || `Run tool: ${toolName}`,
        toolName,
        authPayload: {
          role: selectedRole,
          uid: "admin_prachi",
        },
      });

      setResponses((prev) => [
        ...prev,
        {
          id: `res_${Date.now()}`,
          query: textToSend || `Tool: ${toolName}`,
          data: res,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (!customQuery) setQueryInput("");
    } catch (err: any) {
      console.error("[AdminAiCopilot] Query error:", err);
      setErrorMsg(err.message || "Failed to reach Admin AI Copilot.");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (card: ActionCardItem) => {
    if (card.phone) {
      window.location.href = `tel:${card.phone}`;
    } else if (card.actionType === "VERIFY_PAYMENT_RECOMMENDED") {
      window.location.href = "/track";
    } else {
      alert(`Recommendation '${card.label}' selected. Human approval workflow initiated for ${card.targetId || "target item"}.`);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        background: "rgba(12, 12, 16, 0.95)",
        border: "1px solid rgba(212, 175, 55, 0.35)",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.15)",
        backdropFilter: "blur(20px)",
        color: "#FFF",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          background: "linear-gradient(90deg, rgba(20, 18, 26, 0.95) 0%, rgba(35, 28, 15, 0.95) 100%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(212, 175, 55, 0.5)",
            }}
          >
            <Sparkles size={22} style={{ color: "#000" }} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#F3E5AB",
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              AI Admin Copilot ✨
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              Operational Intelligence, Risk Alerts & CRM Follow-ups
            </p>
          </div>
        </div>

        {/* Role Selector Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Role Scope:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#F3E5AB",
              borderRadius: "12px",
              padding: "6px 12px",
              fontSize: "12px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ADMIN">ADMIN / OWNER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="SUPPORT">SUPPORT</option>
            <option value="ACCOUNTANT">ACCOUNTANT</option>
            <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
            <option value="CUSTOMER">CUSTOMER (Test Auth Rejection)</option>
          </select>
        </div>
      </div>

      {/* Today's Overview Banner */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <h4 style={{ fontSize: "14px", color: "#F3E5AB", margin: "0 0 14px 0", fontWeight: 600 }}>
          Good morning, Prachi — Today's Overview
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
            }}
          >
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Today's Bookings</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#F3E5AB", marginTop: "4px" }}>
              4 Events Scheduled
            </div>
          </div>

          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Payment Verification</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#FBBF24", marginTop: "4px" }}>
              2 UTR Screenshots Pending
            </div>
          </div>

          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
            }}
          >
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>CRM Lead Follow-ups</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#60A5FA", marginTop: "4px" }}>
              3 Hot Leads Pending
            </div>
          </div>

          <div
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
            }}
          >
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Operational Risk</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#FCA5A5", marginTop: "4px" }}>
              1 Travel Conflict Alert
            </div>
          </div>
        </div>
      </div>

      {/* Preset Action Pills */}
      <div style={{ padding: "16px 24px 8px 24px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {[
          { label: "Today's operations", query: "Which bookings need attention today?" },
          { label: "Pending payments", tool: "getPendingPaymentVerifications" },
          { label: "Follow-ups", query: "Which leads haven't been followed up?" },
          { label: "Revenue summary", tool: "getRevenueSummary" },
          { label: "Operational risks", tool: "getOperationalRisks" },
          { label: "Who should I call first?", query: "Who should I call first and why?" },
        ].map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleQuery(pill.query, pill.tool)}
            disabled={loading}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              color: "#F3E5AB",
              fontSize: "13px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212, 175, 55, 0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
          >
            ✨ {pill.label}
          </button>
        ))}
      </div>

      {/* Responses Area */}
      <div style={{ padding: "20px 24px", minHeight: "260px", maxHeight: "480px", overflowY: "auto" }}>
        {responses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255, 255, 255, 0.4)" }}>
            <Sparkles size={32} style={{ color: "#D4AF37", marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "14px" }}>
              Ask Admin Copilot anything about today's operations, CRM leads, payment proofs, or risks.
            </p>
          </div>
        ) : (
          responses.map((item) => (
            <div
              key={item.id}
              style={{
                marginBottom: "20px",
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(20, 20, 26, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {/* Question */}
              <div
                style={{
                  fontSize: "13px",
                  color: "#D4AF37",
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Query: "{item.query}"</span>
                <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>{item.timestamp}</span>
              </div>

              {/* Natural Language Summary */}
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#F3F4F6", whiteSpace: "pre-line" }}>
                {item.data.summary}
              </p>

              {/* Reasoning Grounding Cards */}
              {item.data.reasoning && item.data.reasoning.length > 0 && (
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {item.data.reasoning.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderLeft: "3px solid #D4AF37",
                        fontSize: "12px",
                      }}
                    >
                      <strong style={{ color: "#F3E5AB" }}>{r.factor}:</strong> {r.details}
                      <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginLeft: "8px" }}>
                        (Source: {r.source})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Action Cards */}
              {item.data.actionCards && item.data.actionCards.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Lock size={12} style={{ color: "#FBBF24" }} /> Recommended Actions (Human Approval Required):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {item.data.actionCards.map((card, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleActionClick(card)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(140, 100, 20, 0.3) 100%)",
                          border: "1px solid rgba(212, 175, 55, 0.5)",
                          color: "#FFF8E7",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {card.label} <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {errorMsg && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#FCA5A5",
              fontSize: "13px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: "16px 24px",
          background: "rgba(15, 15, 20, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Ask Admin Copilot (e.g. 'Which leads haven't been followed up?', 'Show revenue stats')..."
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuery();
          }}
          disabled={loading}
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "24px",
            padding: "12px 20px",
            color: "#FFF",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleQuery()}
          disabled={!queryInput.trim() || loading}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            background:
              !queryInput.trim() || loading
                ? "rgba(255, 255, 255, 0.1)"
                : "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
            border: "none",
            color: !queryInput.trim() || loading ? "rgba(255, 255, 255, 0.3)" : "#000",
            cursor: !queryInput.trim() || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
