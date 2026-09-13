"use client";

import React, { useState } from "react";
import { LocationIntelligenceData, DestinationQuoteResult } from "../../lib/locations/location-types";

interface Props {
  initialData: LocationIntelligenceData;
}

export default function LocationIntelligenceDashboard({ initialData }: Props) {
  const [data] = useState<LocationIntelligenceData>(initialData);
  const [activeTab, setActiveTab] = useState<
    | "OVERVIEW"
    | "QUOTE_CALCULATOR"
    | "PROFITABILITY"
    | "HEALTH_SCORES"
    | "SEO_POLICIES"
    | "AI_ANALYST"
  >("OVERVIEW");

  // AI Analyst state
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Destination Quote Form State
  const [brideName, setBrideName] = useState("Priya Rathore");
  const [destinationCity, setDestinationCity] = useState("Udaipur");
  const [travelMode, setTravelMode] = useState<"Flight" | "Train" | "Luxury Cab">("Flight");
  const [artistCount, setArtistCount] = useState(2);
  const [quoteResult, setQuoteResult] = useState<DestinationQuoteResult | null>(null);
  const [calculatingQuote, setCalculatingQuote] = useState(false);

  const handleAskAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/location-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (json.success) {
        setAiAnswer(json.answer);
      } else {
        setAiAnswer("Error: " + (json.error || "Failed to analyze location data"));
      }
    } catch {
      setAiAnswer("Failed to connect to Location Analyst service.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCalculateQuote = async () => {
    setCalculatingQuote(true);
    try {
      const res = await fetch("/api/location/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName,
          destinationCity,
          venueAddress: "Taj Lake Palace, Udaipur",
          travelMode,
          artistCount,
          requiresStay: true,
          functions: [
            {
              functionName: "Sangeet",
              eventDate: "2026-10-14",
              readyByTime: "18:00",
              venueName: "Resort Lawn",
              guestCount: 3,
              serviceId: "pre-wedding-glam",
              assignedArtistIds: ["artist_ananya"],
            },
            {
              functionName: "Wedding",
              eventDate: "2026-10-15",
              readyByTime: "14:00",
              venueName: "Palace Mandap",
              guestCount: 2,
              serviceId: "royal-bridal",
              assignedArtistIds: ["artist_prachi", "artist_rahul"],
            },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setQuoteResult(json.quote);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculatingQuote(false);
    }
  };

  const exportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Location,Bookings,Revenue,TravelCost,ArtistPayout,NetContribution,MarginPercent"]
        .concat(
          data.profitability.map(
            (p) =>
              `"${p.locationName}",${p.totalBookings},${p.revenue},${p.travelCost},${p.artistPayout},${p.netContribution},${p.marginPercent}%`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `location_intelligence_${data.dataAsOf.substring(0, 10)}.csv`);
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
            🗺️ Multi-City & Destination Intelligence
          </h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0 0", fontSize: "14px" }}>
            Jodhpur • Jaipur • Udaipur • Destination Weddings • Regional Pricing & SEO
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
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>ACTIVE LOCATIONS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>
            {data.summary.totalLocationsActive} Hubs
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>Jodhpur, Jaipur, Udaipur, Dest</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>REGIONAL REVENUE</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", marginTop: "4px" }}>
            ₹{data.summary.totalRegionalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>Top: {data.summary.topPerformingLocation}</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>DESTINATION BOOKINGS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6366F1", marginTop: "4px" }}>
            {data.summary.totalDestinationBookings}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>Outstation Weddings</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>AVG DESTINATION QUOTE</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#B45309", marginTop: "4px" }}>
            ₹{data.summary.averageDestinationQuoteValue.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>Includes Travel & Stay</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E5E7EB", marginBottom: "24px" }}>
        {[
          { id: "OVERVIEW", label: "📊 Overview & Studio Hubs" },
          { id: "QUOTE_CALCULATOR", label: "✈️ Destination Quote Engine" },
          { id: "PROFITABILITY", label: "💰 City Profitability & Margins" },
          { id: "HEALTH_SCORES", label: "🏥 Location Health Scores" },
          { id: "SEO_POLICIES", label: "🔍 Multi-City SEO & Policies" },
          { id: "AI_ANALYST", label: "✨ AI Location Analyst" },
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

      {/* Tab 1: Overview & Hubs */}
      {activeTab === "OVERVIEW" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🏰 Canonical Studio & Location Hubs</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {data.locations.map((loc) => (
              <div
                key={loc.locationId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{loc.name}</h3>
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
                    {loc.cityTier}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "6px" }}>
                  Default Travel Fee: ₹{loc.defaultBaseTravelFee.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Quote Calculator */}
      {activeTab === "QUOTE_CALCULATOR" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>✈️ Destination Quote Calculator</h2>
            <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
              <input
                type="text"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Bride / Client Name"
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Destination City (e.g. Udaipur, Goa)"
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as any)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Luxury Cab">Luxury Cab</option>
              </select>
              <input
                type="number"
                value={artistCount}
                onChange={(e) => setArtistCount(Number(e.target.value))}
                placeholder="Number of Artists"
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
            </div>
            <button
              onClick={handleCalculateQuote}
              disabled={calculatingQuote}
              style={{
                padding: "12px 20px",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {calculatingQuote ? "Calculating..." : "Calculate Authoritative Quote"}
            </button>
          </div>

          <div>
            {quoteResult ? (
              <div
                style={{
                  backgroundColor: "#1E1B4B",
                  color: "#FFFFFF",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #4338CA",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#C084FC", margin: 0 }}>
                  Authoritative Quote Breakdown
                </h3>
                <div style={{ fontSize: "13px", color: "#E0E7FF", marginTop: "4px" }}>
                  Client: {quoteResult.brideName} ({quoteResult.destinationCity})
                </div>
                <hr style={{ margin: "12px 0", border: "0", borderTop: "1px solid #3730A3" }} />
                <div style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                  <div>Service Fees: ₹{quoteResult.serviceFeesTotal.toLocaleString()}</div>
                  <div>Travel Fee ({travelMode}): ₹{quoteResult.travelFeeTotal.toLocaleString()}</div>
                  <div>Stay & Accommodation: ₹{quoteResult.accommodationFeeTotal.toLocaleString()}</div>
                  <div>Logistics & Transfers: ₹{quoteResult.logisticsFeeTotal.toLocaleString()}</div>
                  <div>GST Tax (18%): ₹{quoteResult.taxAmount.toLocaleString()}</div>
                  <hr style={{ margin: "4px 0", border: "0", borderTop: "1px solid #3730A3" }} />
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#FDE047" }}>
                    Total Quote: ₹{quoteResult.authoritativeTotal.toLocaleString()}
                  </div>
                  <div style={{ color: "#34D399" }}>
                    30% Advance Deposit Required: ₹{quoteResult.depositRequired.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  padding: "32px",
                  borderRadius: "12px",
                  border: "2px dashed #E5E7EB",
                  textAlign: "center",
                  color: "#6B7280",
                }}
              >
                Submit the form on the left to calculate an authoritative multi-function quote.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Profitability */}
      {activeTab === "PROFITABILITY" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>💰 Location Profitability & Margin Breakdown</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Location Market</th>
                <th style={{ padding: "12px" }}>Bookings</th>
                <th style={{ padding: "12px" }}>Revenue</th>
                <th style={{ padding: "12px" }}>Travel Cost</th>
                <th style={{ padding: "12px" }}>Artist Payout</th>
                <th style={{ padding: "12px" }}>Net Contribution</th>
                <th style={{ padding: "12px" }}>Margin (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.profitability.map((p) => (
                <tr key={p.locationId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{p.locationName}</td>
                  <td style={{ padding: "12px" }}>{p.totalBookings}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#059669" }}>₹{p.revenue.toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>₹{p.travelCost.toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>₹{p.artistPayout.toLocaleString()}</td>
                  <td style={{ padding: "12px", fontWeight: 600 }}>₹{p.netContribution.toLocaleString()}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#7C3AED" }}>{p.marginPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Health Scores */}
      {activeTab === "HEALTH_SCORES" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🏥 Location Health & Capacity Status</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {data.healthScores.map((h) => (
              <div
                key={h.locationId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{h.locationName}</h3>
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
                    Health: {h.healthScore}/100
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "8px" }}>
                  Demand: <strong>{h.demandStatus}</strong> | Capacity: <strong>{h.capacityStatus}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: SEO & Policies */}
      {activeTab === "SEO_POLICIES" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🔍 Multi-City SEO Metadata & Policies</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Route</th>
                <th style={{ padding: "12px" }}>SEO Title Tag</th>
                <th style={{ padding: "12px" }}>Studio Address</th>
                <th style={{ padding: "12px" }}>Physical Studio?</th>
              </tr>
            </thead>
            <tbody>
              {data.seoData.map((seo) => (
                <tr key={seo.locationId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#7C3AED" }}>{seo.canonicalPath}</td>
                  <td style={{ padding: "12px" }}>{seo.titleTag}</td>
                  <td style={{ padding: "12px", fontSize: "12px" }}>{seo.addressString}</td>
                  <td style={{ padding: "12px" }}>
                    {seo.hasPhysicalStudio ? (
                      <span style={{ color: "#059669", fontWeight: 600 }}>YES (Flagship)</span>
                    ) : (
                      <span style={{ color: "#6B7280" }}>NO (On-Location)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: AI Analyst */}
      {activeTab === "AI_ANALYST" && (
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>✨ AI Location Analyst</h2>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask e.g. Which city generates the highest net contribution?"
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
            {loadingAi ? "Analyzing..." : "Ask Location Analyst"}
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
