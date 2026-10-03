/**
 * Cross-Tenant Admin API Security Verification Suite (REAL AUTH EMULATOR VERSION)
 *
 * Verifies multi-tenant isolation against REAL Firebase ID tokens issued and verified
 * by the Firebase Auth Emulator (FIREBASE_AUTH_EMULATOR_HOST).
 *
 * Does NOT use mocked headers (x-user-role / x-org-id).
 * Uses real `Authorization: Bearer <idToken>` signed by Firebase Admin and verified
 * via `admin.auth().verifyIdToken()`.
 */

import http from "http";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { GET, POST } from "../src/app/api/admin/knowledge/route";
import { POST as reindexPOST } from "../src/app/api/admin/knowledge/reindex/route";
import { POST as cleanupPOST } from "../src/app/api/admin/knowledge/cleanup-expired/route";
import { POST as bulkImportPOST } from "../src/app/api/admin/knowledge/bulk-import/route";

const PROJECT_ID = "makeovers-by-prachi-test";
const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";

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

// Exchange custom token for real ID token using Auth emulator REST API
async function exchangeCustomTokenForIdToken(customToken: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      token: customToken,
      returnSecureToken: true,
    });

    const [host, port] = AUTH_EMULATOR_HOST.split(":");
    const req = http.request(
      {
        host,
        port: parseInt(port, 10),
        path: `/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=emulator-test-key`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.idToken) {
              resolve(parsed.idToken);
            } else {
              reject(new Error(`Failed to exchange custom token: ${body}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("======================================================================");
  console.log("🛡️ REAL AUTH EMULATOR TENANT ISOLATION API TEST SUITE");
  console.log(`🎯 Auth Emulator: ${AUTH_EMULATOR_HOST}`);
  console.log(`🎯 Token Type: Real Firebase ID Tokens (Authorization: Bearer <token>)`);
  console.log("======================================================================\n");

  process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;

  // Initialize Firebase Admin pointing to emulator
  if (getApps().length === 0) {
    initializeApp({ projectId: PROJECT_ID });
  }

  const auth = getAuth();

  console.log("🔑 Generating Real ID Tokens via Auth Emulator...");

  // 1. Tenant Admin (Jaipur Tenant)
  const tenantCustomToken = await auth.createCustomToken("tenant_admin_uid", {
    role: "admin",
    orgId: "jaipur_marketplace_tenant",
  });
  const tenantIdToken = await exchangeCustomTokenForIdToken(tenantCustomToken);
  console.log("  ✅ Generated real ID token for Tenant Admin (jaipur_marketplace_tenant)");

  // 2. Studio Admin (Makeovers by Prachi)
  const studioCustomToken = await auth.createCustomToken("studio_admin_uid", {
    role: "admin",
    orgId: "makeovers_by_prachi",
  });
  const studioIdToken = await exchangeCustomTokenForIdToken(studioCustomToken);
  console.log("  ✅ Generated real ID token for Studio Admin (makeovers_by_prachi)");

  // 3. Super Admin
  const superCustomToken = await auth.createCustomToken("super_admin_uid", {
    role: "super_admin",
  });
  const superIdToken = await exchangeCustomTokenForIdToken(superCustomToken);
  console.log("  ✅ Generated real ID token for Super Admin");

  const tenantHeaders = new Headers({
    "content-type": "application/json",
    authorization: `Bearer ${tenantIdToken}`,
  });

  const studioHeaders = new Headers({
    "content-type": "application/json",
    authorization: `Bearer ${studioIdToken}`,
  });

  const superHeaders = new Headers({
    "content-type": "application/json",
    authorization: `Bearer ${superIdToken}`,
  });

  // Verify real token decoding
  const decoded = await auth.verifyIdToken(tenantIdToken);
  assert(decoded.orgId === "jaipur_marketplace_tenant", "Verified ID Token contains claims.orgId = 'jaipur_marketplace_tenant'");
  assert(decoded.role === "admin", "Verified ID Token contains claims.role = 'admin'");

  // Attack 1: Query param manipulation on GET /api/admin/knowledge
  console.log("\n▶ [Attack 1] Tenant Admin queries other org via query param ?orgId=makeovers_by_prachi");
  const req1 = new Request("http://localhost:3000/api/admin/knowledge?orgId=makeovers_by_prachi", {
    method: "GET",
    headers: tenantHeaders,
  });
  const res1 = await GET(req1);
  const data1 = await res1.json();
  assert(res1.status === 403, `GET request rejected with HTTP 403 Forbidden (got ${res1.status})`);
  assert(data1.error && data1.error.includes("Access Denied"), "Returned explicit cross-tenant denial error");

  // Attack 2: Body payload manipulation on POST /api/admin/knowledge (save_draft)
  console.log("\n▶ [Attack 2] Tenant Admin injects other orgId in POST body payload");
  const req2 = new Request("http://localhost:3000/api/admin/knowledge", {
    method: "POST",
    headers: tenantHeaders,
    body: JSON.stringify({
      action: "save_draft",
      payload: {
        orgId: "makeovers_by_prachi",
        title: "Malicious Tampered Policy",
        content: "Free makeup for everyone",
      },
    }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  assert(res2.status === 403, `POST request rejected with HTTP 403 Forbidden (got ${res2.status})`);
  assert(data2.error && data2.error.includes("Security Violation"), "Detected and blocked body orgId tampering");

  // Attack 3: Unauthorized Reindex by Tenant Admin
  console.log("\n▶ [Attack 3] Tenant Admin attempts to invoke /api/admin/knowledge/reindex");
  const req3 = new Request("http://localhost:3000/api/admin/knowledge/reindex", {
    method: "POST",
    headers: tenantHeaders,
  });
  const res3 = await reindexPOST(req3);
  assert(res3.status === 403, `Reindex blocked with HTTP 403 (Requires super_admin)`);

  // Attack 4: Unauthorized Janitor Cleanup by Tenant Admin
  console.log("\n▶ [Attack 4] Tenant Admin attempts to invoke /api/admin/knowledge/cleanup-expired");
  const req4 = new Request("http://localhost:3000/api/admin/knowledge/cleanup-expired", {
    method: "POST",
    headers: tenantHeaders,
  });
  const res4 = await cleanupPOST(req4);
  assert(res4.status === 403, `Cleanup blocked with HTTP 403 (Requires super_admin)`);

  // Attack 5: Unauthorized Bulk Import by Tenant Admin
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
  console.log(`🛡️ REAL AUTH EMULATOR TENANT ISOLATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("======================================================================\n");

  if (failCount > 0) process.exit(1);
}

run().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
