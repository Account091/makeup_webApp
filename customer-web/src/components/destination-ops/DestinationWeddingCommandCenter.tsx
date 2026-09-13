"use client";

import React, { useState } from "react";
import { DestinationOpsData } from "../../lib/destination-ops/destination-ops-types";

interface Props {
  initialData: DestinationOpsData;
}

export default function DestinationWeddingCommandCenter({ initialData }: Props) {
  const [data] = useState<DestinationOpsData>(initialData);
  const [activeTab, setActiveTab] = useState<
    | "OVERVIEW"
    | "FUNCTIONS"
    | "VENUES_LOGISTICS"
    | "TRAVEL_ACCOMMODATION"
    | "PAYMENTS"
    | "LOOKBOARDS"
    | "AI_COPILOT"
  >("OVERVIEW");

  // AI Copilot state
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAskAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/destination-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (json.success) {
        setAiAnswer(json.answer);
      } else {
        setAiAnswer("Error: " + (json.error || "Failed to analyze destination data"));
      }
    } catch {
      setAiAnswer("Failed to connect to Destination Copilot service.");
    } finally {
      setLoadingAi(false);
    }
  };

  const exportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Bride,Destination,StartDate,EndDate,GuestCount,TotalQuote,Paid,Outstanding,Status"]
        .concat(
          data.weddings.map(
            (w) =>
              `"${w.brideName}","${w.destinationCity}",${w.startDate},${w.endDate},${w.guestCount},${w.totalQuoteAmount},${w.totalPaidAmount},${w.outstandingBalance},"${w.status}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `destination_ops_${data.dataAsOf.substring(0, 10)}.csv`);
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
            🏰 Destination Wedding Operations Command Center
          </h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0 0", fontSize: "14px" }}>
            Multi-Day Itineraries • Venues & Logistics • Flight/Stay Planning • Payment Milestones • AI Copilot
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
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>ACTIVE WEDDINGS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>
            {data.summary.totalActiveWeddings} Weddings
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
            {data.summary.upcomingWeddings30Days} upcoming in 30D
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>PIPELINE VALUE</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", marginTop: "4px" }}>
            ₹{data.summary.pipelineQuoteValue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>Total Quotes Issued</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>CONFIRMED COLLECTED</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6366F1", marginTop: "4px" }}>
            ₹{data.summary.confirmedRevenueValue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>Staged Deposits Collected</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>RISKS & ALERTS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#DC2626", marginTop: "4px" }}>
            {data.risks.length} Risks
          </div>
          <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "4px" }}>
            {data.summary.criticalRisksCount} Critical/High
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E5E7EB", marginBottom: "24px" }}>
        {[
          { id: "OVERVIEW", label: "🏰 Command Overview" },
          { id: "FUNCTIONS", label: "🗓️ Multi-Function Itineraries" },
          { id: "VENUES_LOGISTICS", label: "📍 Venues & Logistics Checklist" },
          { id: "TRAVEL_ACCOMMODATION", label: "✈️ Travel & Hotel Stay" },
          { id: "PAYMENTS", label: "💰 Staged Payment Milestones" },
          { id: "LOOKBOARDS", label: "💄 Bridal Lookboards" },
          { id: "AI_COPILOT", label: "✨ AI Destination Copilot" },
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

      {/* Tab 1: Overview */}
      {activeTab === "OVERVIEW" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🚨 Active Operational Risks</h2>
          <div style={{ display: "grid", gap: "12px", marginBottom: "32px" }}>
            {data.risks.map((r) => (
              <div
                key={r.riskId}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: r.severity === "CRITICAL" ? "#FEF2F2" : "#FFFBEB",
                  borderLeft: `4px solid ${r.severity === "CRITICAL" ? "#EF4444" : "#F59E0B"}`,
                }}
              >
                <div style={{ fontWeight: "bold", color: "#111827" }}>{r.title}</div>
                <div style={{ fontSize: "13px", color: "#4B5563", marginTop: "4px" }}>{r.description}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🏰 Active Destination Weddings</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {data.weddings.map((w) => (
              <div
                key={w.weddingId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                    {w.brideName} ({w.destinationCity})
                  </h3>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: w.status === "CONFIRMED" ? "#D1FAE5" : "#FEE2E2",
                      color: w.status === "CONFIRMED" ? "#065F46" : "#991B1B",
                    }}
                  >
                    {w.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                  Dates: {w.startDate} to {w.endDate} | Guests: {w.guestCount}
                </div>
                <hr style={{ margin: "12px 0", border: "0", borderTop: "1px solid #F3F4F6" }} />
                <div style={{ fontSize: "13px" }}>
                  Total Quote: <strong>₹{w.totalQuoteAmount.toLocaleString()}</strong> | Paid:{" "}
                  <strong style={{ color: "#059669" }}>₹{w.totalPaidAmount.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: "13px", color: "#DC2626", marginTop: "4px" }}>
                  Outstanding Balance: ₹{w.outstandingBalance.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Functions */}
      {activeTab === "FUNCTIONS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🗓️ Multi-Function Itinerary Timeline</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Function</th>
                <th style={{ padding: "12px" }}>Date & Time</th>
                <th style={{ padding: "12px" }}>Ready By</th>
                <th style={{ padding: "12px" }}>Venue</th>
                <th style={{ padding: "12px" }}>Assigned Artists</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.functions.map((fn) => (
                <tr key={fn.functionId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{fn.functionType}</td>
                  <td style={{ padding: "12px" }}>
                    {fn.date} ({fn.startTime})
                  </td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#DC2626" }}>{fn.readyByTime}</td>
                  <td style={{ padding: "12px", fontSize: "12px" }}>{fn.venueName}</td>
                  <td style={{ padding: "12px" }}>{fn.assignedArtistIds.join(", ")}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#EDE9FE",
                        color: "#6D28D9",
                        borderRadius: "4px",
                        fontWeight: 600,
                        fontSize: "11px",
                      }}
                    >
                      {fn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Venues & Logistics */}
      {activeTab === "VENUES_LOGISTICS" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📍 Registered Venues</h2>
            {data.venues.map((v) => (
              <div
                key={v.venueId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>{v.venueName}</div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{v.address}</div>
                <div style={{ fontSize: "12px", color: "#4B5563", marginTop: "6px" }}>
                  Contact: {v.contactName} ({v.contactPhone})
                </div>
                <div style={{ fontSize: "11px", color: "#B45309", marginTop: "4px" }}>Access Notes: {v.accessNotes}</div>
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📋 Logistics Checklist</h2>
            <div style={{ display: "grid", gap: "8px" }}>
              {data.logistics.map((item) => (
                <div
                  key={item.itemId}
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{item.title}</div>
                    <div style={{ fontSize: "11px", color: "#6B7280" }}>
                      Owner: {item.ownerRole} | Due: {item.dueDate}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      backgroundColor: item.status === "COMPLETED" ? "#D1FAE5" : "#FEF3C7",
                      color: item.status === "COMPLETED" ? "#065F46" : "#92400E",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Travel & Accommodation */}
      {activeTab === "TRAVEL_ACCOMMODATION" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>✈️ Travel Itineraries</h2>
            {data.travelItineraries.map((tr) => (
              <div
                key={tr.itineraryId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {tr.originCity} → {tr.destinationCity} ({tr.travelMode})
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                  Date: {tr.travelDate} | Departure: {tr.departureTime}
                </div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>
                  Status: <strong>{tr.status}</strong> | Est Cost: ₹{tr.estimatedCost.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🏨 Hotel Accommodations</h2>
            {data.accommodations.map((acc) => (
              <div
                key={acc.accommodationId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{acc.hotelName}</div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                  Check-in: {acc.checkInDate} | Check-out: {acc.checkOutDate}
                </div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>
                  Rooms: {acc.roomsRequired} | Ref: {acc.bookingReference} | Status: <strong>{acc.status}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === "PAYMENTS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>💰 Staged Payment Schedule Milestones</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Milestone</th>
                <th style={{ padding: "12px" }}>Amount</th>
                <th style={{ padding: "12px" }}>Due Date</th>
                <th style={{ padding: "12px" }}>Payment Ref</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.paymentSchedules.map((p) => (
                <tr key={p.milestoneId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{p.milestoneLabel}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#059669" }}>₹{p.amount.toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>{p.dueDate}</td>
                  <td style={{ padding: "12px", fontSize: "12px" }}>{p.paymentRecordId || "N/A"}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: p.status === "PAID" ? "#D1FAE5" : "#FEF3C7",
                        color: p.status === "PAID" ? "#065F46" : "#92400E",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Lookboards */}
      {activeTab === "LOOKBOARDS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>💄 Bridal Function Lookboards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {data.lookboards.map((l) => (
              <div
                key={l.lookboardId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "bold", margin: 0 }}>
                    {l.functionType}: {l.lookTitle}
                  </h3>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: "#D1FAE5",
                      color: "#065F46",
                    }}
                  >
                    {l.approvalStatus}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#4B5563", marginTop: "8px" }}>
                  Hair: {l.hairStylePreference}
                </div>
                <div style={{ fontSize: "12px", color: "#4B5563", marginTop: "4px" }}>
                  Draping: {l.drapingPoshakStyle}
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "8px" }}>
                  Notes: {l.customerNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: AI Copilot */}
      {activeTab === "AI_COPILOT" && (
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>✨ AI Destination Copilot</h2>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask e.g. Summarize upcoming Udaipur wedding risks"
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
            {loadingAi ? "Analyzing..." : "Ask Destination Copilot"}
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
