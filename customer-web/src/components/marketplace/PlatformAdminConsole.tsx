"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Organization, OrganizationVerification, MarketplaceAuditEvent } from "../../lib/marketplace/marketplace-types";
import { getOrganizations, updateVerificationStatus, getAuditEvents, getOrganizationVerification } from "../../lib/marketplace/organization-engine";
import { getActiveCommissionRule } from "../../lib/marketplace/commission-engine";

export default function PlatformAdminConsole() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [verifications, setVerifications] = useState<OrganizationVerification[]>([]);
  const [auditLog, setAuditLog] = useState<MarketplaceAuditEvent[]>([]);

  useEffect(() => {
    const orgs = getOrganizations();
    setOrganizations(orgs);

    const verifs = orgs.map((o) => getOrganizationVerification(o.organizationId)).filter(Boolean) as OrganizationVerification[];
    setVerifications(verifs);

    const logs = getAuditEvents();
    setAuditLog(logs);
  }, []);

  const handleVerify = (orgId: string) => {
    updateVerificationStatus(orgId, "VERIFIED", "user_platform_admin");
    const updatedOrgs = getOrganizations();
    setOrganizations([...updatedOrgs]);

    const updatedVerifs = updatedOrgs.map((o) => getOrganizationVerification(o.organizationId)).filter(Boolean) as OrganizationVerification[];
    setVerifications(updatedVerifs);
    setAuditLog(getAuditEvents());
  };

  const activeRule = getActiveCommissionRule();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Platform Admin Console
            </span>
            <span className="text-xs text-amber-400 font-semibold">🛡️ Global Superadmin Authorization</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 bg-gradient-to-r from-indigo-200 via-purple-200 to-rose-300 bg-clip-text text-transparent">
            Marketplace Platform Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global tenant moderation, verification approvals, commission rule versioning, & system-wide security audit trails.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold hover:border-amber-500 transition-all"
        >
          ← Back to Marketplace Discovery
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Global Commission Rule Configuration */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⚙️ Active Global Commission Rule
              </h2>
              <p className="text-xs text-slate-400">Rule version {activeRule.version} • Effective from {new Date(activeRule.effectiveFrom).toLocaleDateString()}</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
              Status: ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
            <div>
              <div className="text-xs text-slate-400">Platform Share</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{activeRule.platformPercent}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Gateway Fee</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{activeRule.gatewayPercent}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Artist Share</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{activeRule.artistPercent}%</div>
            </div>
          </div>
        </div>

        {/* Registered Tenants & Verification Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-2">
            🏢 Platform Registered Tenants & Verifications
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Review submitted tenant organization verification documents and toggle verification status.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {organizations.map((org) => {
                  const verif = verifications.find((v) => v.organizationId === org.organizationId);
                  return (
                    <tr key={org.organizationId} className="hover:bg-slate-850/50">
                      <td className="py-3.5 px-4 font-bold text-slate-100">{org.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{org.type}</td>
                      <td className="py-3.5 px-4 text-slate-300">{org.city}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                          org.verified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {verif ? verif.status : "UNVERIFIED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!org.verified ? (
                          <button
                            onClick={() => handleVerify(org.organizationId)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-semibold"
                          >
                            Approve Verification
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Audit Events Log */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2">
            📋 Global Security Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            System-wide log of organization creation, verification state changes, & administrative actions.
          </p>

          {auditLog.length === 0 ? (
            <p className="text-xs text-slate-500">No audit events logged yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {auditLog.map((log) => (
                <div key={log.id} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-amber-400 mr-2">[{log.action}]</span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
