import { hasOrganizationPermission, getRolePermissions, isPlatformAdmin } from "../src/lib/marketplace/tenant-permissions";
import { getPublicOrganizationProfile, getOrganizationSettings, updateOrganizationSettings } from "../src/lib/marketplace/tenant-settings-engine";
import { createOrganizationInvitation, acceptOrganizationInvitation, getOrganizationMembers } from "../src/lib/marketplace/tenant-members-engine";
import { getOrganizationPaymentSettings, validateTenantUpiVpa } from "../src/lib/marketplace/tenant-payment-config";
import { calculateMarketplaceReadinessScore, getAiOnboardingGuidance } from "../src/lib/marketplace/tenant-onboarding-engine";

describe("V8.1 Advanced Multi-Tenant Operations Suite", () => {
  test("🔐 Role Permission Matrix enforces fine-grained authorization", () => {
    // 1. OWNER holds finance.read & settings.manage
    const prachiFinance = hasOrganizationPermission("user_prachi", "makeovers-by-prachi", "finance.read");
    expect(prachiFinance).toBe(true);

    // 2. MAKEUP_ARTIST role does NOT hold finance.read
    const kavitaFinance = hasOrganizationPermission("user_kavita", "makeovers-by-prachi", "finance.read");
    expect(kavitaFinance).toBe(false);

    const artistPerms = getRolePermissions("MAKEUP_ARTIST");
    expect(artistPerms).toContain("bookings.read");
    expect(artistPerms).not.toContain("finance.export");
  });

  test("🛡️ Platform Admin privileges remain strictly separated from Organization roles", () => {
    const prachiPlatformAdmin = isPlatformAdmin("user_prachi");
    expect(prachiPlatformAdmin).toBe(false); // Organization OWNER is not platform admin

    const platformAdmin = isPlatformAdmin("user_platform_admin");
    expect(platformAdmin).toBe(true);
  });

  test("🏢 Public vs Private Organization Profile separation hides payment details", () => {
    const publicProfile = getPublicOrganizationProfile("makeovers-by-prachi");
    expect(publicProfile.name).toBeDefined();
    expect(publicProfile.contactEmail).toBeDefined();
    // Verify private billing/tax settings are absent from public profile
    expect((publicProfile as any).gstin).toBeUndefined();
    expect((publicProfile as any).accountNumberMasked).toBeUndefined();

    const privateSettings = getOrganizationSettings("makeovers-by-prachi");
    expect(privateSettings.cancellationPolicyText).toBeDefined();
  });

  test("✉️ Staff Invitation Workflow creates pending invite and accepts membership", () => {
    const invitation = createOrganizationInvitation({
      organizationId: "makeovers-by-prachi",
      inviteeEmail: "new.stylist@makeoversbyprachi.com",
      assignedRole: "HAIR_ARTIST",
      invitedByUid: "user_prachi",
    });

    expect(invitation.invitationId).toBeDefined();
    expect(invitation.status).toBe("PENDING");

    const membership = acceptOrganizationInvitation(invitation.invitationId, "user_new_stylist");
    expect(membership.role).toBe("HAIR_ARTIST");
    expect(membership.status).toBe("ACTIVE");

    const updatedMembers = getOrganizationMembers("makeovers-by-prachi");
    expect(updatedMembers.some((m) => m.uid === "user_new_stylist")).toBe(true);
  });

  test("💳 Tenant Payment Config & Vision AI VPA matching compares tenant VPA", () => {
    const paymentConfig = getOrganizationPaymentSettings("makeovers-by-prachi");
    expect(paymentConfig.upiVpa).toBe("makeoversbyprachi@upi");

    const validMatch = validateTenantUpiVpa("makeovers-by-prachi", "makeoversbyprachi@upi");
    expect(validMatch.isMatch).toBe(true);

    const invalidMatch = validateTenantUpiVpa("makeovers-by-prachi", "wrongdestination@upi");
    expect(invalidMatch.isMatch).toBe(false);
  });

  test("🚀 Deterministic Marketplace Readiness Score calculates 0-100% setup score", () => {
    const score = calculateMarketplaceReadinessScore("makeovers-by-prachi");
    expect(score.readinessScorePercent).toBe(100);
    expect(score.status).toBe("READY");

    const guidance = getAiOnboardingGuidance("makeovers-by-prachi");
    expect(guidance.aiAdvice).toContain("100% complete");
  });
});
