"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketplaceReadinessScore } from "../../lib/marketplace/marketplace-types";
import { calculateMarketplaceReadinessScore, getAiOnboardingGuidance, updateOnboardingChecklist } from "../../lib/marketplace/tenant-onboarding-engine";

export default function OrganizationOnboardingScreen() {
  const [orgId, setOrgId] = useState("makeovers-by-prachi");
  const [readiness, setReadiness] = useState<MarketplaceReadinessScore | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("");

  useEffect(() => {
    const score = calculateMarketplaceReadinessScore(orgId);
    setReadiness(score);

    const guidance = getAiOnboardingGuidance(orgId);
    setAiAdvice(guidance.aiAdvice);
  }, [orgId]);

  const handleToggleStep = (fieldKey: string, currentValue: boolean) => {
    updateOnboardingChecklist(orgId, { [fieldKey]: !currentValue });
    const score = calculateMarketplaceReadinessScore(orgId);
    setReadiness(score);
    setAiAdvice(getAiOnboardingGuidance(orgId).aiAdvice);
  };

  if (!readiness) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Tenant Onboarding & Marketplace Readiness
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">Organization Onboarding & Readiness</h1>
          <p className="text-slate-400 text-sm mt-1">Complete mandatory setup requirements before accepting live public marketplace bookings.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-4 py-2"
          >
            <option value="makeovers-by-prachi">Makeovers by Prachi</option>
            <option value="jaipur-royal-glam">Jaipur Royal Glam</option>
          </select>
          <Link href="/organization/dashboard" className="text-xs text-amber-400 font-semibold hover:underline">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Readiness Progress Bar & Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                🚀 Marketplace Readiness Score
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Completed {readiness.completedStepsCount} of {readiness.totalStepsCount} mandatory onboarding milestones.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                readiness.status === "READY" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                {readiness.status.replace("_", " ")}
              </span>
              <span className="text-3xl font-black text-amber-400">{readiness.readinessScorePercent}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${readiness.readinessScorePercent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* AI Onboarding Assistant Card */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-xl">🤖</span>
            <div>
              <h3 className="text-lg font-bold text-white">AI Onboarding Assistant</h3>
              <p className="text-xs text-slate-400">Automated readiness guidance based on current checklist state.</p>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-indigo-500/20">
            "{aiAdvice}"
          </p>
        </div>

        {/* Interactive Onboarding Checklist Items */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">📋 Mandatory Onboarding Checklist</h2>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">1. Business Profile & Contact Info</h4>
                <p className="text-slate-400 mt-0.5">Business name, email, phone, & studio description.</p>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                ✓ COMPLETE
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">2. Service Catalog & Authoritative Pricing</h4>
                <p className="text-slate-400 mt-0.5">Canonical packages, duration, and deposit percentages.</p>
              </div>
              <button
                onClick={() => handleToggleStep("servicesComplete", true)}
                className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hover:bg-emerald-500/20"
              >
                ✓ COMPLETE
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">3. Artist Team Roster</h4>
                <p className="text-slate-400 mt-0.5">Add at least 1 verified makeup artist or hair stylist.</p>
              </div>
              <button
                onClick={() => handleToggleStep("artistsComplete", true)}
                className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hover:bg-emerald-500/20"
              >
                ✓ COMPLETE
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">4. Calendar & Booking Rules</h4>
                <p className="text-slate-400 mt-0.5">Configure booking lead times and buffer periods.</p>
              </div>
              <button
                onClick={() => handleToggleStep("calendarConfigured", true)}
                className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hover:bg-emerald-500/20"
              >
                ✓ COMPLETE
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">5. Payment Destination & Tenant UPI VPA</h4>
                <p className="text-slate-400 mt-0.5">Configure tenant VPA for Vision AI payment verification.</p>
              </div>
              <button
                onClick={() => handleToggleStep("paymentConfigured", true)}
                className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hover:bg-emerald-500/20"
              >
                ✓ COMPLETE
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">6. Business Verification Approval</h4>
                <p className="text-slate-400 mt-0.5">Submit identity and tax registration for verification.</p>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                ✓ VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
