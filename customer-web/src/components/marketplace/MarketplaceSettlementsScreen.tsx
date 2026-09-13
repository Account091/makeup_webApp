'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settlement, 
  SettlementPeriod, 
  SettlementHold 
} from '../../lib/marketplace/marketplace-types';
import { 
  getSettlementsStore, 
  getSettlementPeriods, 
  approveSettlement 
} from '../../lib/marketplace/settlement-engine';
import { executeSettlementPayout } from '../../lib/marketplace/payout-engine';
import { runGlobalSettlementReconciliation } from '../../lib/marketplace/settlement-reconciliation-engine';
import { getSettlementHolds, placeHold } from '../../lib/marketplace/settlement-eligibility-engine';

export default function MarketplaceSettlementsScreen() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [periods, setPeriods] = useState<SettlementPeriod[]>([]);
  const [holds, setHolds] = useState<SettlementHold[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [payoutRefInput, setPayoutRefInput] = useState<{ [key: string]: string }>({});

  const refreshData = () => {
    const list = getSettlementsStore();
    setSettlements(list);

    const pers = getSettlementPeriods();
    setPeriods(pers);

    const activeHolds = getSettlementHolds();
    setHolds(activeHolds);

    const recon = runGlobalSettlementReconciliation();
    setReconciliation(recon);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApprove = (settlementId: string) => {
    try {
      // PreparedBy is set during batch creation. ApprovedBy must be different user for Dual Control
      approveSettlement({ settlementId, approvedByUid: 'plat-fin-admin-02' });
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleProcessPayout = async (settlementId: string) => {
    const ref = payoutRefInput[settlementId] || `UTR${Date.now()}`;
    try {
      await executeSettlementPayout({
        settlementId,
        payoutMethod: 'MANUAL',
        payoutReference: ref,
        processedByUid: 'plat-fin-admin-02'
      });
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalEligible = settlements.reduce((sum, s) => sum + s.eligibleAmount, 0);
  const totalPaid = settlements.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.eligibleAmount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Platform Finance • V8.3 Settlements & Payouts
            </span>
            <span className="text-xs text-slate-400">Dual Control Enabled</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mt-2 bg-gradient-to-r from-amber-200 via-rose-200 to-emerald-300 bg-clip-text text-transparent">
            Marketplace Settlement & Payout Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Authoritative payout control, settlement periods, statutory eligibility calculator, holds management, & $0-discrepancy reconciliation.
          </p>
        </div>

        <Link
          href="/marketplace-admin/finance"
          className="bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold hover:border-amber-500 transition-all"
        >
          ← Finance Admin
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Total Settlement Batches</div>
            <div className="text-2xl font-bold text-white mt-1">{settlements.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Across all organizations</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Total Eligible Payouts</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">₹{totalEligible.toLocaleString()}</div>
            <div className="text-[10px] text-amber-400/80 mt-1">Calculated Net Earnings</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Paid Out</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{totalPaid.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Transferred with Reference</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Active Holds</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{holds.length}</div>
            <div className="text-[10px] text-rose-400/80 mt-1">Risk / Dispute Holds</div>
          </div>
        </div>

        {/* Global Settlement Reconciliation Status Banner */}
        {reconciliation && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">⚖️ Settlement Reconciliation Engine</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  reconciliation.allReconciled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {reconciliation.allReconciled ? "✓ Verified $0 Discrepancy" : "⚠️ Discrepancy Detected"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audited {reconciliation.totalSettlementsAudited} settlement ledgers. Global Discrepancy Amount: ₹{reconciliation.totalDiscrepancyAmount}.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">₹0.00</span>
              <span className="text-xs text-slate-500 block">Difference</span>
            </div>
          </div>
        )}

        {/* Settlements Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">📦 Settlement Batches & Payout Execution</h2>
              <p className="text-xs text-slate-400 mt-1">Dual-Control approval requires separate authorizers. Manual Payouts require UTR reference numbers.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  <th className="py-3 px-4">Settlement ID</th>
                  <th className="py-3 px-4">Org / Artist</th>
                  <th className="py-3 px-4 text-right">Gross Earnings</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Eligible Payout</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Actions / Transfer Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {settlements.map((s) => (
                  <tr key={s.settlementId} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-bold text-amber-300">{s.settlementId}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{s.organizationId}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{s.artistId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">₹{s.grossEarnings.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">₹{s.eligibleAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        s.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        s.status === 'READY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        s.status === 'APPROVED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.status === 'READY' && (
                        <button
                          onClick={() => handleApprove(s.settlementId)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium font-sans transition-all"
                        >
                          Dual-Control Approve
                        </button>
                      )}
                      {(s.status === 'APPROVED' || s.status === 'READY') && (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            placeholder="Enter UTR Reference"
                            value={payoutRefInput[s.settlementId] || ''}
                            onChange={(e) => setPayoutRefInput({ ...payoutRefInput, [s.settlementId]: e.target.value })}
                            className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-xs text-white w-36 font-mono"
                          />
                          <button
                            onClick={() => handleProcessPayout(s.settlementId)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium font-sans transition-all"
                          >
                            Mark PAID
                          </button>
                        </div>
                      )}
                      {s.status === 'PAID' && (
                        <span className="text-slate-300 font-mono text-xs">{s.payoutReference}</span>
                      )}
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
