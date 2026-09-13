import {
  OrganizationOnboardingChecklist,
  MarketplaceReadinessScore,
} from "./marketplace-types";
import { getOrganizationSettings } from "./tenant-settings-engine";
import { getOrganizationPaymentSettings } from "./tenant-payment-config";
import { getOrganizationVerification } from "./organization-engine";
import { getOrganizationMembers } from "./tenant-members-engine";

const onboardingChecklistStore: Record<string, OrganizationOnboardingChecklist> = {
  "makeovers-by-prachi": {
    organizationId: "makeovers-by-prachi",
    profileComplete: true,
    servicesComplete: true,
    artistsComplete: true,
    calendarConfigured: true,
    paymentConfigured: true,
    verificationComplete: true,
    marketplaceReady: true,
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  "jaipur-royal-glam": {
    organizationId: "jaipur-royal-glam",
    profileComplete: true,
    servicesComplete: true,
    artistsComplete: true,
    calendarConfigured: true,
    paymentConfigured: true,
    verificationComplete: true,
    marketplaceReady: true,
    updatedAt: "2026-09-02T00:00:00.000Z",
  },
};

export function getOrganizationOnboardingChecklist(orgId: string): OrganizationOnboardingChecklist {
  const existing = onboardingChecklistStore[orgId];
  if (existing) return existing;

  return {
    organizationId: orgId,
    profileComplete: false,
    servicesComplete: false,
    artistsComplete: false,
    calendarConfigured: false,
    paymentConfigured: false,
    verificationComplete: false,
    marketplaceReady: false,
    updatedAt: new Date().toISOString(),
  };
}

export function updateOnboardingChecklist(
  orgId: string,
  updatedFields: Partial<OrganizationOnboardingChecklist>
): OrganizationOnboardingChecklist {
  const current = getOrganizationOnboardingChecklist(orgId);
  const updated: OrganizationOnboardingChecklist = {
    ...current,
    ...updatedFields,
    organizationId: orgId,
    updatedAt: new Date().toISOString(),
  };

  onboardingChecklistStore[orgId] = updated;
  return updated;
}

/**
 * Deterministic Marketplace Readiness Score calculator (0-100%).
 */
export function calculateMarketplaceReadinessScore(orgId: string): MarketplaceReadinessScore {
  const checklist = getOrganizationOnboardingChecklist(orgId);
  const settings = getOrganizationSettings(orgId);
  const paymentSettings = getOrganizationPaymentSettings(orgId);
  const verif = getOrganizationVerification(orgId);
  const members = getOrganizationMembers(orgId);

  const pendingItems: string[] = [];

  const profileOk = !!(settings.businessName && settings.contactEmail && settings.description);
  if (!profileOk) pendingItems.push("Business Profile & Contact Info");

  const servicesOk = checklist.servicesComplete;
  if (!servicesOk) pendingItems.push("Service Catalog & Pricing");

  const artistsOk = members.length > 0 && checklist.artistsComplete;
  if (!artistsOk) pendingItems.push("Artist Team Roster");

  const calendarOk = checklist.calendarConfigured;
  if (!calendarOk) pendingItems.push("Calendar & Booking Rules");

  const paymentOk = !!(paymentSettings.upiVpa && paymentSettings.bankName);
  if (!paymentOk) pendingItems.push("Payment Destination & VPA Configuration");

  const verifOk = verif?.status === "VERIFIED";
  if (!verifOk) pendingItems.push("Organization Business Verification");

  const steps = [
    { name: "profile", isDone: profileOk },
    { name: "services", isDone: servicesOk },
    { name: "artists", isDone: artistsOk },
    { name: "calendar", isDone: calendarOk },
    { name: "payment", isDone: paymentOk },
    { name: "verification", isDone: verifOk },
  ];

  const completedStepsCount = steps.filter((s) => s.isDone).length;
  const totalStepsCount = steps.length;
  const readinessScorePercent = Math.round((completedStepsCount / totalStepsCount) * 100);

  let status: MarketplaceReadinessScore["status"] = "INCOMPLETE";
  if (readinessScorePercent === 100) {
    status = "READY";
  } else if (readinessScorePercent >= 66) {
    status = "NEEDS_ATTENTION";
  }

  return {
    organizationId: orgId,
    readinessScorePercent,
    status,
    completedStepsCount,
    totalStepsCount,
    pendingItems,
  };
}

/**
 * AI Onboarding Assistant helper for responding to setup questions.
 */
export function getAiOnboardingGuidance(orgId: string): {
  readinessScore: MarketplaceReadinessScore;
  aiAdvice: string;
} {
  const score = calculateMarketplaceReadinessScore(orgId);

  let aiAdvice = "";
  if (score.status === "READY") {
    aiAdvice = "Congratulations! Your organization setup is 100% complete and fully ready to accept public marketplace bookings.";
  } else {
    aiAdvice = `Your organization is ${score.readinessScorePercent}% complete (${score.completedStepsCount}/${score.totalStepsCount} steps). Pending action items before accepting bookings: ${score.pendingItems.join(", ")}.`;
  }

  return {
    readinessScore: score,
    aiAdvice,
  };
}
