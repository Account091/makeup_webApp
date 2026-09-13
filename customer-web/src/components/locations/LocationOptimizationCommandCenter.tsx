"use me";
"use client";

import React, { useState, useEffect } from "react";
import { LocationOptimizationData } from "../../lib/locations/location-opt-types";
import { calculateLocationOptimizationData } from "../../lib/locations/location-opt-kpi-engine";

export default function LocationOptimizationCommandCenter() {
  const [data, setData] = useState<LocationOptimizationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Load deterministic location optimization data
    const initialData = calculateLocationOptimizationData();
    setData(initialData);
  }, []);

  const handleRunAiAnalysis = async (customQuery?: string) => {
    setLoadingAi(true);
    const queryToUse = customQuery || aiQuery || "Executive summary of location performance";
    try {
      const res = await fetch("/api/ai/location-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToUse, locationId: selectedLocation }),
      });
      const result = await res.json();
      if (result.success) {
        setAiResponse(result.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="animate-pulse text-amber-400 font-semibold">Loading Location Intelligence Engine...</div>
      </div>
    );
  }

  const filteredScores = selectedLocation === "all"
    ? data.scores
    : data.scores.filter(s => s.locationId === selectedLocation);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              V7.4 Intelligence Suite
            </span>
            <span className="text-xs text-slate-400">Scoring Engine v1.0 • Live Data</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 bg-clip-text text-transparent">
            Location Intelligence & Optimization
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Deterministic location scoring, profitability matrices, travel efficiency ratios, and expansion signal analysis.
          </p>
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">Hub Filter:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Locations (Aggregate)</option>
            <option value="jodhpur">Jodhpur Flagship</option>
            <option value="jaipur">Jaipur Market</option>
            <option value="udaipur">Udaipur Market</option>
            <option value="destination">Destination Weddings</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Avg Location Score</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{data.summary.averageLocationScore} <span className="text-xs text-slate-500">/ 100</span></div>
            <div className="text-[10px] text-emerald-400 mt-1">Version 1.0 Audit</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Top Performing Hub</div>
            <div className="text-sm font-bold text-rose-300 mt-1 truncate">{data.summary.topPerformingCity}</div>
            <div className="text-[10px] text-slate-400 mt-1">Score: 88 • Excellent</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Highest Net Margin</div>
            <div className="text-sm font-bold text-emerald-300 mt-1 truncate">{data.summary.highestMarginCity}</div>
            <div className="text-[10px] text-slate-400 mt-1">68.5% Net Margin</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Highest YoY Growth</div>
            <div className="text-sm font-bold text-indigo-300 mt-1 truncate">{data.summary.highestGrowthCity}</div>
            <div className="text-[10px] text-slate-400 mt-1">+32.0% Revenue YoY</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Active Opportunities</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{data.summary.activeOpportunitiesCount}</div>
            <div className="text-[10px] text-cyan-400/80 mt-1">High Impact Insights</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Active Risk Alerts</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{data.summary.activeRisksCount}</div>
            <div className="text-[10px] text-rose-400/80 mt-1">Capacity & Travel Costs</div>
          </div>
        </div>

        {/* Location Performance Scorecards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🏆 Location Scorecards (0 – 100)
              </h2>
              <p className="text-xs text-slate-400">
                Formula: 0.20 Demand + 0.20 Profitability + 0.15 Growth + 0.15 Capacity + 0.10 Conversion + 0.10 NPS + 0.10 Marketing ROI
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg">
              Weights: v1.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredScores.map((sc) => (
              <div key={sc.locationId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100">{sc.locationName}</h3>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sc.classification === "EXCELLENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      sc.classification === "HEALTHY" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {sc.classification}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-400">{sc.overallScore}</span>
                    <span className="text-xs text-slate-500 block">/100</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Demand Score:</span>
                    <span className="font-semibold text-slate-200">{sc.factors.demandScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Profitability Score:</span>
                    <span className="font-semibold text-emerald-400">{sc.factors.profitabilityScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Growth Score:</span>
                    <span className="font-semibold text-indigo-400">{sc.factors.growthScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Capacity Score:</span>
                    <span className="font-semibold text-amber-400">{sc.factors.capacityScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Conversion Score:</span>
                    <span className="font-semibold text-slate-200">{sc.factors.conversionScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Efficiency Ratios & Service Mix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Travel Efficiency Ratios */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              🚗 Travel Efficiency & Cost Ratios
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Travel Ratio = Total Travel Expense / Total Hub Revenue. Target &lt; 15%.
            </p>

            <div className="space-y-4">
              {data.travelEfficiency.map((tr) => (
                <div key={tr.locationId} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">{tr.locationName}</h4>
                    <div className="text-xs text-slate-400 mt-1 flex gap-3">
                      <span>{tr.travelBookingsCount} Travel Bookings</span>
                      <span>•</span>
                      <span>{tr.travelHoursTotal} Travel Hrs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-400">
                      {tr.travelRatioPercent}% <span className="text-xs text-slate-400 font-normal">ratio</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tr.efficiencyStatus === "HIGHLY_EFFICIENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      tr.efficiencyStatus === "ACCEPTABLE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {tr.efficiencyStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Mix & Channel Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              📊 Regional Service Mix
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Service category distribution and top-selling signature package by location.
            </p>

            <div className="space-y-4">
              {data.serviceMix.map((sm) => (
                <div key={sm.locationId} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-200 text-sm">{sm.locationName}</span>
                    <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Top: {sm.topServiceCategory}
                    </span>
                  </div>

                  {/* Progress bar mix */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${sm.bridalPercent}%` }} className="bg-rose-500 h-full" title={`Bridal: ${sm.bridalPercent}%`} />
                    <div style={{ width: `${sm.engagementPercent}%` }} className="bg-amber-500 h-full" title={`Engagement: ${sm.engagementPercent}%`} />
                    <div style={{ width: `${sm.partyPercent}%` }} className="bg-indigo-500 h-full" title={`Party: ${sm.partyPercent}%`} />
                    <div style={{ width: `${sm.otherPercent}%` }} className="bg-slate-600 h-full" title={`Other: ${sm.otherPercent}%`} />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                    <span className="text-rose-300">Bridal {sm.bridalPercent}%</span>
                    <span className="text-amber-300">Engagement {sm.engagementPercent}%</span>
                    <span className="text-indigo-300">Party {sm.partyPercent}%</span>
                    <span className="text-slate-400">Other {sm.otherPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cross-Location Benchmarks Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            ⚡ Cross-Location Operational Benchmarks
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Comparative performance matrix across core financial, operational, and customer metrics.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  <th className="py-3 px-4 font-semibold">Operational Metric</th>
                  <th className="py-3 px-4 font-semibold text-rose-300">Jodhpur Flagship</th>
                  <th className="py-3 px-4 font-semibold text-indigo-300">Jaipur Market</th>
                  <th className="py-3 px-4 font-semibold text-amber-300">Udaipur Market</th>
                  <th className="py-3 px-4 font-semibold text-emerald-300">Destination Weddings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.benchmarks.map((bm, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-200">{bm.metricLabel}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{bm.jodhpurValue}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{bm.jaipurValue}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{bm.udaipurValue}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">{bm.destinationValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expansion Signals & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Opportunities & Risks */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                💡 High-Impact Opportunities
              </h2>
              <div className="space-y-3 mt-4">
                {data.opportunities.map((opp) => (
                  <div key={opp.opportunityId} className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-emerald-300 text-sm">{opp.title}</h4>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Impact: {opp.impactScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{opp.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-medium">
                      Action: {opp.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                ⚠️ Operational Risk Alerts
              </h2>
              <div className="space-y-3 mt-4">
                {data.risks.map((rk) => (
                  <div key={rk.riskId} className="bg-slate-950/80 border border-rose-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-rose-300 text-sm">{rk.title}</h4>
                      <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                        {rk.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{rk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expansion Candidate Signals */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              🚀 Expansion Candidate Signals
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Organic outstation inquiry signals indicating emerging market expansion candidates.
            </p>

            <div className="space-y-4">
              {data.expansionSignals.map((exp, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-all">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-amber-300 text-lg">{exp.candidateCity}</h3>
                    <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                      Interest: {exp.destinationInterestLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 py-2 bg-slate-900/60 rounded-lg text-center text-xs">
                    <div>
                      <div className="text-slate-400">Inquiries</div>
                      <div className="font-bold text-white text-base mt-0.5">{exp.inquiriesCount}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Qualified</div>
                      <div className="font-bold text-emerald-400 text-base mt-0.5">{exp.qualifiedLeadsCount}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Bookings</div>
                      <div className="font-bold text-amber-400 text-base mt-0.5">{exp.confirmedBookingsCount}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{exp.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Location Analyst Interactive Suite */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-xl">🤖</span>
              <div>
                <h2 className="text-xl font-bold text-white">AI Location Analyst</h2>
                <p className="text-xs text-slate-400">Ask strategic questions regarding regional performance, expansion signals, or risk mitigation.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              allowMutations: false (Read-Only)
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g., Should we prioritize Jaipur artist team expansion or launch an Ahmedabad pop-up?"
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleRunAiAnalysis()}
              disabled={loadingAi}
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loadingAi ? "Analyzing..." : "Generate AI Insights"}
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            <button
              onClick={() => handleRunAiAnalysis("Executive summary of regional growth and profitability")}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            >
              Executive Summary
            </button>
            <button
              onClick={() => handleRunAiAnalysis("Analyze Jaipur capacity headroom and weekend demand")}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            >
              Jaipur Capacity Analysis
            </button>
            <button
              onClick={() => handleRunAiAnalysis("Evaluate Udaipur referral share and travel cost ratio")}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            >
              Udaipur Travel & Referral
            </button>
          </div>

          {/* AI Output Card */}
          {aiResponse && (
            <div className="mt-6 bg-slate-950/90 border border-indigo-500/30 rounded-xl p-5 space-y-4">
              <div className="text-sm font-semibold text-indigo-300 border-b border-slate-800 pb-2">
                Executive Analysis Response:
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{aiResponse.executiveSummary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Key Findings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    {aiResponse.keyInsights.map((insight: string, idx: number) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Strategic Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    {aiResponse.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
