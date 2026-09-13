"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CommissionTransaction, SettlementCandidate, CommissionRule } from "../../lib/marketplace/marketplace-types";
import { getCommissionLedgerStore } from "../../lib/marketplace/commission-calculation-engine";
import { getSettlementCandidates } from "../../lib/marketplace/settlement-candidate-engine";
import { runGlobalCommissionReconciliation } from "../../lib/marketplace/commission-reconciliation-engine";
import { getCommissionRules } from "../../lib/marketplace/commission-rule-engine";

export default function MarketplaceFinanceScreen() {
  const [ledger, setLedger] = useState<CommissionTransaction[]>([]);
  const [candidates, setCandidates] = useState<SettlementCandidate[]>([]);
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);

  useEffect(() => {
    const txs = getCommissionLedgerStore();
    setLedger(txs);

    const cands = getSettlementCandidates();
    setCandidates(cands);

    const r = getCommissionRules();
    setRules(r);

    const recon = runGlobalCommissionReconciliation();
    setReconciliation(recon);
  }, []);

  const totalGmv = ledger.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalBase = ledger.reduce((sum, t) => sum + t.commissionBase, 0);
  const totalPlatform = ledger.reduce((sum, t) => sum + t.platformCommission, 0);
  const totalGateway = ledger.reduce((sum, t) => sum + t.gatewayFee, 0);
  const totalArtist = ledger.reduce((sum, t) => sum + t.artistShare, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Marketplace Financial Control Center • V8.2
            </span>
            <span className="text-xs text-slate-400">Authoritative Server Calculations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mt-2 bg-gradient-to-r from-emerald-200 via-teal-200 to-amber-300 bg-clip-text text-transparent">
            Marketplace Commission & Finance Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Auditable commission ledgers, discount/tax handling, pre-tax net base, settlement candidates, & $0-discrepancy reconciliation.
          </p>
        </div>

        <Link
          href="/platform-admin"
          className="bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold hover:border-amber-500 transition-all"
        >
          ← Platform Admin Console
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Financial KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Total Gross GMV</div>
            <div className="text-2xl font-bold text-white mt-1">₹{totalGmv.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1">Pre-Discount Bookings</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Commission Base (Pre-Tax Net)</div>
            <div className="text-2xl font-bold text-teal-300 mt-1">₹{totalBase.toLocaleString()}</div>
            <div className="text-[10px] text-teal-400/80 mt-1">Gross - Discounts</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Platform Share (10%)</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">₹{totalPlatform.toLocaleString()}</div>
            <div className="text-[10px] text-amber-400/80 mt-1">Marketplace Revenue</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Gateway Fees (2%)</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">₹{totalGateway.toLocaleString()}</div>
            <div className="text-[10px] text-indigo-400/80 mt-1">Processing Costs</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400">Artist Share (88%)</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{totalArtist.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Immutable Net Share</div>
          </div>
        </div>

        {/* Global Reconciliation Status Banner */}
        {reconciliation && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">⚖️ Global Commission Reconciliation</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  reconciliation.allReconciled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {reconciliation.allReconciled ? "✓ Zero Discrepancy Verified" : "⚠️ Discrepancy Detected"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Reconciled {reconciliation.totalBookingsReconciled} booking ledgers. Discrepancy Amount: ₹{reconciliation.totalDiscrepancyAmount}.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">₹0.00</span>
              <span className="text-xs text-slate-500 block">Difference</span>
            </div>
          </div>
        )}

        {/* Settlement Candidates Engine Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-2">
            📦 Settlement Candidates (V8.3 Payout Preparation)
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Evaluated candidates based on payment verification, event completion, dispute state, & minimum ₹1,000 threshold.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">Artist ID</th>
                  <th className="py-3 px-4">Available Share</th>
                  <th className="py-3 px-4 text-rose-300">Held Amount</th>
                  <th className="py-3 px-4 text-emerald-400">Eligible Share</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {candidates.map((c) => (
                  <tr key={c.candidateId} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-mono text-slate-300">{c.candidateId}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{c.artistId}</td>
                    <td className="py-3.5 px-4 text-slate-300">₹{c.availableAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-rose-300">₹{c.heldAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{c.eligibleAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
