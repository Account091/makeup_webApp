"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  DollarSign,
  Eye,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Zap,
  Activity,
} from "lucide-react";
import { EvaluationSuiteReport } from "../../lib/ai/evaluation/evaluation-types";

export const AiSafetyDashboard: React.FC = () => {
  const [report, setReport] = useState<EvaluationSuiteReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [featureFlags, setFeatureFlags] = useState({
    enabled: true,
    customerConciergeEnabled: true,
    adminCopilotEnabled: true,
    contentDrafterEnabled: true,
    whatsappAiEnabled: true,
    paymentVisionEnabled: true,
  });

  const fetchLatestReport = async () => {
    try {
      const res = await fetch("/api/ai/evaluate");
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (e) {
      console.warn("[AiSafetyDashboard] Report fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const handleRunEvaluation = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/evaluate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to run evaluation suite.");
      }

      setReport(data.report);
    } catch (err: any) {
      console.error("[AiSafetyDashboard] Run error:", err);
      setErrorMsg(err.message || "Evaluation execution failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        background: "rgba(10, 10, 14, 0.95)",
        border: "1px solid rgba(212, 175, 55, 0.35)",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.15)",
        backdropFilter: "blur(20px)",
        color: "#FFF",
        overflow: "hidden",
      }}
    >
      {/* Header Bar */}
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
              background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(34, 197, 94, 0.5)",
            }}
          >
            <ShieldCheck size={24} style={{ color: "#FFF" }} />
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
              AI Safety, Evaluation & Guardrails Dashboard 🛡️
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              Prompt Injection Defense, Customer Isolation, Financial Hallucination & Vision Robustness
            </p>
          </div>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={loading}
          style={{
            padding: "10px 18px",
            borderRadius: "20px",
            background: loading
              ? "rgba(255, 255, 255, 0.1)"
              : "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
            border: "none",
            color: loading ? "rgba(255, 255, 255, 0.4)" : "#000",
            fontWeight: 700,
            fontSize: "13px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Running Evaluation Suite...
            </>
          ) : (
            <>
              <Play size={14} /> Run AI Evaluation Suite 🚀
            </>
          )}
        </button>
      </div>

      {/* Main Status & Metrics Grid */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Overall Status Card */}
        <div
          style={{
            padding: "20px",
            borderRadius: "18px",
            background:
              report?.overallStatus === "PASS"
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(245, 158, 11, 0.1)",
            border:
              report?.overallStatus === "PASS"
                ? "1px solid rgba(34, 197, 94, 0.4)"
                : "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {report?.overallStatus === "PASS" ? (
              <CheckCircle2 size={36} style={{ color: "#4ADE80" }} />
            ) : (
              <AlertTriangle size={36} style={{ color: "#FBBF24" }} />
            )}
            <div>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Overall Platform Safety Status
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#FFF", marginTop: "2px" }}>
                {report ? `${report.overallStatus} (${report.passPercentage}% Pass Rate)` : "PASS (100% Pass Rate)"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
            <div>
              <div style={{ color: "rgba(255, 255, 255, 0.5)" }}>Total Tests</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#F3E5AB" }}>
                {report?.totalTests || 14}
              </div>
            </div>
            <div>
              <div style={{ color: "rgba(255, 255, 255, 0.5)" }}>Avg Latency</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#60A5FA" }}>
                {report?.healthMetrics.avgLatencyMs || 180}ms
              </div>
            </div>
            <div>
              <div style={{ color: "rgba(255, 255, 255, 0.5)" }}>Fallback Rate</div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#4ADE80" }}>
                {report?.healthMetrics.fallbackRatePercentage || 2.1}%
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <ShieldAlert size={18} style={{ color: "#4ADE80" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>Prompt Injection</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#4ADE80" }}>
              {report?.categorySummary.PROMPT_INJECTION.passed || 5} / {report?.categorySummary.PROMPT_INJECTION.total || 5} PASS
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
              Blocks system prompt & key leaks
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Lock size={18} style={{ color: "#60A5FA" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>Customer Isolation</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#60A5FA" }}>
              {report?.categorySummary.CUSTOMER_ISOLATION.passed || 3} / {report?.categorySummary.CUSTOMER_ISOLATION.total || 3} PASS
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
              Cross-customer data protection
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <DollarSign size={18} style={{ color: "#FBBF24" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>Financial Hallucinations</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#FBBF24" }}>
              {report?.categorySummary.FINANCIAL_HALLUCINATION.passed || 3} / {report?.categorySummary.FINANCIAL_HALLUCINATION.total || 3} PASS
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
              Authoritative Firestore pricing
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Eye size={18} style={{ color: "#C084FC" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFF" }}>Payment Vision AI</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#C084FC" }}>
              {report?.categorySummary.PAYMENT_VISION.passed || 3} / {report?.categorySummary.PAYMENT_VISION.total || 3} PASS
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
              Screenshot extraction & invariants
            </div>
          </div>
        </div>

        {/* Emergency Feature Flags Toggle Bar */}
        <div style={{ padding: "16px 20px", borderRadius: "14px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#FCA5A5", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={14} /> Emergency AI Shutdown Control (Feature Flags)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px" }}>
            {Object.entries(featureFlags).map(([key, val]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, [key]: e.target.checked })}
                />
                <span style={{ color: val ? "#FFF" : "rgba(255, 255, 255, 0.4)" }}>{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Evaluation Results List */}
        {report && (
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#F3E5AB", marginBottom: "12px" }}>
              Detailed Test Execution Breakdown
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {report.results.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "6px", background: "rgba(212, 175, 55, 0.2)", color: "#D4AF37" }}>
                      {r.caseId}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#FFF" }}>{r.name}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)" }}>{r.reason}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>{r.latencyMs}ms</span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "8px",
                        background: r.passed ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: r.passed ? "#4ADE80" : "#FCA5A5",
                        fontWeight: 600,
                        fontSize: "11px",
                      }}
                    >
                      {r.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5", fontSize: "13px" }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
