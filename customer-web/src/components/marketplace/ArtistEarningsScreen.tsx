'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  RefreshCw,
  Wallet,
  ShieldCheck,
  FileText,
  Percent
} from 'lucide-react';

export interface UIArtistEarningsItem {
  transactionId: string;
  bookingId: string;
  organizationId: string;
  artistId: string;
  grossBookingAmount: number;
  discountApplied: number;
  commissionBaseAmount: number;
  platformFeeAmount: number;
  paymentGatewayFeeAmount: number;
  artistNetEarnings: number;
  currency: string;
  status: 'SETTLED' | 'ELIGIBLE_FOR_SETTLEMENT' | 'PENDING_EVENT_COMPLETION';
  settlementId?: string;
  createdAt: string;
}

export default function ArtistEarningsScreen({ organizationId = 'org-jaipur-royal-glam' }: { organizationId?: string }) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<UIArtistEarningsItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalGrossSales: 0,
    totalNetEarnings: 0,
    totalPlatformFees: 0,
    totalGatewayFees: 0,
    pendingBalance: 0,
    settledBalance: 0,
    availableBalance: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'settled' | 'eligible' | 'pending'>('all');

  const fetchEarningsData = useCallback(async () => {
    setLoading(true);
    try {
      const mockTrans: UIArtistEarningsItem[] = [
        {
          transactionId: 'earn-tx-001',
          bookingId: 'bk-jaipur-001',
          organizationId: organizationId,
          artistId: 'artist-101',
          grossBookingAmount: 25000,
          discountApplied: 2000,
          commissionBaseAmount: 23000,
          platformFeeAmount: 2300,
          paymentGatewayFeeAmount: 460,
          artistNetEarnings: 20240,
          currency: 'INR',
          status: 'SETTLED',
          settlementId: 'stl-001',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          transactionId: 'earn-tx-002',
          bookingId: 'bk-jaipur-002',
          organizationId: organizationId,
          artistId: 'artist-101',
          grossBookingAmount: 18000,
          discountApplied: 0,
          commissionBaseAmount: 18000,
          platformFeeAmount: 1800,
          paymentGatewayFeeAmount: 360,
          artistNetEarnings: 15840,
          currency: 'INR',
          status: 'ELIGIBLE_FOR_SETTLEMENT',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
          transactionId: 'earn-tx-003',
          bookingId: 'bk-jaipur-003',
          organizationId: organizationId,
          artistId: 'artist-102',
          grossBookingAmount: 35000,
          discountApplied: 5000,
          commissionBaseAmount: 30000,
          platformFeeAmount: 3000,
          paymentGatewayFeeAmount: 600,
          artistNetEarnings: 26400,
          currency: 'INR',
          status: 'PENDING_EVENT_COMPLETION',
          createdAt: new Date().toISOString()
        }
      ];

      setTransactions(mockTrans);

      const gross = mockTrans.reduce((acc, t) => acc + t.grossBookingAmount, 0);
      const net = mockTrans.reduce((acc, t) => acc + t.artistNetEarnings, 0);
      const pFees = mockTrans.reduce((acc, t) => acc + t.platformFeeAmount, 0);
      const gFees = mockTrans.reduce((acc, t) => acc + t.paymentGatewayFeeAmount, 0);
      const settled = mockTrans.filter(t => t.status === 'SETTLED').reduce((acc, t) => acc + t.artistNetEarnings, 0);
      const available = mockTrans.filter(t => t.status === 'ELIGIBLE_FOR_SETTLEMENT').reduce((acc, t) => acc + t.artistNetEarnings, 0);
      const pending = mockTrans.filter(t => t.status === 'PENDING_EVENT_COMPLETION').reduce((acc, t) => acc + t.artistNetEarnings, 0);

      setMetrics({
        totalGrossSales: gross,
        totalNetEarnings: net,
        totalPlatformFees: pFees,
        totalGatewayFees: gFees,
        pendingBalance: pending,
        settledBalance: settled,
        availableBalance: available
      });
    } catch (err) {
      console.error('Failed to load artist earnings data', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const filteredTransactions = transactions.filter(t => {
    if (selectedFilter === 'settled') return t.status === 'SETTLED';
    if (selectedFilter === 'eligible') return t.status === 'ELIGIBLE_FOR_SETTLEMENT';
    if (selectedFilter === 'pending') return t.status === 'PENDING_EVENT_COMPLETION';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-medium text-sm mb-1">
              <Wallet className="w-4 h-4" /> Artist Financial Hub
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Artist Earnings & Commissions</h1>
            <p className="text-slate-400 text-sm mt-1">
              Authoritative payout ledger, fee breakdown, and settlement status for Org: <span className="text-rose-300 font-mono">{organizationId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchEarningsData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              disabled={metrics.availableBalance < 1000}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-rose-900/20"
            >
              <ArrowUpRight className="w-4 h-4" /> Request Payout (₹{metrics.availableBalance.toLocaleString()})
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Gross Sales</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">₹{metrics.totalGrossSales.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Total customer bookings before commission</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-emerald-900/50 rounded-xl space-y-2 bg-emerald-950/10">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span>Net Artist Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">₹{metrics.totalNetEarnings.toLocaleString()}</div>
            <div className="text-xs text-emerald-400/80">Net earned across all events</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-amber-900/50 rounded-xl space-y-2 bg-amber-950/10">
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span>Available for Payout</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">₹{metrics.availableBalance.toLocaleString()}</div>
            <div className="text-xs text-amber-400/80">Eligible (Min ₹1,000 threshold)</div>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Platform Deductions</span>
              <Percent className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-300">₹{(metrics.totalPlatformFees + metrics.totalGatewayFees).toLocaleString()}</div>
            <div className="text-xs text-slate-400">Platform Commission + PG Fees</div>
          </div>
        </div>

        {/* Breakdown Banner */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-medium text-white">Pre-Tax Net Base Policy Active: </span>
              <span className="text-slate-300">Platform Commission (10%) & PG Fees (2%) are calculated strictly on Net Booking Base (Gross - Discounts).</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-3 py-1 bg-slate-800 rounded-md text-slate-300">Settled: ₹{metrics.settledBalance.toLocaleString()}</span>
            <span className="px-3 py-1 bg-slate-800 rounded-md text-slate-300">Pending: ₹{metrics.pendingBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              <h2 className="font-semibold text-white">Earnings Transaction Ledger</h2>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs font-mono">
                {filteredTransactions.length} items
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['all', 'settled', 'eligible', 'pending'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                    selectedFilter === tab 
                      ? 'bg-rose-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tx ID / Booking</th>
                  <th className="px-4 py-3 text-right">Gross Total</th>
                  <th className="px-4 py-3 text-right">Net Base</th>
                  <th className="px-4 py-3 text-right">Platform Fee (10%)</th>
                  <th className="px-4 py-3 text-right">PG Fee (2%)</th>
                  <th className="px-4 py-3 text-right font-bold text-white">Artist Net Share</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredTransactions.map(tx => (
                  <tr key={tx.transactionId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-rose-300">
                      <div>{tx.transactionId}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{tx.bookingId}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200">₹{tx.grossBookingAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-300">₹{tx.commissionBaseAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-rose-400">-₹{tx.platformFeeAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-amber-400">-₹{tx.paymentGatewayFeeAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400 text-sm">
                      ₹{tx.artistNetEarnings.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.status === 'SETTLED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        tx.status === 'ELIGIBLE_FOR_SETTLEMENT' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {tx.status === 'SETTLED' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'ELIGIBLE_FOR_SETTLEMENT' && <Clock className="w-3 h-3" />}
                        {tx.status === 'PENDING_EVENT_COMPLETION' && <AlertCircle className="w-3 h-3" />}
                        {tx.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 font-sans">
                      {new Date(tx.createdAt).toLocaleDateString()}
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
