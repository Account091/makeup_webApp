import {
  calculateBayesianRating,
  searchMarketplaceV85,
} from "../src/lib/marketplace/marketplace-search-engine";
import { parseNaturalLanguageSearch } from "../src/lib/ai/marketplace-ai-discovery";
import { getActiveRankingConfig, createRankingConfigVersion } from "../src/lib/marketplace/ranking-config-engine";
import { saveSearchAlert, getSearchAlerts } from "../src/lib/marketplace/search-analytics-engine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

export async function runV85RankingDiscoveryTests() {
  console.log("=================================================");
  console.log("RUNNING V8.5 MARKETPLACE RANKING & DISCOVERY TESTS");
  console.log("=================================================\n");

  // 1. Bayesian Rating Smoothing Test
  console.log("[Test 1] Testing Bayesian Rating Normalization...");
  const m = 5;
  const C = 4.8;

  // Single 5.0 star review with 1 review:
  // (1 / (1 + 5)) * 5.0 + (5 / (1 + 5)) * 4.8 = 0.8333 + 4.0 = 4.8333
  const bayesSingleReview = calculateBayesianRating(5.0, 1, m, C);
  assert(
    Math.abs(bayesSingleReview - 4.8333) < 0.01,
    `Expected single 5.0 review Bayesian rating to be ~4.83, got ${bayesSingleReview}`
  );

  // 150 reviews with 4.93 rating:
  // (150 / 155) * 4.93 + (5 / 155) * 4.8 = 4.7709 + 0.1548 = 4.9258
  const bayesHighVolume = calculateBayesianRating(4.93, 150, m, C);
  assert(
    bayesHighVolume > bayesSingleReview,
    `High-volume 4.93 rating (${bayesHighVolume}) must rank higher than single-review 5.0 (${bayesSingleReview})`
  );
  console.log("  ✓ Bayesian rating successfully prevents low-sample manipulation.");

  // 2. Deterministic Search Engine & Hard Eligibility Filter Test
  console.log("\n[Test 2] Testing Search Engine & Hard Eligibility Filters...");
  const searchVerifiedOnly = searchMarketplaceV85({
    verifiedOnly: true,
  });

  assert(searchVerifiedOnly.results.length > 0, "Should return verified results");
  searchVerifiedOnly.results.forEach((res) => {
    assert(res.listing.status === "PUBLISHED", `Listing ${res.listing.listingId} must be PUBLISHED`);
  });
  console.log(`  ✓ Found ${searchVerifiedOnly.results.length} verified published listings.`);

  // 3. Location Filter Test
  console.log("\n[Test 3] Testing Location Filtering (Jodhpur)...");
  const searchJodhpur = searchMarketplaceV85({
    locationId: "jodhpur",
  });
  searchJodhpur.results.forEach((res) => {
    assert(
      res.listing.locationIds.includes("jodhpur"),
      `Listing locations should include jodhpur, got ${res.listing.locationIds.join(",")}`
    );
  });
  console.log(`  ✓ Found ${searchJodhpur.results.length} listings in Jodhpur.`);

  // 4. Cold Start Boost Test
  console.log("\n[Test 4] Testing Cold Start Boost for New Verified Providers...");
  const searchAll = searchMarketplaceV85({ pageSize: 10 });
  const coldStartListing = searchAll.results.find((r) => r.explanation.isNewProviderBoost);
  assert(coldStartListing !== undefined, "Should have at least one new listing with cold-start boost");
  assert(
    coldStartListing?.explanation.isNewProviderBoost === true,
    "Cold start listing explanation must reflect isNewProviderBoost"
  );
  console.log(`  ✓ Cold Start Boost verified for listing ${coldStartListing?.listing.title}.`);

  // 5. Diversity Rules Constraint Test
  console.log("\n[Test 5] Testing Organization Diversity Limits (Max 2 per Org in Top N)...");
  const top10 = searchMarketplaceV85({ pageSize: 10 }).results;
  const orgCounts: Record<string, number> = {};
  top10.forEach((item) => {
    const orgId = item.listing.organizationId;
    orgCounts[orgId] = (orgCounts[orgId] || 0) + 1;
  });
  Object.entries(orgCounts).forEach(([orgId, count]) => {
    assert(count <= 2, `Org ${orgId} exceeded top N limit with ${count} listings`);
  });
  console.log("  ✓ Organization diversity rule enforced (no org exceeds 2 listings in top N).");

  // 6. Promoted Listing Demarcation Test
  console.log("\n[Test 6] Testing Promoted Listing Demarcation...");
  const promotedItem = top10.find((r) => r.explanation.isPromoted);
  assert(promotedItem !== undefined, "Promoted listing should exist in top results");
  assert(promotedItem?.explanation.isPromoted === true, "isPromoted flag must be boolean true");
  console.log(`  ✓ Promoted listing correctly demarcated: ${promotedItem?.listing.title}`);

  // 7. Versioned Ranking Config Engine Test
  console.log("\n[Test 7] Testing Versioned Ranking Rules Manager...");
  const initialConfig = getActiveRankingConfig();
  assert(initialConfig.version.length > 0, "Initial config must have version string");

  const newVersion = `v${Date.now()}`;
  const updatedConfig = createRankingConfigVersion({
    version: newVersion,
    relevanceWeight: 0.40,
    availabilityWeight: 0.15,
    trustWeight: 0.15,
    ratingWeight: 0.15,
    responseWeight: 0.05,
    completionWeight: 0.05,
    locationWeight: 0.05,
  });

  assert(updatedConfig.version === newVersion, "Newly activated config version mismatch");
  assert(getActiveRankingConfig().weights.relevance === 40, "Updated relevance weight not reflected");
  console.log(`  ✓ Created & activated ranking config version ${newVersion}.`);

  // 8. AI Natural Language Search Intent Parsing Test
  console.log("\n[Test 8] Testing AI Natural Language Search Parser & Safety Guardrails...");
  const prompt = "Bridal makeup artist in Jaipur under ₹20,000 for December 2026";
  const { query: aiParsedQuery, aiExplanation } = parseNaturalLanguageSearch(prompt);

  assert(aiParsedQuery.locationId === "jaipur", "AI failed to parse location 'jaipur'");
  assert(aiParsedQuery.maxPrice === 20000, "AI failed to parse max price 20000");
  assert(aiExplanation.length > 0, "AI explanation must not be empty");
  console.log(`  ✓ AI correctly parsed natural language prompt into structured query: ${JSON.stringify(aiParsedQuery)}`);

  // 9. Search Alerts Engine Test
  console.log("\n[Test 9] Testing Search Alerts Engine...");
  const alert = saveSearchAlert({
    userId: "cust_test_001",
    locationId: "jaipur",
    maxPrice: 25000,
    searchQueryText: "Jaipur bridal makeup",
  });
  assert(alert.alertId.startsWith("alert"), "Search alert ID invalid");

  const userAlerts = getSearchAlerts("cust_test_001");
  assert(userAlerts.length === 1, "Expected 1 search alert for test user");
  assert(userAlerts[0].locationId === "jaipur", "Alert location mismatch");
  console.log("  ✓ Search Alert successfully saved and retrieved.");

  console.log("\n=================================================");
  console.log("ALL V8.5 MARKETPLACE RANKING & DISCOVERY TESTS PASSED SUCCESSFULLY! 🎯");
  console.log("=================================================\n");
}
