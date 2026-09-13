import {
  OrganizationMembership,
  OrganizationInvitation,
  OrganizationRole,
} from "./marketplace-types";

const mockMembersRoster: OrganizationMembership[] = [
  {
    membershipId: "mem_prachi_01",
    organizationId: "makeovers-by-prachi",
    uid: "user_prachi",
    role: "OWNER",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    membershipId: "mem_prachi_artist_02",
    organizationId: "makeovers-by-prachi",
    uid: "user_kavita",
    role: "MAKEUP_ARTIST",
    status: "ACTIVE",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    membershipId: "mem_jaipur_01",
    organizationId: "jaipur-royal-glam",
    uid: "user_artist_jaipur",
    role: "OWNER",
    status: "ACTIVE",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

const invitationsStore: OrganizationInvitation[] = [];

export function getOrganizationMembers(orgId: string): OrganizationMembership[] {
  return mockMembersRoster.filter((m) => m.organizationId === orgId && m.status === "ACTIVE");
}

export function createOrganizationInvitation(payload: {
  organizationId: string;
  inviteeEmail: string;
  assignedRole: OrganizationRole;
  invitedByUid: string;
}): OrganizationInvitation {
  const existingPending = invitationsStore.find(
    (i) => i.organizationId === payload.organizationId && i.inviteeEmail === payload.inviteeEmail && i.status === "PENDING"
  );
  if (existingPending) {
    throw new Error(`Invitation already pending for '${payload.inviteeEmail}'.`);
  }

  const invitation: OrganizationInvitation = {
    invitationId: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    organizationId: payload.organizationId,
    inviteeEmail: payload.inviteeEmail.toLowerCase().trim(),
    assignedRole: payload.assignedRole,
    status: "PENDING",
    invitedByUid: payload.invitedByUid,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  invitationsStore.push(invitation);
  return invitation;
}

export function acceptOrganizationInvitation(invitationId: string, acceptingUid: string): OrganizationMembership {
  const invitation = invitationsStore.find((i) => i.invitationId === invitationId);
  if (!invitation) {
    throw new Error(`Invitation '${invitationId}' not found.`);
  }

  if (invitation.status !== "PENDING") {
    throw new Error(`Invitation '${invitationId}' is no longer pending (status: ${invitation.status}).`);
  }

  invitation.status = "ACCEPTED";

  const newMembership: OrganizationMembership = {
    membershipId: `mem_${Date.now()}_accepted`,
    organizationId: invitation.organizationId,
    uid: acceptingUid,
    role: invitation.assignedRole,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  mockMembersRoster.push(newMembership);
  return newMembership;
}

export function getOrganizationInvitations(orgId: string): OrganizationInvitation[] {
  return invitationsStore.filter((i) => i.organizationId === orgId);
}

export function updateMemberRole(membershipId: string, newRole: OrganizationRole): OrganizationMembership {
  const mem = mockMembersRoster.find((m) => m.membershipId === membershipId);
  if (!mem) {
    throw new Error(`Membership '${membershipId}' not found.`);
  }
  mem.role = newRole;
  return mem;
}

export function deactivateMember(membershipId: string): OrganizationMembership {
  const mem = mockMembersRoster.find((m) => m.membershipId === membershipId);
  if (!mem) {
    throw new Error(`Membership '${membershipId}' not found.`);
  }
  mem.status = "REVOKED";
  return mem;
}
