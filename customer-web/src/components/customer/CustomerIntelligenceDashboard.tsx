"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Heart,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Download,
  CheckCircle2,
  Calendar,
  Star,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  MessageSquare,
  Activity,
} from "lucide-react";
import { calculateCustomerIntelligenceData } from "../../lib/customer/customer-kpi-engine";
import { generateCustomerRisks } from "../../lib/customer/customer-risk-engine";
import { generateCustomerTimelineEvents } from "../../lib/customer/customer-timeline-engine";
import { ExecutiveCustomerDataPackage } from "../../lib/customer/customer-types";

export default function CustomerIntelligenceDashboard() {
  const [custData, setCustData] = useState<ExecutiveCustomerDataPackage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("DOSSIERS");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  // AI Customer Analyst state
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);

  useEffect(() => {
    refreshCustomerData();
  }, [selectedCity]);

  const refreshCustomerData = () => {
    const data = calculateCustomerIntelligenceData();
    data.risks = generateCustomerRisks(data);
    data.timelineEvents = generateCustomerTimelineEvents("cust_priya_01");
    setCustData(data);
  };

  const handleRunCustomerAi = async (customPrompt?: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/customer-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: customPrompt || aiQuery || "Which customers need attention today and what are the key risks?",
        }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error("Customer AI Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const exportCustomerCsv = () => {
    if (!custData) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Phone,City,Segment,HealthScore,LTV"]
        .concat(
          custData.customerDossiers.map(
            (c) => `"${c.fullName}","${c.phone}","${c.city}","${c.segment}","${c.healthScore.score}","₹${c.lifetimeValue}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Makeovers_Customer_Intelligence_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!custData) return null;

  return (
    <div className="min-h-screen bg-[#0C0C10] text-gray-100 p-4 md:p-8 font-sans">
      {/* Header & Controls */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Customer & CRM Intelligence Center
            </h1>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PRIVACY: PII_SCOPED_ADMIN_ONLY
            </span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            V6.2 Customer 360 • Explainable Health Scoring • Real-Time CRM Lead Pipeline • Event-Day Experience Mode
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCustomerCsv}
            className="flex items-center gap-1.5 bg-[#161620] hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> Export Customer CSV
          </button>
        </div>
      </header>

      {/* Top Command Center Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
        {custData.topCards.map((card) => (
          <div
            key={card.key}
            className="bg-[#161620] border border-gray-800/80 rounded-xl p-4 shadow-lg hover:border-[#D4AF37]/40 transition"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{card.label}</span>
              <span className="text-[#22C55E] font-medium">{card.changePercent > 0 ? `+${card.changePercent}%` : `${card.changePercent}%`}</span>
            </div>
            <div className="text-xl font-extrabold text-white mt-2 mb-1">{card.formattedValue}</div>
            <div className="text-[11px] text-gray-400">{card.comparisonPeriod}</div>
          </div>
        ))}
      </section>

      {/* Domain Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-800 mb-6 text-xs font-medium scrollbar-none">
        {[
          { id: "DOSSIERS", label: "Customer 360 & Health", icon: Heart },
          { id: "CRM", label: "CRM Lead Pipeline", icon: TrendingUp },
          { id: "FOLLOWUPS", label: "Priority Follow-ups", icon: Clock },
          { id: "RFM", label: "RFM & Segments", icon: Users },
          { id: "CSAT", label: "CSAT & NPS Survey", icon: Star },
          { id: "CONSULTATION", label: "Consultation & Event-Day", icon: Calendar },
          { id: "RISKS", label: "Customer Risk Alerts", icon: AlertTriangle },
          { id: "TIMELINE", label: "Activity Timeline", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-black font-bold shadow"
                  : "bg-[#161620] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "DOSSIERS" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Customer 360 Dossiers & Explainable Health Scores</h3>
              {custData.customerDossiers.map((c) => (
                <div key={c.customerId} className="p-4 bg-[#161620] border border-gray-800 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{c.fullName}</h4>
                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[10px] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                        {c.segment}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Health Score:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        c.healthScore.classification === "EXCELLENT" || c.healthScore.classification === "HEALTHY"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {c.healthScore.score}/100 ({c.healthScore.classification})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-[#0C0C10] rounded-lg border border-gray-800 text-[11px]">
                    <div>Phone: <span className="text-gray-200">{c.phone}</span></div>
                    <div>City: <span className="text-gray-200">{c.city}</span></div>
                    <div>LTV: <span className="text-[#22C55E] font-bold">₹{c.lifetimeValue.toLocaleString()}</span></div>
                    <div>Bookings: <span className="text-gray-200">{c.bookingCount} ({c.completedBookingCount} Completed)</span></div>
                  </div>

                  <div className="text-[11px] text-gray-400 flex flex-wrap gap-4">
                    <span>💳 Payment Reliability: {c.healthScore.factors.paymentReliability}%</span>
                    <span>💬 Communication: {c.healthScore.factors.communication}%</span>
                    <span>🎧 Support: {c.healthScore.factors.supportExperience}%</span>
                    <span>🔄 Repeat: {c.healthScore.factors.repeatEngagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "CRM" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">CRM Lead Pipeline Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">HOT Leads</span>
                  <div className="text-lg font-bold text-red-400 mt-1">{custData.crmPipeline.hotLeadsCount}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">WARM Leads</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">{custData.crmPipeline.warmLeadsCount}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">COLD Leads</span>
                  <div className="text-lg font-bold text-blue-400 mt-1">{custData.crmPipeline.coldLeadsCount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Quotes Sent / Viewed</span>
                  <div className="text-sm font-bold text-white mt-1">{custData.crmPipeline.quotesSentCount} Sent • {custData.crmPipeline.quotesViewedCount} Viewed</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Deposit Pending</span>
                  <div className="text-sm font-bold text-[#D4AF37] mt-1">{custData.crmPipeline.depositPendingCount} Inquiries</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "FOLLOWUPS" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Priority Lead Follow-up Queue</h3>
              {custData.priorityFollowups.map((pf) => (
                <div key={pf.id} className="p-3.5 bg-[#0C0C10] rounded-lg border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/10 text-red-400 font-bold text-[10px] px-2 py-0.5 rounded border border-red-500/30">
                        {pf.priority} PRIORITY
                      </span>
                      <h4 className="font-bold text-white">{pf.customerName}</h4>
                    </div>
                    <span className="text-[#D4AF37] font-bold">Lead Score: {pf.leadScore}</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">{pf.inquiryTitle}</p>
                  <div className="text-gray-400 text-[11px]">💡 Why Prioritized: {pf.priorityReason}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "RFM" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">RFM Segmentation Scorecard</h3>
              {custData.rfmSegments.map((rfm) => (
                <div key={rfm.segmentName} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{rfm.segmentName} ({rfm.customerCount} Clients)</h4>
                    <p className="text-gray-400 text-[11px] mt-0.5">💡 {rfm.recommendedAction}</p>
                  </div>
                  <div className="text-right font-extrabold text-[#22C55E]">Avg LTV ₹{rfm.averageLtv.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "CSAT" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">CSAT & NPS Survey Scorecard</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Overall CSAT Score</span>
                  <div className="text-lg font-bold text-[#22C55E] mt-1">{custData.csatNps.csatScorePercent}%</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">NPS Score</span>
                  <div className="text-lg font-bold text-[#D4AF37] mt-1">+{custData.csatNps.npsScore}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CONSULTATION" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Consultation & Event-Day Mode Experience</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Trials Booked / Completed</span>
                  <div className="text-sm font-bold text-white mt-1">{custData.consultations.trialsBookedCount} Booked • {custData.consultations.trialsCompletedCount} Completed</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">On-time Ready Rate</span>
                  <div className="text-sm font-bold text-[#22C55E] mt-1">{custData.eventDayFriction.onTimeReadyRatePercent}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "RISKS" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Customer Experience Risk Alerts ({custData.risks.length})</h3>
              {custData.risks.map((risk) => (
                <div key={risk.id} className="p-3 bg-[#0C0C10] border border-red-500/20 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-red-400 font-bold mr-2">[{risk.severity}] {risk.title}</span>
                    <p className="text-gray-300 mt-0.5">{risk.description}</p>
                  </div>
                  <span className="text-gray-400 text-[10px]">Client: {risk.customerName}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "TIMELINE" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Standardized Customer 360 Activity Timeline</h3>
              {custData.timelineEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex items-start gap-3">
                  <Activity className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{evt.title}</h4>
                      <span className="text-[10px] text-gray-500">[{evt.source}]</span>
                    </div>
                    <p className="text-gray-300 text-[11px] mt-0.5">{evt.description}</p>
                    <span className="text-gray-500 text-[10px]">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: AI Customer Analyst Interactive Console */}
        <div className="space-y-4">
          <div className="bg-[#161620] border border-[#D4AF37]/40 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> AI Customer Analyst
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">Hugging Face LLM</span>
            </div>

            <p className="text-xs text-gray-300">
              Summarizes customer dossiers, explains Health Scores, and recommends priority lead follow-ups.
            </p>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                "Which customers are at risk?",
                "Who needs attention today?",
                "Summarize bridal customers",
                "Why is satisfaction score high?",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setAiQuery(chip);
                    handleRunCustomerAi(chip);
                  }}
                  className="bg-[#0C0C10] hover:bg-gray-800 text-gray-300 border border-gray-800 px-2.5 py-1 rounded transition text-left"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input & Search */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask the Customer AI Analyst..."
                className="flex-1 bg-[#0C0C10] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={() => handleRunCustomerAi()}
                disabled={aiLoading}
                className="bg-[#D4AF37] hover:bg-amber-400 text-black font-bold p-2 rounded-lg transition disabled:opacity-50"
              >
                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* AI Output Window */}
            {aiResponse && (
              <div className="p-3.5 bg-[#0C0C10] border border-gray-800 rounded-lg space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] border-b border-gray-800 pb-2">
                  <span className="text-[#D4AF37] font-bold">Customer Synthesis</span>
                  <span className="text-gray-400">{aiResponse.latencyMs}ms</span>
                </div>
                <div className="text-gray-200 leading-relaxed whitespace-pre-line">{aiResponse.answer}</div>

                {/* Source Transparency */}
                <div className="border-t border-gray-800 pt-2 text-[10px] text-gray-400 space-y-1">
                  <div className="font-bold text-gray-300">AUTHORITATIVE CUSTOMER SOURCES & TRANSPARENCY:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {aiResponse.sources?.map((s: any) => (
                      <li key={s.type}>{s.name}</li>
                    ))}
                  </ul>
                  <div className="text-gray-500 pt-1">
                    Privacy Scoping: {aiResponse.privacyLevel}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
