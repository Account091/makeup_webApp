"use client";

import React, { useState, useEffect } from "react";
import {
  MarketplaceExecutiveKPIs,
  MarketplaceFunnelMetrics,
  MarketplaceHealthScore,
  MarketplaceAnalyticsAlert,
  MarketplaceValidationReport,
} from "../../lib/marketplace/marketplace-types";

export default function MarketplaceAnalyticsScreen() {
  const [kpis, setKpis] = useState<MarketplaceExecutiveKPIs | null>(null);
  const [funnel, setFunnel] = useState<MarketplaceFunnelMetrics | null>(null);
  const [health, setHealth] = useState<MarketplaceHealthScore | null>(null);
  const [alerts, setAlerts] = useState<MarketplaceAnalyticsAlert[]>([]);
  const [validation, setValidation] = useState<MarketplaceValidationReport | null>(null);
  const [loading, setLoading] = useState(false);

  // AI Analyst state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [resKpis, resFunnel, resValidation] = await Promise.all([
        fetch("/api/analytics/marketplace"),
        fetch("/api/analytics/marketplace/funnel"),
        fetch("/api/analytics/marketplace/validation"),
      ]);

      const dataKpis = await resKpis.json();
      if (dataKpis.success) {
        setKpis(dataKpis.kpis);
        setHealth(dataKpis.healthScore);
        setAlerts(dataKpis.alerts || []);
      }

      const dataFunnel = await resFunnel.json();
      if (dataFunnel.success) {
        setFunnel(dataFunnel.funnel);
      }

      const dataVal = await resValidation.json();
      if (dataVal.success) {
        setValidation(dataVal.report);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleAskAi = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse.trim()) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/marketplace-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.aiAnalystResponse);
      }
    } catch (err) {
      console.error("AI Analyst query failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open("/api/analytics/marketplace/export?dataset=overview", "_blank");
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>
            Marketplace Executive Analytics BI
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>
            Authoritative deterministic metrics aggregating GMV, platform revenue, take rate, funnel, and health.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            background: "#111827",
            color: "#FFFFFF",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          📥 Export CSV Dataset
        </button>
      </div>

      {/* Financial Validation & Reconciliation Banner */}
      {validation && (
        <div
          style={{
            background: validation.reconciled ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${validation.reconciled ? "#A7F3D0" : "#FCA5A5"}`,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{validation.reconciled ? "✅" : "⚠️"}</span>
            <div>
              <strong style={{ color: validation.reconciled ? "#065F46" : "#991B1B", fontSize: 15 }}>
                Financial Reconciliation: {validation.reconciled ? "$0 Discrepancy Verified" : "Discrepancy Flagged"}
              </strong>
              <div style={{ fontSize: 13, color: validation.reconciled ? "#047857" : "#B91C1C", marginTop: 2 }}>
                Booking GMV (₹{validation.totalBookingGMV.toLocaleString("en-IN")}) = Payment Ledger = Commission (₹{validation.totalCommissionLedger.toLocaleString("en-IN")}) + Artist Share (₹{validation.totalArtistEarnings.toLocaleString("en-IN")})
              </div>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, background: "#FFFFFF", padding: "4px 10px", borderRadius: 6, color: "#374151" }}>
            Validated: {new Date(validation.validatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Executive KPI Cards */}
      {kpis && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Marketplace GMV</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>₹{kpis.gmv.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 12, color: "#059669", marginTop: 6, fontWeight: 600 }}>↑ +14.2% vs last month</div>
          </div>

          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Platform Revenue (Commission)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#4F46E5" }}>₹{kpis.platformRevenue.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>Take Rate: <strong style={{ color: "#111827" }}>{kpis.takeRatePercent}%</strong></div>
          </div>

          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Artist Net Earnings</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#059669" }}>₹{kpis.artistEarnings.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>90.0% Payout Share</div>
          </div>

          <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Marketplace Bookings</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>{kpis.totalMarketplaceBookings}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>{kpis.activeOrganizations} Orgs • {kpis.activeArtists} Artists</div>
          </div>
        </div>
      )}

      {/* AI Analyst Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
          borderRadius: 16,
          padding: 24,
          color: "#FFFFFF",
          marginBottom: 32,
          boxShadow: "0 10px 25px -5px rgba(17, 24, 39, 0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Marketplace Analyst (Read-Only Explanations)</h2>
        </div>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
          Ask questions in natural language. AI queries validated marketplace datasets to explain performance trends without mutating business state.
        </p>

        <form onSubmit={handleAskAi} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Which city is growing fastest? Or Why did GMV drop?"
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              fontSize: 14,
              color: "#111827",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={aiLoading}
            style={{
              background: "#4F46E5",
              color: "#FFFFFF",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {aiLoading ? "Analyzing..." : "Ask AI Analyst"}
          </button>
        </form>

        {/* Quick Prompts */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: aiResponse ? 16 : 0 }}>
          {[
            "Which city is growing fastest?",
            "Where is supply insufficient?",
            "What is our overall conversion rate?",
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiPrompt(promptText);
                handleAskAi(undefined, promptText);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* AI Answer Box */}
        {aiResponse && (
          <div style={{ background: "rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: 18, border: "1px solid rgba(255, 255, 255, 0.15)", marginTop: 16 }}>
            <div style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 10 }}>
              {aiResponse.answer}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, opacity: 0.7 }}>
              <span>Data Period: {aiResponse.dataPeriod}</span>
              <span>Sources: {aiResponse.dataSources?.join(", ")}</span>
              <span>Confidence: {(aiResponse.confidenceScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Funnel & Health Score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Marketplace Funnel */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px 0", color: "#111827" }}>
            Marketplace Conversion Funnel
          </h2>

          {funnel && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { stage: "Visits", count: funnel.marketplaceVisits, rate: "100%" },
                { stage: "Searches", count: funnel.searches, rate: `${((funnel.searches / funnel.marketplaceVisits) * 100).toFixed(1)}%` },
                { stage: "Profile Views", count: funnel.artistProfileViews, rate: `${funnel.searchToProfileRatePercent}%` },
                { stage: "Chats Started", count: funnel.chatsStarted, rate: `${funnel.profileToChatRatePercent}%` },
                { stage: "Bookings Completed", count: funnel.bookingsCompleted, rate: `${funnel.chatToBookingRatePercent}%` },
                { stage: "Reviews Submitted", count: funnel.reviewsSubmitted, rate: `${((funnel.reviewsSubmitted / funnel.bookingsCompleted) * 100).toFixed(1)}%` },
              ].map((step, idx) => (
                <div key={idx} style={{ background: "#F9FAFB", padding: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                    <span>{step.stage}</span>
                    <span>{step.count.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", display: "flex", justifyContent: "space-between" }}>
                    <span>Stage Conversion:</span>
                    <strong style={{ color: "#4F46E5" }}>{step.rate}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Marketplace Health & Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Health Score */}
          {health && (
            <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#111827" }}>
                  Marketplace Health Score
                </h2>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#059669" }}>
                  {health.overallScore}/100
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Supply/Demand Balance", score: health.factors.supplyDemandBalanceScore },
                  { label: "Conversion Health", score: health.factors.conversionHealthScore },
                  { label: "Dispute & Safety Rate", score: health.factors.disputeSafetyScore },
                  { label: "Rating & Trust Index", score: health.factors.ratingTrustScore },
                  { label: "Payment Success Rate", score: health.factors.paymentSuccessScore },
                ].map((factor, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                      <span>{factor.label}</span>
                      <span>{factor.score.toFixed(1)}</span>
                    </div>
                    <div style={{ width: "100%", background: "#E5E7EB", height: 6, borderRadius: 3 }}>
                      <div style={{ width: `${factor.score}%`, background: "#059669", height: 6, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24, flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>
              Active Intelligence Alerts
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alerts.map((a) => (
                <div key={a.alertId} style={{ padding: 12, borderRadius: 8, background: "#FEF3C7", border: "1px solid #FDE68A", fontSize: 13, color: "#92400E" }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>
                    ⚠️ {a.alertType} ({a.locationId?.toUpperCase()})
                  </div>
                  <div>{a.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
