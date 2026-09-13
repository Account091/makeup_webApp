import { verifyTenantAuthorization, TenantSecurityError } from "../src/lib/marketplace/tenant-isolation";
import { getOrganizations, createOrganization, migrateLegacyDataToTenant } from "../src/lib/marketplace/organization-engine";
import { searchMarketplace, getArtistBySlug } from "../src/lib/marketplace/marketplace-catalog-engine";
import { calculateCommissionBreakdown, recordCommissionTransaction, recordCommissionReversal } from "../src/lib/marketplace/commission-engine";
import { calculateTrustScore, submitVerifiedReview } from "../src/lib/marketplace/trust-review-engine";
import { buildRoleScopedContext } from "../src/lib/ai/context-builder";

async function runV80Tests() {
  console.log("=========================================");
  console.log("🏪 Running V8.0 Marketplace Foundation Test Suite");
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

  // 1. Tenant Isolation Security
  console.log("--- 1. Testing Tenant Security Isolation ---");
  const membership = verifyTenantAuthorization("user_prachi", "makeovers-by-prachi");
  assert(membership.organizationId === "makeovers-by-prachi", "Authorized user resolves organizationId 'makeovers-by-prachi'");
  assert(membership.role === "OWNER", "User role is 'OWNER'");

  let securityBlocked = false;
  try {
    verifyTenantAuthorization("user_artist_jaipur", "makeovers-by-prachi");
  } catch (err: any) {
    if (err instanceof TenantSecurityError || err.message.includes("Access Denied")) {
      securityBlocked = true;
    }
  }
  assert(securityBlocked, "Cross-tenant access attempt strictly blocked with TenantSecurityError");

  // 2. Data Migration & Organization Management
  console.log("\n--- 2. Testing Data Migration & Organization Engine ---");
  const migration = migrateLegacyDataToTenant();
  assert(migration.migratedBookingsCount === 42, `Migrated bookings count = ${migration.migratedBookingsCount} (Expected: 42)`);
  assert(migration.missingOrgIdCount === 0, "Missing organization IDs count = 0");

  const orgs = getOrganizations();
  assert(orgs.length >= 2, `Registered organizations count = ${orgs.length} >= 2`);
  const newOrg = createOrganization({
    name: "Udaipur Heritage Glam",
    slug: "udaipur-heritage-glam",
    type: "STUDIO",
    contactEmail: "udaipur@heritageglam.com",
    contactPhone: "+91-98292-22222",
    city: "Udaipur",
    ownerUid: "user_udaipur_owner",
  });
  assert(newOrg.organization.organizationId === "udaipur-heritage-glam", "New tenant created with ID 'udaipur-heritage-glam'");

  // 3. Marketplace Discovery & Search
  console.log("\n--- 3. Testing Marketplace Search & Artist Catalog ---");
  const searchResult = searchMarketplace({ city: "jaipur", serviceCategory: "BRIDAL", verifiedOnly: true });
  assert(searchResult.artists.length > 0, "Jaipur bridal search returned verified artists");
  const prachi = getArtistBySlug("prachi-rathore");
  assert(prachi?.displayName === "Prachi Rathore", "Artist profile lookup for 'prachi-rathore' succeeded");

  // 4. Commission Engine & Append-Only Ledger
  console.log("\n--- 4. Testing Commission Engine & Ledger ---");
  const breakdown = calculateCommissionBreakdown(25000);
  assert(breakdown.grossAmount === 25000, "Gross Amount = ₹25,000");
  assert(breakdown.platformCommission === 2500, `Platform Fee (10%) = ₹${breakdown.platformCommission} (Expected: ₹2,500)`);
  assert(breakdown.gatewayFee === 500, `Gateway Fee (2%) = ₹${breakdown.gatewayFee} (Expected: ₹500)`);
  assert(breakdown.artistShare === 22000, `Net Artist Share (88%) = ₹${breakdown.artistShare} (Expected: ₹22,000)`);

  const tx = recordCommissionTransaction({
    bookingId: "bk_test_80",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    grossAmount: 25000,
  });
  assert(!!tx.id, "Append-only commission ledger transaction created");
  const reversal = recordCommissionReversal(tx.id, "Test refund reversal");
  assert(reversal.artistShare === -22000, "Reversal transaction reverses net artist share (-₹22,000)");

  // 5. Trust Score & Verified Review Security
  console.log("\n--- 5. Testing Trust Score & Verified Review Rules ---");
  const trust = calculateTrustScore({
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    completedBookingsCount: 50,
    cancellationRatePercent: 1.0,
    responseRatePercent: 98,
    ratingAverage: 4.95,
    disputeCount: 0,
    isVerified: true,
  });
  assert(trust.overallTrustScore >= 90, `Trust Score = ${trust.overallTrustScore} >= 90`);
  assert(trust.badge === "TOP_RATED", "Trust Badge = 'TOP_RATED'");

  let reviewSubmitted = false;
  try {
    const rev = submitVerifiedReview({
      bookingId: "bk_verified_new",
      customerId: "cust_priya",
      rating: 5,
      reviewText: "Outstanding experience!",
    });
    reviewSubmitted = rev.verifiedBooking;
  } catch (e) {
    reviewSubmitted = false;
  }
  assert(reviewSubmitted, "Verified booking review submission succeeded");

  let fakeReviewBlocked = false;
  try {
    submitVerifiedReview({
      bookingId: "bk_fake_invalid",
      customerId: "cust_fake",
      rating: 5,
      reviewText: "Fake review attempt",
    });
  } catch (e) {
    fakeReviewBlocked = true;
  }
  assert(fakeReviewBlocked, "Unverified/fake booking review attempt strictly blocked");

  // 6. Tenant-Aware AI Gateway Context
  console.log("\n--- 6. Testing Tenant-Aware AI Gateway Context ---");
  const aiContext = await buildRoleScopedContext("ADMIN_COPILOT", {
    uid: "user_prachi",
    role: "OWNER",
    organizationId: "makeovers-by-prachi",
    requestId: "req_test_ai_v80",
  });
  assert(aiContext.contextData.tenantOrganizationId === "makeovers-by-prachi", "AI context includes tenantOrganizationId 'makeovers-by-prachi'");
  assert(aiContext.systemPrompt.includes("TENANT ISOLATION BOUNDARY"), "AI system prompt contains TENANT ISOLATION BOUNDARY instruction");

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV80Tests();
