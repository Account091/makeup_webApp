'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Bot
} from 'lucide-react';
import { 
  OrganizationVerificationRecord, 
  MarketplaceReviewV84, 
  TrustAlert 
} from '../../lib/marketplace/marketplace-types';
import { getOrganizationVerification, approveOrganizationVerification, rejectOrganizationVerification } from '../../lib/marketplace/verification-engine';
import { getMarketplaceReviews, getReviewFlags } from '../../lib/marketplace/review-engine';
import { getTrustAlerts, resolveTrustAlert } from '../../lib/marketplace/trust-score-engine';
import { analyzeReviewThemes, draftReviewResponse } from '../../lib/ai/review-ai-assistant';

export default function PlatformTrustConsoleScreen() {
  const [verifications, setVerifications] = useState<OrganizationVerificationRecord[]>([]);
  const [reviews, setReviews] = useState<MarketplaceReviewV84[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<TrustAlert[]>([]);
  const [aiDrafts, setAiDrafts] = useState<{ [key: string]: string }>({});

  const refreshData = () => {
    const v = getOrganizationVerification('org-jaipur-royal-glam');
    setVerifications(v ? [v] : []);

    const revs = getMarketplaceReviews();
    setReviews(revs);

    const flgs = getReviewFlags();
    setFlags(flgs);

    const alrts = getTrustAlerts();
    setAlerts(alrts);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApproveVerif = (orgId: string) => {
    approveOrganizationVerification({ organizationId: orgId, reviewedByUid: 'admin-trust-super' });
    refreshData();
  };

  const handleRejectVerif = (orgId: string) => {
    rejectOrganizationVerification({ organizationId: orgId, reviewedByUid: 'admin-trust-super', reason: 'Missing tax document' });
    refreshData();
  };

  const handleResolveAlert = (alertId: string) => {
    resolveTrustAlert(alertId);
    refreshData();
  };

  const handleAiDraft = (review: MarketplaceReviewV84) => {
    const draft = draftReviewResponse(review);
    setAiDrafts({ ...aiDrafts, [review.reviewId]: draft.draftText });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Platform Admin • V8.4 Trust & Moderation Console
            </span>
            <span className="text-xs text-slate-400">Verified Evidence & Human Moderation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mt-2 bg-gradient-to-r from-emerald-200 via-rose-200 to-amber-300 bg-clip-text text-transparent">
            Marketplace Trust & Safety Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Verification review queues, review moderation, abuse flag handling, trust score audits, & AI Review Assistant integration.
          </p>
        </div>

        <Link
          href="/marketplace-admin/settlements"
          className="bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold hover:border-amber-500 transition-all"
        >
          ← Settlements Admin
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Verification Queue Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-rose-400" /> Organization Verification Queue
              </h2>
              <p className="text-xs text-slate-400 mt-1">Human admin authorization required for verification badges.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Org ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {verifications.map(v => (
                  <tr key={v.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-bold text-white">{v.organizationId}</td>
                    <td className="py-3.5 px-4 text-slate-300">{v.verificationType}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(v.submittedAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {v.status !== 'VERIFIED' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApproveVerif(v.organizationId)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-sans font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectVerif(v.organizationId)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-sans font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-sans">Verified by {v.reviewedByUid}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Review Assistant & Moderation Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" /> AI Review Assistant & Moderation
              </h2>
              <p className="text-xs text-slate-400 mt-1">Theme extraction, sentiment analysis, and draft response suggestions with human safeguards.</p>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map(r => {
              const themes = analyzeReviewThemes(r);
              return (
                <div key={r.reviewId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{r.reviewId}</span>
                      <span className="text-slate-400">({r.organizationId})</span>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px]">
                        ★ {r.rating}.0
                      </span>
                    </div>

                    <button
                      onClick={() => handleAiDraft(r)}
                      className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate AI Draft
                    </button>
                  </div>

                  <p className="text-slate-300 text-xs">{r.reviewText}</p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>AI Themes:</span>
                    {themes.themes.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
                        #{t}
                      </span>
                    ))}
                    <span className="ml-auto text-emerald-400 font-bold">Action: {themes.suggestedAction}</span>
                  </div>

                  {aiDrafts[r.reviewId] && (
                    <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-lg space-y-1">
                      <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Draft Response (For Human Approval)
                      </div>
                      <p className="text-xs text-slate-300 italic">"{aiDrafts[r.reviewId]}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
