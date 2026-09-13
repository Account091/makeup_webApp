"use client";

import React, { useState } from "react";
import { MarketingIntelligenceData, CampaignPlanResult } from "../../lib/marketing/marketing-types";

interface Props {
  initialData: MarketingIntelligenceData;
}

export default function MarketingIntelligenceDashboard({ initialData }: Props) {
  const [data] = useState<MarketingIntelligenceData>(initialData);
  const [activeTab, setActiveTab] = useState<
    | "OVERVIEW"
    | "CHANNELS"
    | "CONTENT"
    | "CAMPAIGNS"
    | "COUPONS_REFERRALS"
    | "CAC_ROAS"
    | "FUNNEL_LOCATIONS"
    | "AI_ANALYST"
  >("OVERVIEW");

  // AI Analyst state
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Campaign Planner state
  const [planGoal, setPlanGoal] = useState("Book 10 Destination Bridal Packages");
  const [planCity, setPlanCity] = useState("Jaipur");
  const [planService, setPlanService] = useState("Royal Bridal Makeup");
  const [planBudget, setPlanBudget] = useState(30000);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlanResult | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handleAskAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/marketing-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (json.success) {
        setAiAnswer(json.answer);
      } else {
        setAiAnswer("Error: " + (json.error || "Failed to analyze marketing data"));
      }
    } catch {
      setAiAnswer("Failed to connect to Marketing Analyst service.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch("/api/ai/campaign-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: planGoal,
          targetCity: planCity,
          targetService: planService,
          budget: planBudget,
          durationDays: 30,
          platform: "Instagram & WhatsApp",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCampaignPlan(json.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const exportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Channel,Leads,Qualified,Bookings,Revenue,Spend,ROAS,CAC"]
        .concat(
          data.channels.map(
            (c) =>
              `"${c.channelName}",${c.leads},${c.qualifiedLeads},${c.bookings},${c.revenue},${c.cost},${c.roi},${c.cost > 0 && c.bookings > 0 ? Math.round(c.cost / c.bookings) : 0}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `marketing_intelligence_${data.dataAsOf.substring(0, 10)}.csv`);
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
            📣 Marketing & Attribution Intelligence
          </h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0 0", fontSize: "14px" }}>
            Attribution Engine • Campaign Analytics • CAC & ROAS • AI Campaign Planner
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
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>MARKETING LEADS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginTop: "4px" }}>
            {data.summary.marketingLeads}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
            ↑ {data.summary.previousPeriodComparison.marketingLeadsChange}% vs prev period
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>QUALIFIED LEADS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6366F1", marginTop: "4px" }}>
            {data.summary.qualifiedLeads}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
            {((data.summary.qualifiedLeads / data.summary.marketingLeads) * 100).toFixed(1)}% qualification
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>ATTRIBUTED BOOKINGS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", marginTop: "4px" }}>
            {data.summary.bookings}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
            ↑ {data.summary.previousPeriodComparison.bookingsChange}% vs prev period
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>ATTRIBUTED REVENUE</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#B45309", marginTop: "4px" }}>
            ₹{data.summary.revenueAttributed.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
            ↑ {data.summary.previousPeriodComparison.revenueChange}% vs prev period
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>OVERALL ROAS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#7C3AED", marginTop: "4px" }}>
            {data.summary.roas}x
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
            Spend: ₹{data.summary.marketingSpend.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>AVERAGE CAC</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#DC2626", marginTop: "4px" }}>
            ₹{data.summary.cac}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
            ↓ {Math.abs(data.summary.previousPeriodComparison.cacChange)}% improvement
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E5E7EB", marginBottom: "24px" }}>
        {[
          { id: "OVERVIEW", label: "📊 Overview & Alerts" },
          { id: "CHANNELS", label: "📱 Channels" },
          { id: "CONTENT", label: "🎬 Content Attribution" },
          { id: "CAMPAIGNS", label: "🎯 Campaigns" },
          { id: "COUPONS_REFERRALS", label: "🎟️ Coupons & Referrals" },
          { id: "CAC_ROAS", label: "💰 CAC & ROAS" },
          { id: "FUNNEL_LOCATIONS", label: "🗺️ Funnel & Cities" },
          { id: "AI_ANALYST", label: "✨ AI Analyst & Planner" },
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
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🚨 Active Marketing Alerts</h2>
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

          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
            🎯 Service × Channel Attribution Matrix
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Service</th>
                <th style={{ padding: "12px" }}>Instagram Leads</th>
                <th style={{ padding: "12px" }}>Referral Leads</th>
                <th style={{ padding: "12px" }}>Organic Search</th>
                <th style={{ padding: "12px" }}>WhatsApp</th>
                <th style={{ padding: "12px" }}>Top Channel</th>
              </tr>
            </thead>
            <tbody>
              {data.serviceChannelMatrix.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{row.serviceName}</td>
                  <td style={{ padding: "12px" }}>{row.instagramLeads}</td>
                  <td style={{ padding: "12px" }}>{row.referralLeads}</td>
                  <td style={{ padding: "12px" }}>{row.organicLeads}</td>
                  <td style={{ padding: "12px" }}>{row.whatsappLeads}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#EDE9FE",
                        color: "#6D28D9",
                        borderRadius: "4px",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {row.topChannel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Channels */}
      {activeTab === "CHANNELS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📱 Marketing Channel Intelligence</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Channel</th>
                <th style={{ padding: "12px" }}>Views / Visits*</th>
                <th style={{ padding: "12px" }}>Leads</th>
                <th style={{ padding: "12px" }}>Bookings</th>
                <th style={{ padding: "12px" }}>Revenue Attributed</th>
                <th style={{ padding: "12px" }}>Spend</th>
                <th style={{ padding: "12px" }}>Conversion</th>
                <th style={{ padding: "12px" }}>ROI / ROAS</th>
              </tr>
            </thead>
            <tbody>
              {data.channels.map((c) => (
                <tr key={c.channelId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{c.channelName}</td>
                  <td style={{ padding: "12px" }}>{c.impressionsOrViews.toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>{c.leads}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#059669" }}>{c.bookings}</td>
                  <td style={{ padding: "12px", fontWeight: 600 }}>₹{c.revenue.toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>₹{c.cost.toLocaleString()}</td>
                  <td style={{ padding: "12px" }}>{c.conversionRate}%</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#7C3AED" }}>
                    {c.cost > 0 ? `${c.roi}x` : "Organic (N/A)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px" }}>
            *Marked views/visits are tracked from first-party website & landing page events.
          </p>
        </div>
      )}

      {/* Tab 3: Content Attribution */}
      {activeTab === "CONTENT" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
            🎬 Content Attribution (First-Touch, Last-Touch & Assisted)
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Content Title</th>
                <th style={{ padding: "12px" }}>Format</th>
                <th style={{ padding: "12px" }}>First-Touch Leads</th>
                <th style={{ padding: "12px" }}>Last-Touch Bookings</th>
                <th style={{ padding: "12px" }}>Assisted Bookings</th>
                <th style={{ padding: "12px" }}>Attributed Revenue</th>
                <th style={{ padding: "12px" }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.contentAttribution.map((item) => (
                <tr key={item.contentId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "4px",
                        fontSize: "11px",
                      }}
                    >
                      {item.mediaType}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{item.firstTouchLeads}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#059669" }}>{item.lastTouchBookings}</td>
                  <td style={{ padding: "12px" }}>{item.assistedBookings}</td>
                  <td style={{ padding: "12px", fontWeight: 600 }}>₹{item.attributedRevenue.toLocaleString()}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#7C3AED" }}>
                    {item.contentPerformanceScore} / 100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Campaigns */}
      {activeTab === "CAMPAIGNS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🎯 Campaign Performance Analytics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {data.campaigns.map((cmp) => (
              <div
                key={cmp.campaignId}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{cmp.name}</h3>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: cmp.status === "ACTIVE" ? "#D1FAE5" : "#F3F4F6",
                      color: cmp.status === "ACTIVE" ? "#065F46" : "#374151",
                    }}
                  >
                    {cmp.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>Platform: {cmp.platform}</div>
                <hr style={{ margin: "12px 0", border: "0", borderTop: "1px solid #F3F4F6" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                  <div>
                    Leads: <strong>{cmp.leads}</strong>
                  </div>
                  <div>
                    Bookings: <strong>{cmp.bookings}</strong>
                  </div>
                  <div>
                    Revenue: <strong>₹{cmp.revenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    Spend: <strong>₹{cmp.spend.toLocaleString()}</strong>
                  </div>
                  <div>
                    CAC: <strong style={{ color: "#DC2626" }}>₹{cmp.cac}</strong>
                  </div>
                  <div>
                    ROAS: <strong style={{ color: "#7C3AED" }}>{cmp.roas}x</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Coupons & Referrals */}
      {activeTab === "COUPONS_REFERRALS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🎟️ Coupon & Referral Intelligence</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Coupon Code Performance</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Code</th>
                    <th style={{ padding: "8px" }}>Used</th>
                    <th style={{ padding: "8px" }}>Revenue</th>
                    <th style={{ padding: "8px" }}>Discount Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.coupons.map((c) => (
                    <tr key={c.code} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{c.code}</td>
                      <td style={{ padding: "8px" }}>{c.couponsUsed}</td>
                      <td style={{ padding: "8px", fontWeight: 600 }}>₹{c.revenueGenerated.toLocaleString()}</td>
                      <td style={{ padding: "8px", color: "#DC2626" }}>₹{c.discountValueTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Referral Program Metrics</h3>
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
                  Active Referral Codes: <strong>{data.referrals.referralCodesActive}</strong>
                </div>
                <div>
                  Referrals Converted: <strong>{data.referrals.bookingsGenerated}</strong>
                </div>
                <div>
                  Attributed Revenue: <strong>₹{data.referrals.revenueGenerated.toLocaleString()}</strong>
                </div>
                <div>
                  Referral CAC: <strong style={{ color: "#059669" }}>₹{data.referrals.referralCac}</strong>
                </div>
                <div>
                  Referral ROI: <strong style={{ color: "#7C3AED" }}>{data.referrals.referralRoi}x</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: CAC & ROAS */}
      {activeTab === "CAC_ROAS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>💰 Customer Acquisition Cost & ROAS</h2>
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>Attribution Quality & Coverage</h3>
            <div style={{ display: "flex", gap: "24px", margin: "16px 0" }}>
              <div>
                Coverage: <strong style={{ fontSize: "20px", color: "#7C3AED" }}>{data.attributionQuality.attributionCoveragePercent}%</strong>
              </div>
              <div>
                Attributed Bookings: <strong>{data.attributionQuality.attributedBookings}</strong>
              </div>
              <div>
                Unattributed Bookings: <strong>{data.attributionQuality.unattributedBookings}</strong>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#6B7280" }}>
              Attribution models follow strict first-touch, last-touch, and assisted rules without inventing missing cost parameters.
            </p>
          </div>
        </div>
      )}

      {/* Tab 7: Funnel & Locations */}
      {activeTab === "FUNNEL_LOCATIONS" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>🗺️ City & Destination Marketing Performance</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#FFFFFF", borderRadius: "8px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>City / Region</th>
                <th style={{ padding: "12px" }}>Leads</th>
                <th style={{ padding: "12px" }}>Bookings</th>
                <th style={{ padding: "12px" }}>Revenue</th>
                <th style={{ padding: "12px" }}>CAC</th>
                <th style={{ padding: "12px" }}>Top Service</th>
                <th style={{ padding: "12px" }}>Top Channel</th>
              </tr>
            </thead>
            <tbody>
              {data.locationMarketing.map((loc, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{loc.city}</td>
                  <td style={{ padding: "12px" }}>{loc.leads}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#059669" }}>{loc.bookings}</td>
                  <td style={{ padding: "12px", fontWeight: 600 }}>₹{loc.revenue.toLocaleString()}</td>
                  <td style={{ padding: "12px", color: "#DC2626" }}>₹{loc.cac}</td>
                  <td style={{ padding: "12px" }}>{loc.topService}</td>
                  <td style={{ padding: "12px" }}>{loc.topChannel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 8: AI Analyst & Campaign Planner */}
      {activeTab === "AI_ANALYST" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* AI Analyst */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>✨ AI Marketing Analyst</h2>
            <div style={{ marginBottom: "12px" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask e.g. Which channel has the best ROAS?"
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
              {loadingAi ? "Analyzing..." : "Ask AI Analyst"}
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

          {/* AI Campaign Planner */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>🎯 AI Campaign Planner</h2>
            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                value={planGoal}
                onChange={(e) => setPlanGoal(e.target.value)}
                placeholder="Campaign Goal"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
              <input
                type="text"
                value={planCity}
                onChange={(e) => setPlanCity(e.target.value)}
                placeholder="Target City"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
              <input
                type="text"
                value={planService}
                onChange={(e) => setPlanService(e.target.value)}
                placeholder="Target Service"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
              <input
                type="number"
                value={planBudget}
                onChange={(e) => setPlanBudget(Number(e.target.value))}
                placeholder="Budget (₹)"
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>
            <button
              onClick={handleGeneratePlan}
              disabled={loadingPlan}
              style={{
                padding: "10px 16px",
                backgroundColor: "#059669",
                color: "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loadingPlan ? "Planning..." : "Generate Campaign Draft"}
            </button>

            {campaignPlan && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  backgroundColor: "#ECFDF5",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#065F46",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{campaignPlan.campaignObjective}</div>
                <div style={{ marginTop: "4px" }}>Caption: "{campaignPlan.suggestedCaption}"</div>
                <div style={{ marginTop: "4px" }}>
                  Target Leads: <strong>{campaignPlan.suggestedKpiTargets.targetLeads}</strong> | Target ROAS:{" "}
                  <strong>{campaignPlan.suggestedKpiTargets.targetRoas}x</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
