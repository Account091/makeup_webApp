/**
 * Tenant Isolation Verifier — V9.0
 */

export function verifyTenantIsolation(params: {
  actorUid: string;
  actorRole: string;
  actorOrgId?: string;
  targetOrgId: string;
}): { authorized: boolean; reason?: string } {
  const { actorRole, actorOrgId, targetOrgId } = params;

  // Platform Admins can cross tenant boundaries for platform management
  if (actorRole === 'SUPER_ADMIN' || actorRole === 'PLATFORM_ADMIN') {
    return { authorized: true };
  }

  if (!actorOrgId) {
    return {
      authorized: false,
      reason: 'Actor has no active organization membership',
    };
  }

  if (actorOrgId !== targetOrgId) {
    return {
      authorized: false,
      reason: `Tenant isolation violation: Actor org '${actorOrgId}' cannot access target org '${targetOrgId}'`,
    };
  }

  return { authorized: true };
}
