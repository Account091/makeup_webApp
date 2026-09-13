import { 
  OrganizationVerificationRecord, 
  ArtistVerificationRecord, 
  VerificationEvidence, 
  VerificationStatusV84 
} from "./marketplace-types";

const orgVerificationsStore: OrganizationVerificationRecord[] = [
  {
    id: "verif-org-jaipur",
    organizationId: "org-jaipur-royal-glam",
    verificationType: "BUSINESS_TAX",
    status: "VERIFIED",
    submittedAt: "2026-08-01T10:00:00Z",
    reviewedAt: "2026-08-02T14:00:00Z",
    reviewedByUid: "admin-trust-01",
    verificationVersion: 1,
    expiryDate: "2027-08-01T10:00:00Z",
    evidenceIds: ["evid-gstin-01", "evid-pan-01"]
  }
];

const artistVerificationsStore: ArtistVerificationRecord[] = [
  {
    id: "verif-artist-101",
    artistId: "artist-101",
    organizationId: "org-jaipur-royal-glam",
    verificationAreas: ["IDENTITY", "PROFESSIONAL_PROFILE", "PORTFOLIO", "SERVICE_INFORMATION"],
    status: "VERIFIED",
    submittedAt: "2026-08-05T10:00:00Z",
    reviewedAt: "2026-08-06T11:00:00Z",
    verifiedBadgeActive: true
  }
];

const evidenceStore: VerificationEvidence[] = [
  {
    id: "evid-gstin-01",
    verificationId: "verif-org-jaipur",
    type: "GSTIN_DOCUMENT",
    storagePath: "tenants/org-jaipur-royal-glam/docs/gstin.pdf",
    submittedAt: "2026-08-01T10:00:00Z",
    status: "APPROVED"
  }
];

export function getOrganizationVerification(orgId: string): OrganizationVerificationRecord | undefined {
  return orgVerificationsStore.find(v => v.organizationId === orgId);
}

export function getArtistVerification(artistId: string): ArtistVerificationRecord | undefined {
  return artistVerificationsStore.find(v => v.artistId === artistId);
}

export function getVerificationChecklist(orgId: string): {
  identityVerified: boolean;
  profileComplete: boolean;
  servicesConfigured: boolean;
  portfolioVerified: boolean;
  policiesSet: boolean;
  paymentVerified: boolean;
  overallReady: boolean;
} {
  const verif = getOrganizationVerification(orgId);
  const isVerified = verif?.status === "VERIFIED";

  return {
    identityVerified: isVerified,
    profileComplete: true,
    servicesConfigured: true,
    portfolioVerified: isVerified,
    policiesSet: true,
    paymentVerified: true,
    overallReady: isVerified
  };
}

export function submitOrganizationVerification(payload: {
  organizationId: string;
  verificationType: "BUSINESS_TAX" | "IDENTITY_PORTFOLIO";
  evidencePaths: string[];
}): OrganizationVerificationRecord {
  const record: OrganizationVerificationRecord = {
    id: `verif_org_${Date.now()}`,
    organizationId: payload.organizationId,
    verificationType: payload.verificationType,
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
    verificationVersion: 1,
    evidenceIds: payload.evidencePaths.map((p, idx) => `evid_${Date.now()}_${idx}`)
  };

  const existingIdx = orgVerificationsStore.findIndex(v => v.organizationId === payload.organizationId);
  if (existingIdx >= 0) {
    orgVerificationsStore[existingIdx] = record;
  } else {
    orgVerificationsStore.push(record);
  }

  return record;
}

export function approveOrganizationVerification(payload: {
  organizationId: string;
  reviewedByUid: string;
}): OrganizationVerificationRecord {
  const record = orgVerificationsStore.find(v => v.organizationId === payload.organizationId);
  if (!record) {
    throw new Error(`Verification record for organization '${payload.organizationId}' not found.`);
  }

  record.status = "VERIFIED";
  record.reviewedAt = new Date().toISOString();
  record.reviewedByUid = payload.reviewedByUid;
  record.expiryDate = new Date(Date.now() + 365 * 86400000).toISOString(); // 1 year expiry

  return record;
}

export function rejectOrganizationVerification(payload: {
  organizationId: string;
  reviewedByUid: string;
  reason: string;
}): OrganizationVerificationRecord {
  const record = orgVerificationsStore.find(v => v.organizationId === payload.organizationId);
  if (!record) {
    throw new Error(`Verification record for organization '${payload.organizationId}' not found.`);
  }

  record.status = "REJECTED";
  record.reviewedAt = new Date().toISOString();
  record.reviewedByUid = payload.reviewedByUid;

  return record;
}
