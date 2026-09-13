"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { OrganizationMembership, OrganizationInvitation, OrganizationRole } from "../../lib/marketplace/marketplace-types";
import { getOrganizationMembers, createOrganizationInvitation, getOrganizationInvitations, deactivateMember } from "../../lib/marketplace/tenant-members-engine";
import { getRolePermissions } from "../../lib/marketplace/tenant-permissions";

export default function OrganizationMembersScreen() {
  const [orgId, setOrgId] = useState("makeovers-by-prachi");
  const [authUid, setAuthUid] = useState("user_prachi");
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrganizationRole>("MAKEUP_ARTIST");
  const [selectedRolePreview, setSelectedRolePreview] = useState<OrganizationRole>("MAKEUP_ARTIST");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const mems = getOrganizationMembers(orgId);
    setMembers(mems);
    const invs = getOrganizationInvitations(orgId);
    setInvitations(invs);
  }, [orgId]);

  const handleSendInvite = () => {
    setErrorMsg(null);
    try {
      if (!inviteEmail) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      createOrganizationInvitation({
        organizationId: orgId,
        inviteeEmail: inviteEmail,
        assignedRole: inviteRole,
        invitedByUid: authUid,
      });

      setInvitations([...getOrganizationInvitations(orgId)]);
      setInviteEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send invitation.");
    }
  };

  const handleDeactivate = (membershipId: string) => {
    deactivateMember(membershipId);
    setMembers([...getOrganizationMembers(orgId)]);
  };

  const previewPermissions = getRolePermissions(selectedRolePreview);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Staff & Role Management
            </span>
            <span className="text-xs text-slate-400">Security Rule: staff.manage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">Team Members & Role Permission Matrix</h1>
          <p className="text-slate-400 text-sm mt-1">Manage artist team memberships, send staff invitations, & evaluate fine-grained permissions.</p>
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
        {/* Invite New Team Member */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-2">✉️ Invite Staff Member</h2>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {inviteSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-semibold">
              ✓ Invitation sent successfully! Record added to organizationInvitations/{orgId}.
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="e.g. artist.kavita@makeoversbyprachi.com"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            <select
              value={inviteRole}
              onChange={(e) => {
                setInviteRole(e.target.value as OrganizationRole);
                setSelectedRolePreview(e.target.value as OrganizationRole);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="MAKEUP_ARTIST">MAKEUP_ARTIST</option>
              <option value="HAIR_ARTIST">HAIR_ARTIST</option>
              <option value="DRAPING_ARTIST">DRAPING_ARTIST</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
              <option value="SUPPORT">SUPPORT</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button
              onClick={handleSendInvite}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-lg hover:opacity-90 transition-all"
            >
              Send Invitation
            </button>
          </div>
        </div>

        {/* Active Members Roster */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4">👥 Active Team Members Roster</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                  <th className="py-3 px-4">Membership ID</th>
                  <th className="py-3 px-4">User UID</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {members.map((mem) => (
                  <tr key={mem.membershipId} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{mem.membershipId}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{mem.uid}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">
                        {mem.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-bold">● ACTIVE</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {mem.role !== "OWNER" ? (
                        <button
                          onClick={() => handleDeactivate(mem.membershipId)}
                          className="text-rose-400 hover:underline font-semibold"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <span className="text-slate-500 font-semibold">Owner Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Permission Matrix Previewer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-bold text-white">🔐 Role Permission Matrix Inspector</h2>
              <p className="text-xs text-slate-400">Preview exact fine-grained authorization scope assigned to each role.</p>
            </div>

            <select
              value={selectedRolePreview}
              onChange={(e) => setSelectedRolePreview(e.target.value as OrganizationRole)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200"
            >
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="MAKEUP_ARTIST">MAKEUP_ARTIST</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
              <option value="SUPPORT">SUPPORT</option>
            </select>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Permissions for {selectedRolePreview}:
            </h3>
            <div className="flex flex-wrap gap-2">
              {previewPermissions.map((perm) => (
                <span key={perm} className="text-xs bg-slate-900 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-mono">
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
