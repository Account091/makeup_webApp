import { hasOrganizationPermission, getRolePermissions, isPlatformAdmin } from "../src/lib/marketplace/tenant-permissions";
import { getPublicOrganizationProfile, getOrganizationSettings } from "../src/lib/marketplace/tenant-settings-engine";
import { createOrganizationInvitation, acceptOrganizationInvitation, getOrganizationMembers } from "../src/lib/marketplace/tenant-members-engine";
import { getOrganizationPaymentSettings, validateTenantUpiVpa } from "../src/lib/marketplace/tenant-payment-config";
import { calculateMarketplaceReadinessScore, getAiOnboardingGuidance } from "../src/lib/marketplace/tenant-onboarding-engine";

async function runV81Tests() {
  console.log("=========================================");
  console.log("🏢 Running V8.1 Advanced Multi-Tenant Operations Test Suite");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Role Permission Matrix
  console.log("--- 1. Testing Role Permission Matrix & Fine-Grained Rules ---");
  const prachiFinance = hasOrganizationPermission("user_prachi", "makeovers-by-prachi", "finance.read");
  assert(prachiFinance === true, "OWNER holds 'finance.read' permission");

  const kavitaFinance = hasOrganizationPermission("user_kavita", "makeovers-by-prachi", "finance.read");
  assert(kavitaFinance === false, "MAKEUP_ARTIST role does NOT hold 'finance.read' permission");

  const artistPerms = getRolePermissions("MAKEUP_ARTIST");
  assert(artistPerms.includes("bookings.read") && !artistPerms.includes("finance.export"), "MAKEUP_ARTIST permissions scoped correctly");

  // 2. Platform Admin vs Org Roles Separation
  console.log("\n--- 2. Testing Platform Admin vs Org Roles Separation ---");
  assert(isPlatformAdmin("user_prachi") === false, "Organization OWNER 'user_prachi' is NOT a platform admin");
  assert(isPlatformAdmin("user_platform_admin") === true, "Platform Admin 'user_platform_admin' holds platform superadmin role");

  // 3. Public vs Private Profile Separation
  console.log("\n--- 3. Testing Public vs Private Profile Separation ---");
  const publicProfile = getPublicOrganizationProfile("makeovers-by-prachi");
  assert(!!publicProfile.name, "Public profile exposes business name");
  assert((publicProfile as any).gstin === undefined, "Public profile strictly hides GSTIN tax details");

  // 4. Staff Invitation Workflow
  console.log("\n--- 4. Testing Staff Invitation Workflow ---");
  const invitation = createOrganizationInvitation({
    organizationId: "makeovers-by-prachi",
    inviteeEmail: "new.stylist@makeoversbyprachi.com",
    assignedRole: "HAIR_ARTIST",
    invitedByUid: "user_prachi",
  });
  assert(invitation.status === "PENDING", "Invitation status is 'PENDING'");

  const membership = acceptOrganizationInvitation(invitation.invitationId, "user_new_stylist");
  assert(membership.role === "HAIR_ARTIST" && membership.status === "ACTIVE", "Invitee acceptance creates active membership");

  // 5. Tenant Payment Config & Vision AI VPA Validation
  console.log("\n--- 5. Testing Tenant Payment Config & VPA Validation ---");
  const paymentConfig = getOrganizationPaymentSettings("makeovers-by-prachi");
  assert(paymentConfig.upiVpa === "makeoversbyprachi@upi", "Tenant configured UPI VPA is 'makeoversbyprachi@upi'");

  const validMatch = validateTenantUpiVpa("makeovers-by-prachi", "makeoversbyprachi@upi");
  assert(validMatch.isMatch === true, "Screenshot VPA match against tenant VPA succeeds");

  const invalidMatch = validateTenantUpiVpa("makeovers-by-prachi", "wrongdestination@upi");
  assert(invalidMatch.isMatch === false, "Screenshot VPA mismatch strictly fails validation");

  // 6. Deterministic Readiness Score & AI Guidance
  console.log("\n--- 6. Testing Deterministic Readiness Score ---");
  const score = calculateMarketplaceReadinessScore("makeovers-by-prachi");
  assert(score.readinessScorePercent === 100, `Marketplace Readiness Score = ${score.readinessScorePercent}% (Expected: 100%)`);
  assert(score.status === "READY", "Marketplace status is 'READY'");

  const guidance = getAiOnboardingGuidance("makeovers-by-prachi");
  assert(guidance.aiAdvice.includes("100% complete"), "AI Onboarding guidance reflects 100% completion");

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV81Tests();
