import { OrganizationMembership, OrganizationRole } from "./marketplace-types";

// In-memory mock directory for authenticated organization memberships
// In production Firestore, this maps `organizationMemberships/{membershipId}` where uid == auth.uid
const mockMemberships: Record<string, OrganizationMembership[]> = {
  "user_prachi": [
    {
      membershipId: "mem_prachi_01",
      organizationId: "makeovers-by-prachi",
      uid: "user_prachi",
      role: "OWNER",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  "user_artist_jaipur": [
    {
      membershipId: "mem_jaipur_01",
      organizationId: "jaipur-royal-glam",
      uid: "user_artist_jaipur",
      role: "OWNER",
      status: "ACTIVE",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  "user_platform_admin": [
    {
      membershipId: "mem_admin_01",
      organizationId: "platform-admin",
      uid: "user_platform_admin",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

export class TenantSecurityError extends Error {
  constructor(message: string) {
    super(`[TENANT_SECURITY_VIOLATION] ${message}`);
    this.name = "TenantSecurityError";
  }
}

/**
 * Resolves all active organization memberships for an authenticated UID.
 * Does NOT accept client-supplied organizationId.
 */
export function getAuthorizedMemberships(uid: string): OrganizationMembership[] {
  const memberships = mockMemberships[uid] || [
    // Default fallback for demo / test users to makeovers-by-prachi
    {
      membershipId: `mem_${uid}_default`,
      organizationId: "makeovers-by-prachi",
      uid,
      role: "MAKEUP_ARTIST" as OrganizationRole,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    },
  ];

  return memberships.filter((m) => m.status === "ACTIVE");
}

/**
 * Verifies whether the authenticated user is authorized to access data for requested targetOrgId.
 * NEVER trusts targetOrgId passed by client unless user holds active membership in targetOrgId or platform admin role.
 */
export function verifyTenantAuthorization(
  uid: string,
  targetOrgId: string,
  requiredRoles?: OrganizationRole[]
): OrganizationMembership {
  if (!uid) {
    throw new TenantSecurityError("Unauthenticated request. User ID is required.");
  }

  if (!targetOrgId) {
    throw new TenantSecurityError("Target organization ID must be specified for tenant verification.");
  }

  const activeMemberships = getAuthorizedMemberships(uid);

  // Platform Admin bypass check
  const platformAdminMem = activeMemberships.find((m) => m.organizationId === "platform-admin" && m.role === "ADMIN");
  if (platformAdminMem) {
    return platformAdminMem;
  }

  const userMembership = activeMemberships.find((m) => m.organizationId === targetOrgId);

  if (!userMembership) {
    throw new TenantSecurityError(
      `Access Denied: User '${uid}' is NOT an authorized member of organization '${targetOrgId}'.`
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userMembership.role)) {
      throw new TenantSecurityError(
        `Role Authorization Failed: User role '${userMembership.role}' is not in required roles [${requiredRoles.join(", ")}].`
      );
    }
  }

  return userMembership;
}

/**
 * Sanitize query payload by injecting server-verified organizationId.
 * Strips any spoofed client organizationId.
 */
export function enforceTenantScope<T extends { organizationId?: string }>(
  uid: string,
  requestedData: T,
  targetOrgId: string
): T & { organizationId: string } {
  const verifiedMembership = verifyTenantAuthorization(uid, targetOrgId);
  return {
    ...requestedData,
    organizationId: verifiedMembership.organizationId,
  };
}
