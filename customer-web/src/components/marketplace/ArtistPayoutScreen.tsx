'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  FileText, 
  Building2, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Settlement, SettlementHold } from '../../lib/marketplace/marketplace-types';
import { getSettlementsStore } from '../../lib/marketplace/settlement-engine';
import { getSettlementHolds } from '../../lib/marketplace/settlement-eligibility-engine';

export default function ArtistPayoutScreen({ artistId = 'artist-101' }: { artistId?: string }) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [holds, setHolds] = useState<SettlementHold[]>([]);

  useEffect(() => {
    const list = getSettlementsStore({ artistId });
    setSettlements(list);

    const hList = getSettlementHolds(artistId);
    setHolds(hList);
  }, [artistId]);

  const paidTotal = settlements
    .filter(s => s.status === 'PAID')
    .reduce((sum, s) => sum + s.eligibleAmount, 0);

  const processingTotal = settlements
    .filter(s => s.status === 'PROCESSING' || s.status === 'APPROVED')
    .reduce((sum, s) => sum + s.eligibleAmount, 0);

  const availableTotal = settlements
    .filter(s => s.status === 'READY')
    .reduce((sum, s) => sum + s.eligibleAmount, 0);

  const holdsTotal = holds.reduce((sum, h) => sum + h.amount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-medium text-sm mb-1">
              <Wallet className="w-4 h-4" /> Artist Payout Dashboard
            </div>
            <h1 className="text-3xl font-bold text-white">Settlements & Bank Payouts</h1>
            <p className="text-slate-400 text-sm mt-1">
              Track eligible earnings, active holds, completed settlements, and payout statements for Artist: <span className="font-mono text-rose-300">{artistId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              Provider: <span className="text-emerald-400 font-bold">MANUAL_BANK_TRANSFER</span>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-amber-900/50 rounded-xl space-y-2 bg-amber-950/10">
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span>Available for Settlement</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">₹{availableTotal.toLocaleString()}</div>
            <div className="text-xs text-amber-400/80">Ready for next payout cycle</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-rose-900/50 rounded-xl space-y-2 bg-rose-950/10">
            <div className="flex items-center justify-between text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <span>On Hold</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-300">₹{holdsTotal.toLocaleString()}</div>
            <div className="text-xs text-rose-400/80">{holds.length} active hold(s)</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-indigo-900/50 rounded-xl space-y-2 bg-indigo-950/10">
            <div className="flex items-center justify-between text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span>Processing</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-300">₹{processingTotal.toLocaleString()}</div>
            <div className="text-xs text-indigo-400/80">Approved & transferring</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-emerald-900/50 rounded-xl space-y-2 bg-emerald-950/10">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span>Paid Out</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">₹{paidTotal.toLocaleString()}</div>
            <div className="text-xs text-emerald-400/80">Successfully transferred</div>
          </div>
        </div>

        {/* Payout Account Profile Card */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Verified Bank Account</div>
              <div className="text-xs text-slate-400 font-mono">HDFC Bank • Account: •••• 9410 • IFSC: HDFC0001234 • Status: VERIFIED</div>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-bold">
            ✓ VERIFIED PAYOUT PROFILE
          </span>
        </div>

        {/* Settlement History Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              <h2 className="font-semibold text-white">Settlement History</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{settlements.length} settlement batches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Settlement ID</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3 text-right">Gross Earnings</th>
                  <th className="px-4 py-3 text-right">Holds</th>
                  <th className="px-4 py-3 text-right font-bold text-white">Net Payout</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Payout Reference</th>
                  <th className="px-4 py-3 text-right">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {settlements.map(s => (
                  <tr key={s.settlementId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-rose-300">{s.settlementId}</td>
                    <td className="px-4 py-3 text-slate-300">{s.periodId}</td>
                    <td className="px-4 py-3 text-right text-slate-400">₹{s.grossEarnings.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-rose-400">-₹{s.holds.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400 text-sm">
                      ₹{s.eligibleAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'PAID' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        s.status === 'READY' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        s.status === 'APPROVED' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {s.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                        {s.status === 'READY' && <Clock className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{s.payoutReference || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-400 font-sans">
                      {s.paidAt ? new Date(s.paidAt).toLocaleDateString() : '—'}
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
