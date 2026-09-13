'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  FileText
} from 'lucide-react';
import { Settlement } from '../../lib/marketplace/marketplace-types';
import { getSettlementsStore } from '../../lib/marketplace/settlement-engine';

export default function OrganizationPayoutScreen({ organizationId = 'org-jaipur-royal-glam' }: { organizationId?: string }) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    const list = getSettlementsStore({ organizationId });
    setSettlements(list);
  }, [organizationId]);

  const totalPayouts = settlements.reduce((sum, s) => sum + s.eligibleAmount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-medium text-sm mb-1">
              <Building2 className="w-4 h-4" /> Tenant Financial Operations
            </div>
            <h1 className="text-3xl font-bold text-white">Organization Payout Control</h1>
            <p className="text-slate-400 text-sm mt-1">
              Scoped financial oversight for staff artist settlements in Org: <span className="font-mono text-rose-300">{organizationId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              Tenant Isolation: <span className="text-emerald-400 font-bold">STRICTLY SCOPED</span>
            </span>
          </div>
        </div>

        {/* Organization KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Managed Staff Artists</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">3 Artists</div>
            <div className="text-xs text-slate-400">Jaipur Royal Glam Roster</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-emerald-900/50 rounded-xl space-y-2 bg-emerald-950/10">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase">
              <span>Total Settled Payouts</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">₹{totalPayouts.toLocaleString()}</div>
            <div className="text-xs text-emerald-400/80">Cumulative organization transfers</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Pending Settlements</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {settlements.filter(s => s.status !== 'PAID').length} Batches
            </div>
            <div className="text-xs text-slate-400">Awaiting processing / approval</div>
          </div>
        </div>

        {/* Settlement Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              <h2 className="font-semibold text-white">Organization Artist Settlements</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Settlement ID</th>
                  <th className="px-4 py-3">Artist ID</th>
                  <th className="px-4 py-3 text-right">Gross Earnings</th>
                  <th className="px-4 py-3 text-right font-bold text-white">Net Payout</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Payout Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {settlements.map(s => (
                  <tr key={s.settlementId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-rose-300">{s.settlementId}</td>
                    <td className="px-4 py-3 text-slate-200">{s.artistId}</td>
                    <td className="px-4 py-3 text-right text-slate-400">₹{s.grossEarnings.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">₹{s.eligibleAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{s.payoutReference || '—'}</td>
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
