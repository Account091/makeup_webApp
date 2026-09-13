'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Sparkles,
  MessageSquare,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { 
  OrganizationVerificationRecord, 
  TrustScoreRecordV84, 
  MarketplaceReviewV84,
  TrustAlert,
  ProfileCompleteness
} from '../../lib/marketplace/marketplace-types';
import { getOrganizationVerification, getVerificationChecklist } from '../../lib/marketplace/verification-engine';
import { calculateTrustScore, calculateProfileCompleteness, getTrustAlerts } from '../../lib/marketplace/trust-score-engine';
import { getMarketplaceReviews, getRatingAggregation } from '../../lib/marketplace/review-engine';

export default function TrustVerificationScreen({ organizationId = 'org-jaipur-royal-glam', artistId = 'artist-101' }: { organizationId?: string; artistId?: string }) {
  const [verification, setVerification] = useState<OrganizationVerificationRecord | undefined>(undefined);
  const [checklist, setChecklist] = useState<any>(null);
  const [trustScore, setTrustScore] = useState<TrustScoreRecordV84 | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReviewV84[]>([]);
  const [ratingData, setRatingData] = useState<any>(null);
  const [alerts, setAlerts] = useState<TrustAlert[]>([]);

  useEffect(() => {
    const verif = getOrganizationVerification(organizationId);
    setVerification(verif);

    const check = getVerificationChecklist(organizationId);
    setChecklist(check);

    const score = calculateTrustScore({ organizationId, artistId });
    setTrustScore(score);

    const comp = calculateProfileCompleteness(organizationId);
    setCompleteness(comp);

    const revs = getMarketplaceReviews({ organizationId });
    setReviews(revs);

    const ratings = getRatingAggregation(artistId);
    setRatingData(ratings);

    const alrts = getTrustAlerts(organizationId);
    setAlerts(alrts);
  }, [organizationId, artistId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-medium text-sm mb-1">
              <ShieldCheck className="w-4 h-4" /> Marketplace Trust & Credibility
            </div>
            <h1 className="text-3xl font-bold text-white">Trust & Verification Portal</h1>
            <p className="text-slate-400 text-sm mt-1">
              Identity verification, verified customer reviews, transparent trust score (0-100), and compliance alerts for Org: <span className="font-mono text-rose-300">{organizationId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> {verification?.status || 'VERIFIED'}
            </span>
          </div>
        </div>

        {/* Top Trust Score Card */}
        {trustScore && (
          <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Badge: {trustScore.badge}
                  </span>
                  <span className="text-xs text-slate-400">Deterministic Signal Engine</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Marketplace Trust Score</h2>
                <p className="text-slate-400 text-xs max-w-xl">
                  Weighted 0–100 score computed from business verification (25%), booking completion rate (25%), customer rating (25%), response reliability (15%), and low cancellations (10%).
                </p>
              </div>

              <div className="flex items-center gap-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 shrink-0">
                <div className="text-center">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                    {trustScore.overallTrustScore}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">out of 100</div>
                </div>

                <div className="h-12 w-px bg-slate-800" />

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span>Average Rating:</span>
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {trustScore.factors.averageRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span>Completion Rate:</span>
                    <span className="font-bold text-emerald-400">{trustScore.factors.completionRatePercent}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span>Response Rate:</span>
                    <span className="font-bold text-blue-400">{trustScore.factors.responseRatePercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Checklist & Profile Completeness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verification Checklist Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-rose-400" /> Verification Checklist
              </h3>
              <span className="text-xs text-emerald-400 font-bold font-mono">100% COMPLETE</span>
            </div>

            {checklist && (
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg">
                  <span>Identity & Tax Registration (GSTIN/PAN)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg">
                  <span>Profile Information & Bio</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg">
                  <span>Service Catalog & Regional Pricing</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg">
                  <span>Portfolio Images Verification</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg">
                  <span>Verified Payment UPI VPA Setup</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          {/* Profile Completeness Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-400" /> Profile Completeness
              </h3>
              <span className="text-xs text-rose-400 font-bold font-mono">{completeness?.completenessPercent}%</span>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness?.completenessPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-400">
                Complete profile information ensures maximum discovery ranking and customer trust badge eligibility.
              </p>

              {completeness?.missingItems && completeness.missingItems.length === 0 ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All mandatory profile fields completed.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Verified Booking Reviews Section */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-400" />
              <h2 className="font-semibold text-white">Verified Booking Customer Reviews</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{reviews.length} verified reviews</span>
          </div>

          <div className="p-6 space-y-4">
            {reviews.map(r => (
              <div key={r.reviewId} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{r.customerId}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED BOOKING ({r.bookingId})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-300" /> {r.rating}.0
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{r.reviewText}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>Quality: {r.qualityRating || 5}/5</span>
                  <span>Punctuality: {r.punctualityRating || 5}/5</span>
                  <span>Communication: {r.communicationRating || 5}/5</span>
                  <span>Professionalism: {r.professionalismRating || 5}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
