import {
  OrganizationPermission,
  OrganizationRole,
  PlatformRole,
} from "./marketplace-types";
import { getAuthorizedMemberships, verifyTenantAuthorization } from "./tenant-isolation";

// Fine-grained permission matrix mapping roles to explicit permissions
export const rolePermissionsMap: Record<OrganizationRole, OrganizationPermission[]> = {
  OWNER: [
    "bookings.read",
    "bookings.create",
    "bookings.update",
    "payments.read",
    "payments.verify",
    "finance.read",
    "finance.export",
    "staff.manage",
    "catalog.manage",
    "content.manage",
    "analytics.read",
    "support.manage",
    "settings.manage",
  ],
  ADMIN: [
    "bookings.read",
    "bookings.create",
    "bookings.update",
    "payments.read",
    "payments.verify",
    "finance.read",
    "staff.manage",
    "catalog.manage",
    "content.manage",
    "analytics.read",
    "support.manage",
    "settings.manage",
  ],
  MANAGER: [
    "bookings.read",
    "bookings.create",
    "bookings.update",
    "payments.read",
    "payments.verify",
    "catalog.manage",
    "content.manage",
    "analytics.read",
    "support.manage",
  ],
  MAKEUP_ARTIST: [
    "bookings.read",
    "catalog.manage",
    "content.manage",
  ],
  HAIR_ARTIST: [
    "bookings.read",
    "content.manage",
  ],
  DRAPING_ARTIST: [
    "bookings.read",
    "content.manage",
  ],
  CONTENT_MANAGER: [
    "content.manage",
    "catalog.manage",
    "analytics.read",
  ],
  ACCOUNTANT: [
    "payments.read",
    "payments.verify",
    "finance.read",
    "finance.export",
    "analytics.read",
  ],
  SUPPORT: [
    "bookings.read",
    "support.manage",
  ],
};

export function getRolePermissions(role: OrganizationRole): OrganizationPermission[] {
  return rolePermissionsMap[role] || [];
}

/**
 * Checks whether an authenticated user holds the required permission within a target organization.
 */
export function hasOrganizationPermission(
  uid: string,
  targetOrgId: string,
  requiredPermission: OrganizationPermission
): boolean {
  try {
    const membership = verifyTenantAuthorization(uid, targetOrgId);
    const permissions = getRolePermissions(membership.role);
    return permissions.includes(requiredPermission);
  } catch (e) {
    return false;
  }
}

/**
 * Validates platform superadmin privileges.
 * Organization OWNER/ADMIN roles do NOT grant platform superadmin privileges.
 */
export function isPlatformAdmin(uid: string): boolean {
  const memberships = getAuthorizedMemberships(uid);
  return memberships.some(
    (m) => m.organizationId === "platform-admin" && (m.role === "ADMIN" || m.role === "OWNER")
  );
}
