"use client";

import React, { useState } from "react";
import { ForecastingIntelligenceData } from "../../lib/forecasting/forecasting-types";

interface Props {
  initialData: ForecastingIntelligenceData;
}

export default function ForecastingIntelligenceDashboard({ initialData }: Props) {
  const [data] = useState<ForecastingIntelligenceData>(initialData);
  const [activeTab, setActiveTab] = useState<
    | "OVERVIEW"
    | "REVENUE_DEMAND"
    | "CAPACITY_ARTISTS"
    | "SCENARIOS_CASHFLOW"
    | "HEATMAP_TRAVEL"
    | "ACCURACY_MODELS"
    | "AI_ANALYST"
  >("OVERVIEW");

  // AI Analyst state
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAskAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/forecast-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (json.success) {
        setAiAnswer(json.answer);
      } else {
        setAiAnswer("Error: " + (json.error || "Failed to analyze forecast data"));
      }
    } catch {
      setAiAnswer("Failed to connect to Forecast Analyst service.");
    } finally {
      setLoadingAi(false);
    }
  };

  const exportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,ForecastValue,RangeLower,RangeUpper,Classification,ModelVersion"]
        .concat(
          data.revenueForecasts.map(
            (r) =>
              `"${r.periodLabel} Revenue",${r.projectedRevenue},${r.expectedRangeLower},${r.expectedRangeUpper},${r.classification},${r.modelVersion}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `forecasting_intelligence_${data.dataAsOf.substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: 0 }}>
            📈 Forecasting & Capacity Intelligence
          </h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0 0", fontSize: "14px" }}>
            Time-Series Revenue Forecasts • Artist Capacity • Scenarios & Cash-Flow • AI Forecast Analyst
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={exportCsv}
            style={{
              padding: "10px 16px",
              backgroundColor: "#F3F4F6",
              color: "#374151",
              border: "1px solid #D1D5DB",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>NEXT 7D REVENUE (FORECAST)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>
            ₹{data.summary.next7DaysRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>Range: ₹92K – ₹118K</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>NEXT 30D REVENUE (FORECAST)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", marginTop: "4px" }}>
            ₹{data.summary.next30DaysRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>Base scenario target</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>EXPECTED BOOKINGS (30D)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6366F1", marginTop: "4px" }}>
            {data.summary.next30DaysBookings}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>Demand: {data.summary.expectedDemandLevel}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>CAPACITY UTILIZATION</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#B45309", marginTop: "4px" }}>
            {data.summary.capacityUtilizationPercent}%
          </div>
          <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "4px" }}>Lead Master: 93.8% (Risk)</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>PROJECTED NET CASHFLOW</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#7C3AED", marginTop: "4px" }}>
            ₹{data.cashflowForecast.projectedNetCashflow.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
            Inflow: ₹{data.cashflowForecast.projectedInflow.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>MODEL ACCURACY</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", marginTop: "4px" }}>
            {data.accuracy[0].accuracyScorePercent}%
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>MAPE: {data.accuracy[0].mapePercent}%</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E5E7EB", marginBottom: "24px" }}>
        {[
          { id: "OVERVIEW", label: "📊 Overview & Alerts" },
          { id: "REVENUE_DEMAND", label: "💰 Revenue & Demand" },
          { id: "CAPACITY_ARTISTS", label: "🎨 Artist Capacity & Cities" },
          { id: "SCENARIOS_CASHFLOW", label: "⚖️ Scenarios & Cash-Flow" },
          { id: "HEATMAP_TRAVEL", label: "🗓️ Calendar Heatmap & Travel" },
          { id: "ACCURACY_MODELS", label: "🎯 Accuracy & Models" },
          { id: "AI_ANALYST", label: "✨ AI Forecast Analyst" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 16px",
              fontWeight: 600,
              fontSize: "14px",
              color: activeTab === tab.id ? "#7C3AED" : "#6B7280",
              borderBottom: activeTab === tab.id ? "3px solid #7C3AED" : "none",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Alerts */}
      {activeTab === "OVERVIEW" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🚨 Active Forecast Anomaly & Capacity Alerts</h2>
          <div style={{ display: "grid", gap: "12px", marginBottom: "32px" }}>
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: alert.severity === "HIGH" ? "#FEF2F2" : "#FFFBEB",
                  borderLeft: `4px solid ${alert.severity === "HIGH" ? "#EF4444" : "#F59E0B"}`,
                }}
              >
                <div style={{ fontWeight: "bold", color: "#111827" }}>{alert.title}</div>
                <div style={{ fontSize: "13px", color: "#4B5563", marginTop: "4px" }}>{alert.description}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📈 Revenue Projections Summary</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Period</th>
                <th style={{ padding: "12px" }}>Projected Revenue</th>
                <th style={{ padding: "12px" }}>Expected Range</th>
                <th style={{ padding: "12px" }}>Confidence</th>
                <th style={{ padding: "12px" }}>Method</th>
                <th style={{ padding: "12px" }}>Classification</th>
              </tr>
            </thead>
            <tbody>
              {data.revenueForecasts.map((rf, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{rf.periodLabel}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#059669" }}>
                    ₹{rf.projectedRevenue.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    ₹{rf.expectedRangeLower.toLocaleString()} – ₹{rf.expectedRangeUpper.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>{rf.confidenceIntervalPercent}%</td>
                  <td style={{ padding: "12px" }}>{rf.method}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "#EDE9FE",
                        color: "#6D28D9",
                        borderRadius: "4px",
                        fontWeight: 600,
                        fontSize: "11px",
                      }}
                    >
                      {rf.classification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Revenue & Demand */}
      {activeTab === "REVENUE_DEMAND" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>💰 Service Demand & Lead Pipeline Forecast</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Service Demand Breakdown</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Service</th>
                    <th style={{ padding: "8px" }}>Inquiries</th>
                    <th style={{ padding: "8px" }}>Bookings</th>
                    <th style={{ padding: "8px" }}>Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookingDemand.map((b, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{b.serviceName}</td>
                      <td style={{ padding: "8px" }}>{b.expectedRequests}</td>
                      <td style={{ padding: "8px", fontWeight: 600, color: "#059669" }}>{b.confirmedBookings}</td>
                      <td style={{ padding: "8px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            backgroundColor: b.demandLevel === "VERY_HIGH" ? "#FEE2E2" : "#FEF3C7",
                            color: b.demandLevel === "VERY_HIGH" ? "#991B1B" : "#92400E",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {b.demandLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Lead Conversion Projections</h3>
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  display: "grid",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <div>
                  Projected Inquiries: <strong>{data.leadForecast.inquiriesProjected}</strong>
                </div>
                <div>
                  Qualified Leads: <strong>{data.leadForecast.qualifiedLeadsProjected}</strong>
                </div>
                <div>
                  Quotes Sent: <strong>{data.leadForecast.quotesSentProjected}</strong>
                </div>
                <div>
                  Deposits Expected: <strong>{data.leadForecast.depositsExpected}</strong>
                </div>
                <div>
                  Confirmed Bookings Projected: <strong style={{ color: "#059669" }}>{data.leadForecast.confirmedBookingsProjected}</strong>
                </div>
                <div>
                  Overall Conversion Rate: <strong>{data.leadForecast.conversionRatePercent}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Capacity & Artists */}
      {activeTab === "CAPACITY_ARTISTS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🎨 Artist Capacity & City Shortfall Analysis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Artist Utilization Hours</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Artist</th>
                    <th style={{ padding: "8px" }}>Booked</th>
                    <th style={{ padding: "8px" }}>Demand</th>
                    <th style={{ padding: "8px" }}>Utilization</th>
                    <th style={{ padding: "8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.artistCapacity.map((a) => (
                    <tr key={a.artistId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{a.artistName}</td>
                      <td style={{ padding: "8px" }}>{a.bookedHours}h</td>
                      <td style={{ padding: "8px" }}>{a.forecastDemandHours}h</td>
                      <td style={{ padding: "8px", fontWeight: "bold" }}>{a.utilizationPercent}%</td>
                      <td style={{ padding: "8px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: a.status === "CAPACITY_RISK" ? "#FEE2E2" : "#D1FAE5",
                            color: a.status === "CAPACITY_RISK" ? "#991B1B" : "#065F46",
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>City Capacity Status</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>City</th>
                    <th style={{ padding: "8px" }}>Demand</th>
                    <th style={{ padding: "8px" }}>Slots</th>
                    <th style={{ padding: "8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cityCapacity.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{c.city}</td>
                      <td style={{ padding: "8px" }}>{c.projectedBookings}</td>
                      <td style={{ padding: "8px" }}>{c.availableCapacitySlots}</td>
                      <td style={{ padding: "8px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: c.capacityStatus === "CAPACITY_SHORTAGE" ? "#FEE2E2" : "#D1FAE5",
                            color: c.capacityStatus === "CAPACITY_SHORTAGE" ? "#991B1B" : "#065F46",
                          }}
                        >
                          {c.capacityStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Scenarios & Cash-Flow */}
      {activeTab === "SCENARIOS_CASHFLOW" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>⚖️ Forecast Scenarios & Cash-Flow Projections</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>30-Day Scenario Modeling</h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ padding: "12px", backgroundColor: "#F3F4F6", borderRadius: "8px" }}>
                  <div style={{ fontWeight: "bold", color: "#374151" }}>CONSERVATIVE SCENARIO</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>
                    Revenue: ₹{data.scenarios.conservative.revenue.toLocaleString()} | Bookings: {data.scenarios.conservative.bookings}
                  </div>
                </div>

                <div style={{ padding: "12px", backgroundColor: "#ECFDF5", borderRadius: "8px", border: "1px solid #A7F3D0" }}>
                  <div style={{ fontWeight: "bold", color: "#065F46" }}>BASE SCENARIO (TARGET)</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#047857", marginTop: "4px" }}>
                    Revenue: ₹{data.scenarios.base.revenue.toLocaleString()} | Bookings: {data.scenarios.base.bookings}
                  </div>
                </div>

                <div style={{ padding: "12px", backgroundColor: "#F5F3FF", borderRadius: "8px" }}>
                  <div style={{ fontWeight: "bold", color: "#5B21B6" }}>OPTIMISTIC SCENARIO</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#6D28D9", marginTop: "4px" }}>
                    Revenue: ₹{data.scenarios.optimistic.revenue.toLocaleString()} | Bookings: {data.scenarios.optimistic.bookings}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Next 30D Cash-Flow Breakdown</h3>
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  display: "grid",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <div>
                  Projected Inflow: <strong style={{ color: "#059669" }}>₹{data.cashflowForecast.projectedInflow.toLocaleString()}</strong>
                </div>
                <div>
                  Projected Outflow: <strong style={{ color: "#DC2626" }}>₹{data.cashflowForecast.projectedOutflow.toLocaleString()}</strong>
                </div>
                <hr style={{ margin: "4px 0", border: "0", borderTop: "1px solid #E5E7EB" }} />
                <div>
                  Artist Payouts: ₹{data.cashflowForecast.expectedExpensesBreakdown.artistPayouts.toLocaleString()}
                </div>
                <div>
                  Travel Expenses: ₹{data.cashflowForecast.expectedExpensesBreakdown.travelExpenses.toLocaleString()}
                </div>
                <div>
                  Marketing Spend: ₹{data.cashflowForecast.expectedExpensesBreakdown.marketingSpend.toLocaleString()}
                </div>
                <hr style={{ margin: "4px 0", border: "0", borderTop: "1px solid #E5E7EB" }} />
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#7C3AED" }}>
                  Net Cash Movement: ₹{data.cashflowForecast.projectedNetCashflow.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Heatmap & Travel */}
      {activeTab === "HEATMAP_TRAVEL" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🗓️ Calendar Demand Heatmap & Destination Travel Buffer Risks</h2>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Upcoming Peak Dates Heatmap</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
              {data.heatmap.map((day, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>{day.date}</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px" }}>{day.dayOfWeek}</div>
                  <div style={{ marginTop: "6px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        backgroundColor: day.demandLevel === "VERY_HIGH" ? "#FEE2E2" : "#FEF3C7",
                        color: day.demandLevel === "VERY_HIGH" ? "#991B1B" : "#92400E",
                      }}
                    >
                      {day.demandLevel}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#4B5563", marginTop: "4px" }}>
                    {day.bookedCount}/{day.capacityLimit} booked
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Outstation Travel Buffer Conflicts</h3>
            {data.travelRisks.map((tr) => (
              <div
                key={tr.bookingId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  marginBottom: "8px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {tr.customerName} ({tr.destinationCity})
                </div>
                <div style={{ fontSize: "13px", color: "#4B5563", marginTop: "4px" }}>
                  Travel Block: {tr.travelBlockStart} to {tr.travelBlockEnd}
                </div>
                <div style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{tr.bufferNotes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Accuracy & Models */}
      {activeTab === "ACCURACY_MODELS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🎯 Forecast Model Accuracy & Reproducibility</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Metric Name</th>
                <th style={{ padding: "12px" }}>Window</th>
                <th style={{ padding: "12px" }}>MAPE (%)</th>
                <th style={{ padding: "12px" }}>MAE</th>
                <th style={{ padding: "12px" }}>Accuracy Score</th>
                <th style={{ padding: "12px" }}>Observations</th>
              </tr>
            </thead>
            <tbody>
              {data.accuracy.map((acc, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{acc.metricName}</td>
                  <td style={{ padding: "12px" }}>{acc.trainingWindowDays} Days</td>
                  <td style={{ padding: "12px" }}>{acc.mapePercent}%</td>
                  <td style={{ padding: "12px" }}>{acc.mae}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#059669" }}>{acc.accuracyScorePercent}%</td>
                  <td style={{ padding: "12px" }}>{acc.historicalObservationsCount} periods</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 7: AI Forecast Analyst */}
      {activeTab === "AI_ANALYST" && (
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>✨ AI Forecast Analyst</h2>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask e.g. What will revenue and artist capacity look like next month?"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
            />
          </div>
          <button
            onClick={handleAskAi}
            disabled={loadingAi}
            style={{
              padding: "10px 16px",
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loadingAi ? "Analyzing..." : "Ask Forecast Analyst"}
          </button>

          {aiAnswer && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                backgroundColor: "#F5F3FF",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#4C1D95",
              }}
            >
              {aiAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
