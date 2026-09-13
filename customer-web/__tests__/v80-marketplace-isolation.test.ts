import { verifyTenantAuthorization, TenantSecurityError } from "../src/lib/marketplace/tenant-isolation";
import { getOrganizations, createOrganization, migrateLegacyDataToTenant } from "../src/lib/marketplace/organization-engine";
import { searchMarketplace, getArtistBySlug } from "../src/lib/marketplace/marketplace-catalog-engine";
import { calculateCommissionBreakdown, recordCommissionTransaction, recordCommissionReversal } from "../src/lib/marketplace/commission-engine";
import { calculateTrustScore, submitVerifiedReview } from "../src/lib/marketplace/trust-review-engine";
import { buildRoleScopedContext } from "../src/lib/ai/context-builder";

describe("V8.0 Marketplace Foundation & Multi-Tenant Architecture", () => {
  test("🔒 Tenant Security Isolation prevents cross-tenant access", () => {
    // 1. Authorized access succeeds
    const membership = verifyTenantAuthorization("user_prachi", "makeovers-by-prachi");
    expect(membership.organizationId).toBe("makeovers-by-prachi");
    expect(membership.role).toBe("OWNER");

    // 2. Unauthorized cross-tenant attempt throws TenantSecurityError
    expect(() => {
      verifyTenantAuthorization("user_artist_jaipur", "makeovers-by-prachi");
    }).toThrow(TenantSecurityError);
  });

  test("📦 Legacy Data Migration tags existing records with makeovers-by-prachi", () => {
    const migration = migrateLegacyDataToTenant();
    expect(migration.migratedBookingsCount).toBe(42);
    expect(migration.migratedCustomersCount).toBe(128);
    expect(migration.missingOrgIdCount).toBe(0);
  });

  test("🏢 Organization engine handles creation & tenant listings", () => {
    const orgs = getOrganizations();
    expect(orgs.length).toBeGreaterThanOrEqual(2);

    const newOrg = createOrganization({
      name: "Udaipur Heritage Glam",
      slug: "udaipur-heritage-glam",
      type: "STUDIO",
      contactEmail: "udaipur@heritageglam.com",
      contactPhone: "+91-98292-22222",
      city: "Udaipur",
      ownerUid: "user_udaipur_owner",
    });

    expect(newOrg.organization.organizationId).toBe("udaipur-heritage-glam");
    expect(newOrg.membership.role).toBe("OWNER");
  });

  test("🔍 Marketplace Catalog Search filters by city, category, and verified badge", () => {
    const searchResult = searchMarketplace({
      city: "jaipur",
      serviceCategory: "BRIDAL",
      verifiedOnly: true,
    });

    expect(searchResult.artists.length).toBeGreaterThan(0);
    const prachi = searchResult.artists.find((a) => a.artistId === "artist_prachi");
    expect(prachi?.verified).toBe(true);

    const slugArtist = getArtistBySlug("prachi-rathore");
    expect(slugArtist?.displayName).toBe("Prachi Rathore");
  });

  test("💰 Commission Engine calculates 10% platform, 2% gateway, 88% net artist share", () => {
    const breakdown = calculateCommissionBreakdown(25000);
    expect(breakdown.grossAmount).toBe(25000);
    expect(breakdown.platformCommission).toBe(2500); // 10%
    expect(breakdown.gatewayFee).toBe(500); // 2%
    expect(breakdown.artistShare).toBe(22000); // 88%
    expect(breakdown.ruleVersion).toBe("1.0");

    const tx = recordCommissionTransaction({
      bookingId: "bk_test_80",
      organizationId: "makeovers-by-prachi",
      artistId: "artist_prachi",
      grossAmount: 25000,
    });

    expect(tx.id).toBeDefined();
    expect(tx.artistShare).toBe(22000);

    const reversal = recordCommissionReversal(tx.id, "Test refund reversal");
    expect(reversal.grossAmount).toBe(-25000);
    expect(reversal.artistShare).toBe(-22000);
    expect(reversal.isReversal).toBe(true);
  });

  test("⭐ Trust Score & Verified Review Security blocks unverified/fake reviews", () => {
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

    expect(trust.overallTrustScore).toBeGreaterThanOrEqual(90);
    expect(trust.badge).toBe("TOP_RATED");

    // Verified review submission succeeds
    const review = submitVerifiedReview({
      bookingId: "bk_verified_new",
      customerId: "cust_priya",
      rating: 5,
      reviewText: "Outstanding experience!",
    });
    expect(review.verifiedBooking).toBe(true);

    // Unverified booking review attempt fails
    expect(() => {
      submitVerifiedReview({
        bookingId: "bk_fake_invalid",
        customerId: "cust_fake",
        rating: 5,
        reviewText: "Fake review attempt",
      });
    }).toThrow();
  });

  test("🤖 Tenant-Aware AI Gateway context enforces tenant isolation boundary", async () => {
    const context = await buildRoleScopedContext("ADMIN_COPILOT", {
      uid: "user_prachi",
      role: "OWNER",
      organizationId: "makeovers-by-prachi",
      requestId: "req_test_ai_v80",
    });

    expect(context.contextData.tenantOrganizationId).toBe("makeovers-by-prachi");
    expect(context.systemPrompt).toContain("TENANT ISOLATION BOUNDARY: Scoped strictly to Organization ID 'makeovers-by-prachi'");
  });
});
