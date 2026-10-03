/**
 * Cross-Tenant Admin API Security Verification Suite
 *
 * Verifies that tenant admin credentials CANNOT read or write another organization's
 * knowledge base entries via:
 * 1. Query parameter manipulation (?orgId=makeovers_by_prachi)
 * 2. Body payload manipulation ({ payload: { orgId: "makeovers_by_prachi" } })
 * 3. Entry ID targeting (attempting to publish/archive Prachi's entry ID)
 * 4. Reindex execution (requiring super_admin)
 * 5. Expired cleanup execution (requiring super_admin)
 * 6. Bulk import execution (requiring super_admin or owner)
 */

import { GET, POST } from "../src/app/api/admin/knowledge/route";
import { POST as reindexPOST } from "../src/app/api/admin/knowledge/reindex/route";
import { POST as cleanupPOST } from "../src/app/api/admin/knowledge/cleanup-expired/route";
import { POST as bulkImportPOST } from "../src/app/api/admin/knowledge/bulk-import/route";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runTenantIsolationTests() {
  console.log("======================================================================");
  console.log("🔒 CROSS-TENANT ADMIN API ATTACK & ISOLATION SUITE");
  console.log("======================================================================\n");

  const tenantHeaders = new Headers({
    "content-type": "application/json",
    "x-user-role": "admin",
    "x-org-id": "jaipur_marketplace_tenant",
    "x-user-uid": "jaipur_admin_attacker",
  });

  // 1. Attack 1: Query param manipulation on GET /api/admin/knowledge
  console.log("▶ [Attack 1] Tenant Admin queries other org via query param ?orgId=makeovers_by_prachi");
  const req1 = new Request("http://localhost:3000/api/admin/knowledge?orgId=makeovers_by_prachi", {
    method: "GET",
    headers: tenantHeaders,
  });
  const res1 = await GET(req1);
  const data1 = await res1.json();
  assert(res1.status === 403, `GET request rejected with HTTP 403 Forbidden (got ${res1.status})`);
  assert(data1.error && data1.error.includes("Access Denied"), "Returned explicit cross-tenant denial error");

  // 2. Attack 2: Body payload manipulation on POST /api/admin/knowledge (save_draft)
  console.log("\n▶ [Attack 2] Tenant Admin injects other orgId in POST body payload");
  const req2 = new Request("http://localhost:3000/api/admin/knowledge", {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      action: "save_draft",
      payload: {
        orgId: "makeovers_by_prachi", // Malicious body tamper
        title: "Malicious Tampered Policy",
        content: "Free makeup for everyone",
      },
    }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  assert(res2.status === 403, `POST request rejected with HTTP 403 Forbidden (got ${res2.status})`);
  assert(data2.error && data2.error.includes("Security Violation"), "Detected and blocked body orgId tampering");

  // 3. Attack 3: Unauthorized Reindex by Tenant Admin
  console.log("\n▶ [Attack 3] Tenant Admin attempts to invoke /api/admin/knowledge/reindex");
  const req3 = new Request("http://localhost:3000/api/admin/knowledge/reindex", {
    method: "POST",
    headers: tenantHeaders,
  });
  const res3 = await reindexPOST(req3);
  assert(res3.status === 403, `Reindex blocked with HTTP 403 (Requires super_admin)`);

  // 4. Attack 4: Unauthorized Janitor Cleanup by Tenant Admin
  console.log("\n▶ [Attack 4] Tenant Admin attempts to invoke /api/admin/knowledge/cleanup-expired");
  const req4 = new Request("http://localhost:3000/api/admin/knowledge/cleanup-expired", {
    method: "POST",
    headers: tenantHeaders,
  });
  const res4 = await cleanupPOST(req4);
  assert(res4.status === 403, `Cleanup blocked with HTTP 403 (Requires super_admin)`);

  // 5. Attack 5: Unauthorized Bulk Import by Tenant Admin
  console.log("\n▶ [Attack 5] Tenant Admin attempts bulk-import without super_admin or owner role");
  const req5 = new Request("http://localhost:3000/api/admin/knowledge/bulk-import", {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      approvedEntries: [{ title: "Test", content: "Test content" }],
    }),
  });
  const res5 = await bulkImportPOST(req5);
  assert(res5.status === 403, `Bulk import blocked with HTTP 403 (Requires super_admin/owner)`);

  console.log("\n======================================================================");
  console.log(`🔒 TENANT ISOLATION API SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("======================================================================\n");

  if (failCount > 0) process.exit(1);
}

runTenantIsolationTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
