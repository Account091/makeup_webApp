"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Organization,
  CommissionTransaction,
  OrganizationVerification,
} from "../../lib/marketplace/marketplace-types";
import { getOrganizationById, getOrganizationVerification } from "../../lib/marketplace/organization-engine";
import { getCommissionLedger, calculateArtistEarnings } from "../../lib/marketplace/commission-engine";
import { verifyTenantAuthorization } from "../../lib/marketplace/tenant-isolation";

export default function OrganizationAdminDashboard() {
  const [selectedOrgId, setSelectedOrgId] = useState("makeovers-by-prachi");
  const [org, setOrg] = useState<Organization | null>(null);
  const [verification, setVerification] = useState<OrganizationVerification | null>(null);
  const [ledger, setLedger] = useState<CommissionTransaction[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [authUid, setAuthUid] = useState("user_prachi");
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAccessError(null);
      // Server-side tenant verification mock check
      verifyTenantAuthorization(authUid, selectedOrgId);

      const foundOrg = getOrganizationById(selectedOrgId);
      if (foundOrg) setOrg(foundOrg);

      const foundVerif = getOrganizationVerification(selectedOrgId);
      if (foundVerif) setVerification(foundVerif);

      const txs = getCommissionLedger(selectedOrgId);
      setLedger(txs);

      const earn = calculateArtistEarnings(selectedOrgId);
      setEarnings(earn);
    } catch (err: any) {
      setAccessError(err.message || "Tenant Security Violation");
    }
  }, [selectedOrgId, authUid]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Multi-Tenant Organization Portal
            </span>
            <span className="text-xs text-emerald-400 font-semibold">🔒 Tenant Isolation Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 bg-clip-text text-transparent">
            {org ? org.name : "Organization Admin Console"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage listings, artist team memberships, commission ledgers, payouts, & verification status.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Caller Identity:</label>
            <select
              value={authUid}
              onChange={(e) => setAuthUid(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs"
            >
              <option value="user_prachi">UID: user_prachi (Makeovers by Prachi)</option>
              <option value="user_artist_jaipur">UID: user_artist_jaipur (Jaipur Royal Glam)</option>
              <option value="user_guest_unauth">UID: user_guest_unauth (Unauthorized)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Target Tenant:</label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs"
            >
              <option value="makeovers-by-prachi">Makeovers by Prachi</option>
              <option value="jaipur-royal-glam">Jaipur Royal Glam</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Security Access Violation Alert */}
        {accessError && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl text-rose-300 space-y-2">
            <div className="font-bold flex items-center gap-2 text-base">
              <span>⚠️ Tenant Authorization Blocked</span>
            </div>
            <p className="text-xs leading-relaxed">{accessError}</p>
            <p className="text-[11px] text-rose-400/80">
              Security Rule Enforced: Client-supplied organizationId is rejected when UID is not an authorized member.
            </p>
          </div>
        )}

        {!accessError && earnings && (
          <>
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-slate-400">Gross Bookings</div>
                <div className="text-2xl font-bold text-white mt-1">₹{earnings.grossBookings.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-1">{earnings.transactionCount} Total Ledger Txs</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-slate-400">Platform Fees (10%)</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">₹{earnings.platformFees.toLocaleString()}</div>
                <div className="text-[10px] text-amber-400/80 mt-1">Platform Commission</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-slate-400">Gateway Fees (2%)</div>
                <div className="text-2xl font-bold text-indigo-400 mt-1">₹{earnings.gatewayFees.toLocaleString()}</div>
                <div className="text-[10px] text-indigo-400/80 mt-1">Payment Processing</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-slate-400">Net Artist Share (88%)</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">₹{earnings.netEarnings.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400/80 mt-1">Immutable Net Share</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-xs text-slate-400">Pending Settlement</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">₹{earnings.pendingSettlement.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">Cycle Settlement</div>
              </div>
            </div>

            {/* Tenant Details & Verification Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Tenant Organization Details</h2>
                  {verification && (
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      verification.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      Status: {verification.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Type: {org?.type} • City: {org?.city} • Contact: {org?.contactEmail}
                </p>
              </div>

              <Link
                href="/marketplace"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700"
              >
                View Public Marketplace Listing →
              </Link>
            </div>

            {/* Commission Ledger Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-2">
                📜 Append-Only Commission Ledger
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Immutable record of booking transactions, platform fees, gateway fees, and artist earnings.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Gross Amount</th>
                      <th className="py-3 px-4 text-amber-300">Platform (10%)</th>
                      <th className="py-3 px-4 text-indigo-300">Gateway (2%)</th>
                      <th className="py-3 px-4 text-emerald-400">Net Share (88%)</th>
                      <th className="py-3 px-4">Rule Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {ledger.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-850/50">
                        <td className="py-3.5 px-4 font-mono text-slate-300">{tx.id}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{tx.bookingId}</td>
                        <td className="py-3.5 px-4 font-bold text-white">₹{tx.grossAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-amber-300">₹{tx.platformCommission.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-indigo-300">₹{tx.gatewayFee.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">₹{tx.artistShare.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-400">{tx.ruleVersion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
