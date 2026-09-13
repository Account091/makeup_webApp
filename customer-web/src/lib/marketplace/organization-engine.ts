import {
  Organization,
  OrganizationMembership,
  OrganizationVerification,
  VerificationStatus,
  MarketplaceAuditEvent,
} from "./marketplace-types";

// In-memory tenant registry initialized with canonical "Makeovers by Prachi"
const initialOrganizations: Organization[] = [
  {
    organizationId: "makeovers-by-prachi",
    name: "Makeovers by Prachi",
    slug: "makeovers-by-prachi",
    type: "ARTIST_BUSINESS",
    status: "ACTIVE",
    verified: true,
    contactEmail: "prachi@makeoversbyprachi.com",
    contactPhone: "+91-98290-00000",
    city: "Jodhpur",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z",
  },
  {
    organizationId: "jaipur-royal-glam",
    name: "Jaipur Royal Glam Studio",
    slug: "jaipur-royal-glam",
    type: "STUDIO",
    status: "ACTIVE",
    verified: true,
    contactEmail: "info@jaipurroyalglam.com",
    contactPhone: "+91-98291-11111",
    city: "Jaipur",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z",
  },
];

const initialVerifications: OrganizationVerification[] = [
  {
    id: "verif_mbp_01",
    organizationId: "makeovers-by-prachi",
    status: "VERIFIED",
    businessName: "Makeovers by Prachi LLP",
    taxRegistrationNumber: "08AAAAA0000A1Z5",
    identityDocumentSubmitted: true,
    portfolioVerified: true,
    submittedAt: "2026-01-02T00:00:00.000Z",
    verifiedAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "verif_jrg_01",
    organizationId: "jaipur-royal-glam",
    status: "VERIFIED",
    businessName: "Jaipur Royal Glam Studio Private Limited",
    taxRegistrationNumber: "08BBBBB1111B1Z2",
    identityDocumentSubmitted: true,
    portfolioVerified: true,
    submittedAt: "2026-02-02T00:00:00.000Z",
    verifiedAt: "2026-02-10T00:00:00.000Z",
  },
];

const auditEvents: MarketplaceAuditEvent[] = [];

export function getOrganizations(): Organization[] {
  return initialOrganizations;
}

export function getOrganizationById(orgId: string): Organization | undefined {
  return initialOrganizations.find((o) => o.organizationId === orgId);
}

export function createOrganization(payload: {
  name: string;
  slug: string;
  type: Organization["type"];
  contactEmail: string;
  contactPhone: string;
  city: string;
  ownerUid: string;
}): { organization: Organization; membership: OrganizationMembership } {
  const orgId = payload.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  
  const existing = initialOrganizations.find((o) => o.organizationId === orgId);
  if (existing) {
    throw new Error(`Organization slug '${orgId}' already exists.`);
  }

  const newOrg: Organization = {
    organizationId: orgId,
    name: payload.name,
    slug: orgId,
    type: payload.type,
    status: "ACTIVE",
    verified: false,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    city: payload.city,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  initialOrganizations.push(newOrg);

  const ownerMembership: OrganizationMembership = {
    membershipId: `mem_${Date.now()}_owner`,
    organizationId: orgId,
    uid: payload.ownerUid,
    role: "OWNER",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  initialVerifications.push({
    id: `verif_${orgId}`,
    organizationId: orgId,
    status: "UNVERIFIED",
    businessName: payload.name,
    identityDocumentSubmitted: false,
    portfolioVerified: false,
    submittedAt: new Date().toISOString(),
  });

  auditEvents.push({
    id: `audit_${Date.now()}`,
    organizationId: orgId,
    uid: payload.ownerUid,
    action: "ORGANIZATION_CREATED",
    details: `Organization '${payload.name}' created by UID '${payload.ownerUid}'.`,
    timestamp: new Date().toISOString(),
  });

  return { organization: newOrg, membership: ownerMembership };
}

export function updateVerificationStatus(
  orgId: string,
  newStatus: VerificationStatus,
  adminUid: string,
  rejectionReason?: string
): OrganizationVerification {
  const verif = initialVerifications.find((v) => v.organizationId === orgId);
  if (!verif) {
    throw new Error(`Verification record not found for organization '${orgId}'.`);
  }

  verif.status = newStatus;
  if (rejectionReason) {
    verif.rejectionReason = rejectionReason;
  }
  if (newStatus === "VERIFIED") {
    verif.verifiedAt = new Date().toISOString();
    const org = getOrganizationById(orgId);
    if (org) {
      org.verified = true;
    }
  }

  auditEvents.push({
    id: `audit_${Date.now()}`,
    organizationId: orgId,
    uid: adminUid,
    action: "VERIFICATION_STATUS_UPDATED",
    details: `Verification status changed to '${newStatus}' for org '${orgId}'.`,
    timestamp: new Date().toISOString(),
  });

  return verif;
}

export function getOrganizationVerification(orgId: string): OrganizationVerification | undefined {
  return initialVerifications.find((v) => v.organizationId === orgId);
}

/**
 * Migration Helper: Simulates populating `organizationId: "makeovers-by-prachi"` across legacy un-tenanted records.
 */
export function migrateLegacyDataToTenant(): {
  migratedBookingsCount: number;
  migratedCustomersCount: number;
  migratedServicesCount: number;
  missingOrgIdCount: number;
} {
  return {
    migratedBookingsCount: 42,
    migratedCustomersCount: 128,
    migratedServicesCount: 15,
    missingOrgIdCount: 0,
  };
}

export function getAuditEvents(orgId?: string): MarketplaceAuditEvent[] {
  if (orgId) {
    return auditEvents.filter((a) => a.organizationId === orgId);
  }
  return auditEvents;
}
