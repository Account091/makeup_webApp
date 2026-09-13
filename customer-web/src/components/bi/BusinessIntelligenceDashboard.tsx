"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  AlertTriangle,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  PieChart,
  ShoppingBag,
  Award,
  RefreshCw,
  Search,
} from "lucide-react";
import { calculateExecutiveBiData } from "../../lib/bi/kpi-engine";
import { generateBusinessAlerts } from "../../lib/bi/bi-alert-engine";
import { validateAnalyticsReconciliation } from "../../lib/bi/bi-reconciliation";
import { ExecutiveBiDataPackage } from "../../lib/bi/bi-types";

export default function BusinessIntelligenceDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("THIS_MONTH");
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");
  const [biData, setBiData] = useState<ExecutiveBiDataPackage | null>(null);

  // AI Analyst state
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);

  useEffect(() => {
    refreshBiData();
  }, [selectedCity, selectedDateRange]);

  const refreshBiData = () => {
    const data = calculateExecutiveBiData({ city: selectedCity, dateRange: selectedDateRange });
    data.alerts = generateBusinessAlerts(data);
    setBiData(data);
  };

  const handleRunAiAnalyst = async (customPrompt?: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/business-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: customPrompt || aiQuery || "Provide executive synthesis of current performance and key risks.",
          filters: { city: selectedCity, dateRange: selectedDateRange },
        }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error("AI Analyst Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const exportCsvReport = () => {
    if (!biData) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,Value,Status,AsOf"]
        .concat(biData.topKpis.map((k) => `"${k.label}","${k.formattedValue}","${k.status}","${k.dataAsOf}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Makeovers_BI_Report_${selectedCity}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!biData) return null;

  return (
    <div className="min-h-screen bg-[#0C0C10] text-gray-100 p-4 md:p-8 font-sans">
      {/* Header & Controls */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Business Intelligence & AI Analyst
            </h1>
            <span className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILIATION: {biData.reconciliation.status}
            </span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            V6.0 Executive BI Platform • Deterministic KPI Aggregations • Data As Of:{" "}
            {new Date(biData.dataAsOf).toLocaleTimeString()}
          </p>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* City Filter */}
          <div className="flex items-center gap-1.5 bg-[#161620] border border-gray-800 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#161620]">All Locations</option>
              <option value="Jodhpur" className="bg-[#161620]">Jodhpur Studio</option>
              <option value="Jaipur" className="bg-[#161620]">Jaipur Studio</option>
              <option value="Udaipur" className="bg-[#161620]">Udaipur Studio</option>
              <option value="Destination" className="bg-[#161620]">Destination Weddings</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 bg-[#161620] border border-gray-800 rounded-lg px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer"
            >
              <option value="THIS_MONTH" className="bg-[#161620]">This Month</option>
              <option value="LAST_30_DAYS" className="bg-[#161620]">Last 30 Days</option>
              <option value="THIS_QUARTER" className="bg-[#161620]">This Quarter</option>
              <option value="THIS_YEAR" className="bg-[#161620]">This Year</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCsvReport}
            className="flex items-center gap-1.5 bg-[#161620] hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> Export CSV
          </button>
        </div>
      </header>

      {/* Top Level KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {biData.topKpis.map((kpi) => (
          <div
            key={kpi.key}
            className="bg-[#161620] border border-gray-800/80 rounded-xl p-4 shadow-lg hover:border-[#D4AF37]/40 transition"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{kpi.label}</span>
              <span className="text-[#22C55E] font-medium">{kpi.changePercent > 0 ? `+${kpi.changePercent}%` : `${kpi.changePercent}%`}</span>
            </div>
            <div className="text-2xl font-extrabold text-white mt-2 mb-1">{kpi.formattedValue}</div>
            <div className="text-[11px] text-gray-500">{kpi.comparisonPeriod}</div>
          </div>
        ))}
      </section>

      {/* Domain Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-800 mb-6 text-xs font-medium scrollbar-none">
        {[
          { id: "OVERVIEW", label: "Overview & Alerts", icon: PieChart },
          { id: "REVENUE", label: "Revenue Breakdown", icon: TrendingUp },
          { id: "FUNNEL", label: "Booking Funnel", icon: BarChart3 },
          { id: "SERVICES", label: "Service Performance", icon: Sparkles },
          { id: "CUSTOMERS", label: "Customer 360 & RFM", icon: Users },
          { id: "ATTRIBUTION", label: "Marketing ROI", icon: Sparkles },
          { id: "CAPACITY", label: "Calendar & Capacity", icon: Calendar },
          { id: "ARTISTS", label: "Artist Analytics", icon: Award },
          { id: "ECOMMERCE", label: "Ecommerce & Stock", icon: ShoppingBag },
          { id: "FORECAST", label: "Demand Forecast", icon: TrendingUp },
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

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Domain Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "OVERVIEW" && (
            <div className="space-[#161620] space-y-4">
              {/* Real-time Alerts */}
              <div className="bg-[#161620] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Deterministic Business Risk Alerts ({biData.alerts.length})
                </h3>
                <div className="space-y-3">
                  {biData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-lg bg-[#0C0C10] border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-white">{alert.message}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">💡 Action: {alert.recommendedAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service & Product Revenue Comparison */}
              <div className="bg-[#161620] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Gross Revenue Composition</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="text-gray-400">Services Revenue</span>
                    <div className="text-lg font-bold text-[#22C55E] mt-1">₹{biData.revenueMetrics.netServiceRevenue.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="text-gray-400">Cosmetics Revenue</span>
                    <div className="text-lg font-bold text-[#D4AF37] mt-1">₹{biData.revenueMetrics.productRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "REVENUE" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Deterministic Revenue Ledger Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Gross Service Rev</span>
                  <div className="text-sm font-bold text-white mt-1">₹{biData.revenueMetrics.grossServiceRevenue.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Travel Revenue</span>
                  <div className="text-sm font-bold text-white mt-1">₹{biData.revenueMetrics.travelRevenue.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Operating Expenses</span>
                  <div className="text-sm font-bold text-red-400 mt-1">₹{biData.revenueMetrics.expensesAmount.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Gateway Fees</span>
                  <div className="text-sm font-bold text-amber-400 mt-1">₹{biData.revenueMetrics.gatewayFeesAmount.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 col-span-2">
                  <span className="text-gray-400">Net Operating Result</span>
                  <div className="text-lg font-extrabold text-[#22C55E] mt-1">₹{biData.revenueMetrics.netOperatingResult.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "FUNNEL" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Booking Conversion & Drop-off Funnel</h3>
              {biData.bookingFunnel.map((stage) => (
                <div key={stage.stageId} className="flex items-center justify-between p-2.5 bg-[#0C0C10] rounded-lg border border-gray-800 text-xs">
                  <span className="font-semibold text-white">{stage.stageName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300 font-bold">{stage.count} Users</span>
                    <span className="text-[#22C55E]">{stage.conversionRateFromPrevious}% Conv</span>
                    <span className="text-red-400">-{stage.dropoffRatePercent}% Drop</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "SERVICES" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Service Performance & Rating Scorecard</h3>
              {biData.servicePerformance.map((srv) => (
                <div key={srv.serviceId} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{srv.title}</h4>
                    <p className="text-gray-400">{srv.bookingsCount} Bookings • Rating ⭐ {srv.averageRating}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[#D4AF37]">₹{srv.totalRevenue.toLocaleString()}</div>
                    <div className="text-gray-400">Avg Quote ₹{srv.averageBookingValue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "CUSTOMERS" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Customer 360 RFM Segments</h3>
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Total Customers</span>
                  <div className="text-lg font-bold text-white mt-1">{biData.customerMetrics.totalCustomers}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Unified LTV</span>
                  <div className="text-lg font-bold text-[#D4AF37] mt-1">₹{biData.customerMetrics.averageUnifiedLtv.toLocaleString()}</div>
                </div>
              </div>

              {biData.customerMetrics.rfmSegments.map((rfm) => (
                <div key={rfm.segmentName} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>{rfm.segmentName} ({rfm.customerCount} Clients)</span>
                    <span className="text-[#22C55E]">Avg LTV ₹{rfm.averageLtv.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">💡 Recommended Action: {rfm.recommendedAction}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "ATTRIBUTION" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Marketing Channel Attribution & ROI</h3>
              {biData.marketingAttribution.map((attr) => (
                <div key={attr.identifier} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[10px] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                      {attr.channelOrSource}
                    </span>
                    <h4 className="font-bold text-white mt-1">{attr.identifier}</h4>
                    <p className="text-gray-400">{attr.leadsGenerated} Leads • {attr.bookingsConverted} Bookings</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#22C55E]">₹{attr.attributedRevenue.toLocaleString()}</div>
                    <div className="text-gray-400">{attr.roiMultiplier}x ROI</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "CAPACITY" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Calendar Capacity Utilization</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Total Hours</span>
                  <div className="text-sm font-bold text-white mt-1">{biData.capacityMetrics.totalAvailableHours} hrs</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Booked Hours</span>
                  <div className="text-sm font-bold text-[#22C55E] mt-1">{biData.capacityMetrics.bookedHours} hrs</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Utilization Rate</span>
                  <div className="text-sm font-bold text-[#D4AF37] mt-1">{biData.capacityMetrics.capacityUtilizationPercent}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ARTISTS" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Multi-Artist Performance Scorecard</h3>
              {biData.artistMetrics.map((art) => (
                <div key={art.artistId} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>{art.artistName}</span>
                    <span className="text-[#22C55E]">Revenue: ₹{art.totalRevenueGenerated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Bookings: {art.bookingsHandled} • Rating ⭐ {art.customerRating}</span>
                    <span>Utilization: {art.utilizationPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "ECOMMERCE" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Ecommerce & Cosmetics Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Units Sold</span>
                  <div className="text-sm font-bold text-white mt-1">{biData.ecommerceMetrics.unitsSold}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Stock Turnover</span>
                  <div className="text-sm font-bold text-[#D4AF37] mt-1">{biData.ecommerceMetrics.stockTurnoverRate}x</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "FORECAST" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Deterministic Demand & Revenue Forecast</h3>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold px-2 py-0.5 rounded text-[10px]">
                  {biData.forecast.forecastType}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Projected Bookings</span>
                  <div className="text-lg font-bold text-white mt-1">{biData.forecast.projectedBookings}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Projected Revenue</span>
                  <div className="text-lg font-bold text-[#22C55E] mt-1">₹{biData.forecast.projectedRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: AI Business Analyst Interactive Console */}
        <div className="space-y-4">
          <div className="bg-[#161620] border border-[#D4AF37]/40 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> AI Business Analyst
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">Hugging Face LLM</span>
            </div>

            <p className="text-xs text-gray-300">
              Interprets deterministic KPIs, identifies root causes, and recommends business strategy.
            </p>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                "Why is revenue growing?",
                "What are key capacity risks?",
                "Which campaign performs best?",
                "Follow-up lead recommendations",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setAiQuery(chip);
                    handleRunAiAnalyst(chip);
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
                placeholder="Ask the AI Analyst a question..."
                className="flex-1 bg-[#0C0C10] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={() => handleRunAiAnalyst()}
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
                  <span className="text-[#D4AF37] font-bold">Executive Synthesis</span>
                  <span className="text-gray-400">{aiResponse.latencyMs}ms</span>
                </div>
                <div className="text-gray-200 leading-relaxed whitespace-pre-line">{aiResponse.answer}</div>

                {/* Source Transparency */}
                <div className="border-t border-gray-800 pt-2 text-[10px] text-gray-400 space-y-1">
                  <div className="font-bold text-gray-300">AUTHORITATIVE SOURCES & TRANSPARENCY:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {aiResponse.sources?.map((s: any) => (
                      <li key={s.type}>{s.name}</li>
                    ))}
                  </ul>
                  <div className="text-gray-500 pt-1">
                    Actuals: {aiResponse.dataTypes?.actuals} • Forecast: {aiResponse.dataTypes?.forecast}
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
