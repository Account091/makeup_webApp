"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Lock,
  AlertCircle,
  Sparkles,
  Download,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  Receipt,
  FileText,
  RotateCcw,
  Search,
  RefreshCw,
} from "lucide-react";
import { calculateFinancialIntelligenceData } from "../../lib/financial/financial-kpi-engine";
import { generateFinancialAlerts } from "../../lib/financial/financial-alert-engine";
import { validateMultiWayReconciliation } from "../../lib/financial/financial-reconciliation-engine";
import { ExecutiveFinancialDataPackage } from "../../lib/financial/financial-types";

export default function FinancialIntelligenceDashboard() {
  const [finData, setFinData] = useState<ExecutiveFinancialDataPackage | null>(null);
  const [activeTab, setActiveTab] = useState<string>("PL");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-09");

  // AI Financial Analyst state
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);

  useEffect(() => {
    refreshFinancialData();
  }, [selectedPeriod]);

  const refreshFinancialData = () => {
    const data = calculateFinancialIntelligenceData();
    data.alerts = generateFinancialAlerts(data);
    setFinData(data);
  };

  const handleRunFinancialAi = async (customPrompt?: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/financial-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: customPrompt || aiQuery || "Summarize current financial result, cash collection, and overdue risks.",
        }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error("Financial AI Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const exportFinancialCsv = () => {
    if (!finData) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,Value,Classification,Source"]
        .concat(finData.topCards.map((k) => `"${k.label}","${k.formattedValue}","${k.classification}","${k.source}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Makeovers_Financial_BI_${selectedPeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!finData) return null;

  return (
    <div className="min-h-screen bg-[#0C0C10] text-gray-100 p-4 md:p-8 font-sans">
      {/* Header & Control Panel */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Advanced Financial Intelligence Center
            </h1>
            <span className="bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILIATION: {finData.reconciliation.overallStatus}
            </span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            V6.1 Financial Intelligence • Immutable Payment Ledger • Period {finData.periodStatus.currentPeriod} ({finData.periodStatus.status})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#161620] border border-gray-800 rounded-lg px-3 py-1.5 text-xs">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer"
            >
              <option value="2026-09" className="bg-[#161620]">Period 2026-09 (OPEN)</option>
              <option value="2026-08" className="bg-[#161620]">Period 2026-08 (LOCKED 🔒)</option>
            </select>
          </div>

          <button
            onClick={exportFinancialCsv}
            className="flex items-center gap-1.5 bg-[#161620] hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> Export Financial CSV
          </button>
        </div>
      </header>

      {/* Top Financial Command Center Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
        {finData.topCards.map((card) => (
          <div
            key={card.key}
            className="bg-[#161620] border border-gray-800/80 rounded-xl p-4 shadow-lg hover:border-[#D4AF37]/40 transition"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{card.label}</span>
              <span className="bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[9px] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                {card.classification}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-2 mb-1">{card.formattedValue}</div>
            <div className="text-[11px] text-gray-400">{card.comparisonPeriod}</div>
          </div>
        ))}
      </section>

      {/* Domain Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-800 mb-6 text-xs font-medium scrollbar-none">
        {[
          { id: "PL", label: "P&L & Cash Collection", icon: TrendingUp },
          { id: "UPI", label: "UPI Screening Funnel", icon: CreditCard },
          { id: "OUTSTANDING", label: "Outstanding Balances", icon: AlertCircle },
          { id: "PROFITABILITY", label: "Booking & Service Profitability", icon: PieChart },
          { id: "EXPENSES", label: "Expense Intelligence", icon: Receipt },
          { id: "TAX", label: "Tax & Invoice Snapshots", icon: FileText },
          { id: "REFUNDS", label: "Refund Intelligence", icon: RotateCcw },
          { id: "RECONCILIATION", label: "Multi-Way Reconciliation", icon: ShieldCheck },
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "PL" && (
            <div className="space-y-4">
              {/* Active Financial Risk Alerts */}
              <div className="bg-[#161620] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> Financial Alerts ({finData.alerts.length})
                </h3>
                <div className="space-y-2.5">
                  {finData.alerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-[#0C0C10] border border-red-500/20 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <span className="text-red-400 font-bold mr-2">[{alert.severity}] {alert.title}</span>
                        <p className="text-gray-300 mt-0.5">{alert.message}</p>
                      </div>
                      <span className="text-gray-400 text-[10px] whitespace-nowrap">💡 {alert.recommendedAction}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Collection Breakdown */}
              <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 text-xs">
                <h3 className="text-sm font-bold text-white mb-3">Cash Collection & Contract Value Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="text-gray-400">Total Contract Value</span>
                    <div className="text-sm font-bold text-white mt-1">₹{finData.cashCollection.contractValue.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="text-gray-400">Cash Collected</span>
                    <div className="text-sm font-bold text-[#22C55E] mt-1">₹{finData.cashCollection.collectedAmount.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="text-gray-400">Pending Balance</span>
                    <div className="text-sm font-bold text-amber-400 mt-1">₹{finData.cashCollection.pendingAmount.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="text-gray-400">Overdue Balance</span>
                    <div className="text-sm font-bold text-red-400 mt-1">₹{finData.cashCollection.overdueAmount.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "UPI" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Manual UPI Screening & Verification Funnel</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Proof Submissions</span>
                  <div className="text-lg font-bold text-white mt-1">{finData.upiVerification.totalSubmissions}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">AI PASS</span>
                  <div className="text-lg font-bold text-[#22C55E] mt-1">{finData.upiVerification.aiPassCount}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Admin Verified</span>
                  <div className="text-lg font-bold text-[#D4AF37] mt-1">{finData.upiVerification.adminVerifiedCount}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {finData.paymentFunnel.map((stage) => (
                  <div key={stage.stageId} className="flex justify-between items-center p-2.5 bg-[#0C0C10] rounded-lg border border-gray-800">
                    <span className="font-semibold text-white">{stage.stageName}</span>
                    <div className="flex gap-3">
                      <span className="text-[#22C55E]">{stage.conversionRateFromPrevious}% Conv</span>
                      <span className="text-red-400">-{stage.failureRatePercent}% Drop</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "OUTSTANDING" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Outstanding Balances & Risk Scorecard</h3>
              {finData.outstandingBalances.map((record) => (
                <div key={record.bookingId} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{record.customerName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        record.riskLevel === "HIGH" ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-green-500/10 text-green-400 border border-green-500/30"
                      }`}>
                        RISK: {record.riskLevel}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-1">
                      Event: {record.eventDate} • Paid ₹{record.paidAmount.toLocaleString()} of ₹{record.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-red-400">₹{record.remainingBalance.toLocaleString()} Due</div>
                    <div className="text-gray-500 text-[10px]">Due: {record.dueDate} ({record.daysOutstanding} days)</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "PROFITABILITY" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Booking & Service Contribution Margin Analysis</h3>
              {finData.bookingProfitability.map((item) => (
                <div key={item.bookingId} className="p-3.5 bg-[#0C0C10] rounded-lg border border-gray-800 space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.title}</span>
                    <span className="text-[#22C55E]">Margin: {item.marginPercent}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px] text-gray-400">
                    <div>Gross: ₹{item.grossRevenue.toLocaleString()}</div>
                    <div>Artist: -₹{item.artistPayout.toLocaleString()}</div>
                    <div>Travel: -₹{item.travelExpense.toLocaleString()}</div>
                    <div className="text-[#D4AF37] font-bold">Contribution: ₹{item.netContribution.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "EXPENSES" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Approved Operating Expenses Breakdown</h3>
              {finData.expenseBreakdown.map((exp) => (
                <div key={exp.category} className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{exp.category}</h4>
                    <p className="text-gray-400 text-[11px]">{exp.percentageOfTotal}% of total expenses</p>
                  </div>
                  <div className="text-right font-extrabold text-red-400">₹{exp.totalAmount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "TAX" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Dynamic GST Tax Rule Snapshots & Invoices</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Taxable Value</span>
                  <div className="text-sm font-bold text-white mt-1">₹{finData.taxSummary.taxableValue.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Tax Collected (CGST 9% + SGST 9%)</span>
                  <div className="text-sm font-bold text-[#D4AF37] mt-1">₹{finData.taxSummary.taxCollected.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "REFUNDS" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Append-Only Refund & Reversal Intelligence</h3>
              <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">Refund Requests: {finData.refundMetrics.totalRefundRequests}</h4>
                  <p className="text-gray-400 text-[11px]">Append-only reversal ledger architecture enabled</p>
                </div>
                <div className="font-extrabold text-green-400">Refund Rate: {finData.refundMetrics.refundRatePercent}%</div>
              </div>
            </div>
          )}

          {activeTab === "RECONCILIATION" && (
            <div className="bg-[#161620] border border-gray-800 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Multi-Way Financial Reconciliation Engine</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Bookings vs Invoices Difference</span>
                  <div className="text-sm font-bold text-[#22C55E] mt-1">₹{finData.reconciliation.differenceAmount}</div>
                </div>
                <div className="p-3 bg-[#0C0C10] rounded-lg border border-gray-800">
                  <span className="text-gray-400">Google Sheets Mirror Sync</span>
                  <div className="text-sm font-bold text-[#22C55E] mt-1">{finData.reconciliation.sheetsSyncStatus}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: AI Financial Analyst Console */}
        <div className="space-y-4">
          <div className="bg-[#161620] border border-[#D4AF37]/40 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> AI Financial Analyst
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">Hugging Face LLM</span>
            </div>

            <p className="text-xs text-gray-300">
              Interprets authoritative financial datasets, identifies cash collection trends, and alerts on overdue risks.
            </p>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                "How much cash was collected?",
                "Why is outstanding balance high?",
                "Which package has best margin?",
                "Are there reconciliation alerts?",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setAiQuery(chip);
                    handleRunFinancialAi(chip);
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
                placeholder="Ask the Financial AI Analyst..."
                className="flex-1 bg-[#0C0C10] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={() => handleRunFinancialAi()}
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
                  <span className="text-[#D4AF37] font-bold">Financial Synthesis</span>
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
                    Reconciliation: {aiResponse.reconciliationStatus} • Sheets Sync: {aiResponse.sheetsSyncStatus}
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
