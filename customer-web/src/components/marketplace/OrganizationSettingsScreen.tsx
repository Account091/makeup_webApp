"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { OrganizationSettings, OrganizationPaymentSettings } from "../../lib/marketplace/marketplace-types";
import { getOrganizationSettings, updateOrganizationSettings } from "../../lib/marketplace/tenant-settings-engine";
import { getOrganizationPaymentSettings, updateOrganizationPaymentSettings } from "../../lib/marketplace/tenant-payment-config";

export default function OrganizationSettingsScreen() {
  const [orgId, setOrgId] = useState("makeovers-by-prachi");
  const [authUid, setAuthUid] = useState("user_prachi");
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<OrganizationPaymentSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const s = getOrganizationSettings(orgId);
    setSettings(s);
    const p = getOrganizationPaymentSettings(orgId);
    setPaymentSettings(p);
  }, [orgId]);

  const handleSave = () => {
    if (settings) {
      updateOrganizationSettings(orgId, settings);
    }
    if (paymentSettings) {
      updateOrganizationPaymentSettings(orgId, paymentSettings);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!settings || !paymentSettings) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Tenant Settings & Payment VPA
            </span>
            <span className="text-xs text-slate-400">Security Rule: settings.manage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">Organization Settings & Policies</h1>
          <p className="text-slate-400 text-sm mt-1">Configure business profile, deposit rules, cancellation policies, & tenant UPI payment VPA.</p>
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

      <div className="max-w-6xl mx-auto space-y-8">
        {savedSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs font-semibold">
            ✓ Organization settings and payment VPA updated successfully!
          </div>
        )}

        {/* Business Information Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">🏢 General Business Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">WhatsApp Official Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-xs">Business Bio / Studio Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tenant Payment & UPI VPA Configuration */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-1">💳 Payment VPA & Bank Destination</h2>
          <p className="text-xs text-slate-400 mb-4">Vision AI compares screenshot VPAs against this configured tenant address.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold text-amber-400">Tenant Official UPI VPA</label>
              <input
                type="text"
                value={paymentSettings.upiVpa}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, upiVpa: e.target.value })}
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={paymentSettings.accountHolderName}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, accountHolderName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Bank Name & IFSC Code</label>
              <input
                type="text"
                value={`${paymentSettings.bankName} (${paymentSettings.ifscCode})`}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">GSTIN Tax Registration (Optional)</label>
              <input
                type="text"
                value={paymentSettings.gstin || ""}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, gstin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Deposit & Cancellation Policy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">📜 Booking Rules & Cancellation Policy</h2>

          <div className="text-xs space-y-4">
            <div>
              <label className="text-slate-400 block mb-1">Default Deposit Lock Percentage (% Total Quote)</label>
              <input
                type="number"
                value={settings.depositPercentDefault}
                onChange={(e) => setSettings({ ...settings, depositPercentDefault: Number(e.target.value) })}
                className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Cancellation & Refund Policy Terms</label>
              <textarea
                value={settings.cancellationPolicyText}
                onChange={(e) => setSettings({ ...settings, cancellationPolicyText: e.target.value })}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold px-8 py-3 rounded-xl text-sm shadow-xl hover:opacity-90 transition-all"
          >
            Save Tenant Settings
          </button>
        </div>
      </div>
    </div>
  );
}
