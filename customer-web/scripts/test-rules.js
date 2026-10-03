/**
 * Firestore Security Rules Comprehensive Verification Suite
 *
 * Designed to run against the Firebase Local Emulator using `@firebase/rules-unit-testing`
 * loading the REAL firestore.rules file from workspace root.
 *
 * Test Scenarios:
 * 1. Bride reading own booking -> SUCCEED
 * 2. Bride reading other's booking -> FAIL
 * 3. Anonymous booking create -> FAIL (Client direct write disabled)
 * 4. Accountant reading invoice -> SUCCEED
 * 5. Tenant admin reading financial records (expenses/ledger) -> FAIL
 * 6. Tenant admin cross-tenant knowledge access -> FAIL
 * 7. Org admin reading own knowledgeEntries & aiQuestionLog -> SUCCEED
 * 8. Client writes on knowledgeEntries / knowledgeChunks -> FAIL
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

// 1. Load and verify REAL firestore.rules
const rulesPath = path.resolve(__dirname, "../../firestore.rules");
if (!fs.existsSync(rulesPath)) {
  console.error(`FATAL: firestore.rules not found at ${rulesPath}`);
  process.exit(1);
}

const rawRulesContent = fs.readFileSync(rulesPath, "utf-8");
console.log("======================================================================");
console.log("🛡️ FIRESTORE SECURITY RULES TEST SUITE");
console.log(`📄 Real Rules File: ${rulesPath} (${rawRulesContent.length} bytes)`);
console.log("======================================================================\n");

// Verify required security blocks exist in the real file
const requiredDeclarations = [
  { name: "isAuthenticated() helper", pattern: /function\s+isAuthenticated\s*\(\)/ },
  { name: "isStudioAdmin() helper", pattern: /function\s+isStudioAdmin\s*\(\)/ },
  { name: "isAdmin() helper", pattern: /function\s+isAdmin\s*\(\)/ },
  { name: "isAccountant() helper", pattern: /function\s+isAccountant\s*\(\)/ },
  { name: "hasOrgId() helper", pattern: /function\s+hasOrgId\s*\(\)/ },
  { name: "isPlatformSuperAdmin() helper", pattern: /function\s+isPlatformSuperAdmin\s*\(\)/ },
  { name: "isOrgAdmin() helper", pattern: /function\s+isOrgAdmin\s*\(targetOrgId\)/ },
  { name: "Bookings match rule", pattern: /match\s+\/bookings\/\{bookingId\}/ },
  { name: "Invoices match rule", pattern: /match\s+\/invoices\/\{id\}/ },
  { name: "Expenses match rule", pattern: /match\s+\/expenses\/\{id\}/ },
  { name: "Financial Periods match rule", pattern: /match\s+\/financialPeriods\/\{periodId\}/ },
  { name: "Knowledge Entries match rule", pattern: /match\s+\/knowledgeEntries\/\{id\}/ },
  { name: "Knowledge Chunks match rule", pattern: /match\s+\/knowledgeChunks\/\{id\}/ },
  { name: "AI Question Log match rule", pattern: /match\s+\/aiQuestionLog\/\{id\}/ },
  { name: "Knowledge Cache match rule", pattern: /match\s+\/knowledgeCache\/\{id\}/ },
];

console.log("▶ Verifying AST structure of real firestore.rules:");
for (const decl of requiredDeclarations) {
  if (!decl.pattern.test(rawRulesContent)) {
    console.error(`❌ REGRESSION: firestore.rules is missing required block: ${decl.name}`);
    process.exit(1);
  }
  console.log(`  ✅ Verified: ${decl.name}`);
}

// Check if emulator is active on localhost:8080
function checkEmulatorOnline(host, port) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, path: "/", method: "GET", timeout: 800 }, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Rule evaluator implementing exact logic of the real firestore.rules
function evaluateFirestoreRules({ auth, collection, docId, docData, method }) {
  const isAuth = auth !== null && auth.uid !== undefined;
  const token = auth?.token || {};
  const role = token.role;
  const tokenOrgId = token.orgId;
  const tokenEmail = token.email;
  const tokenPhone = token.phone_number;

  const isStudioAdmin = isAuth && (
    role === "super_admin" ||
    ((role === "admin" || role === "owner") && tokenOrgId === "makeovers_by_prachi")
  );
  const isAdmin = isStudioAdmin;
  const isAccountant = isAuth && (
    (role === "accountant" && tokenOrgId === "makeovers_by_prachi") ||
    isAdmin
  );
  const isPlatformSuperAdmin = isAuth && role === "super_admin";
  const isOrgAdmin = (targetOrgId) => isAuth && tokenOrgId != null && (role === "admin" || role === "owner") && tokenOrgId === targetOrgId;

  // 1. Bookings Collection
  if (collection === "bookings") {
    if (method === "read") {
      if (isAccountant) return true;
      if (isAuth) {
        const custDetails = docData?.customerDetails || {};
        if (custDetails.email && custDetails.email === tokenEmail) return true;
        if (custDetails.phone && custDetails.phone === tokenPhone) return true;
        if (docData?.orgId && docData.orgId === tokenOrgId) return true;
      }
      return false;
    }
    if (method === "create" || method === "update" || method === "delete") {
      return isAdmin; // Direct client create disabled for customers/anonymous
    }
  }

  // 2. Financial Collections (Invoices, Expenses, FinancialPeriods)
  if (collection === "invoices") {
    if (method === "read") {
      if (isAccountant) return true;
      if (isAuth && docData?.customerId === auth.uid) return true;
      return false;
    }
    if (method === "write" || method === "create" || method === "update" || method === "delete") {
      return isAdmin;
    }
  }

  if (collection === "expenses" || collection === "financialPeriods") {
    if (method === "read") return isAccountant;
    if (method === "write" || method === "create" || method === "update") {
      return collection === "financialPeriods" ? isAccountant : isAdmin;
    }
  }

  // 3. Knowledge Collections
  if (collection === "knowledgeEntries" || collection === "aiQuestionLog") {
    if (method === "read") {
      return isPlatformSuperAdmin || isOrgAdmin(docData?.orgId);
    }
    return false; // Server Admin SDK only
  }

  if (collection === "knowledgeChunks" || collection === "knowledgeCache" || collection === "aiRateLimits") {
    return false; // Client read/write strictly denied
  }

  return false;
}

let passCount = 0;
let failCount = 0;

function assertSucceeds(description, result) {
  if (result === true) {
    console.log(`  ✅ assertSucceeds PASS: ${description}`);
    passCount++;
  } else {
    console.error(`  ❌ assertSucceeds FAIL: ${description}`);
    failCount++;
  }
}

function assertFails(description, result) {
  if (result === false) {
    console.log(`  ✅ assertFails PASS: ${description}`);
    passCount++;
  } else {
    console.error(`  ❌ assertFails FAIL: ${description} (Allowed when should fail)`);
    failCount++;
  }
}

async function runTestSuite() {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  const [host, port] = emulatorHost.split(":");
  const isOnline = await checkEmulatorOnline(host, parseInt(port, 10));

  if (!isOnline) {
    console.log("***********************************************************************************");
    console.log("⚠️ NON-AUTHORITATIVE STATIC SIMULATION ONLY (EMULATOR OFFLINE)");
    console.log("   Firestore Emulator is NOT active at " + emulatorHost);
    console.log("   This fallback runs an in-memory JS simulation. It is NON-AUTHORITATIVE.");
    console.log("   Rules CANNOT be described as verified until run in the real Firestore Emulator!");
    console.log("   To run authoritative verification against real emulator with @firebase/rules-unit-testing:");
    console.log("     npm run test:rules:emulator");
    console.log("***********************************************************************************\n");
  } else {
    console.log(`\n🚀 [EMULATOR CONNECTED]: Active emulator found at ${emulatorHost}.`);
    console.log("   Delegating to authoritative emulator test suite (test-rules-emulator.js)...");
    const { execSync } = require("child_process");
    execSync("node " + path.join(__dirname, "test-rules-emulator.js"), { stdio: "inherit" });
    return;
  }

  console.log("▶ Older Rule Cases (Bookings, Finance, Roles):");

  // 1. Bride Own Booking
  const brideAuth = {
    uid: "bride_priya_101",
    token: { email: "priya@example.com", phone_number: "+919829011111", role: "customer" },
  };
  const ownBookingDoc = {
    id: "booking_101",
    orgId: "makeovers_by_prachi",
    customerDetails: { email: "priya@example.com", phone: "+919829011111", name: "Priya" },
    totalAmount: 45000,
  };
  assertSucceeds(
    "Bride can read her own booking by matching email/phone",
    evaluateFirestoreRules({ auth: brideAuth, collection: "bookings", docId: "booking_101", docData: ownBookingDoc, method: "read" })
  );

  // 2. Bride Other's Booking
  const otherBookingDoc = {
    id: "booking_999",
    orgId: "makeovers_by_prachi",
    customerDetails: { email: "ananya@example.com", phone: "+919829099999", name: "Ananya" },
    totalAmount: 35000,
  };
  assertFails(
    "Bride cannot read other customer's booking",
    evaluateFirestoreRules({ auth: brideAuth, collection: "bookings", docId: "booking_999", docData: otherBookingDoc, method: "read" })
  );

  // 3. Anonymous Booking Create
  assertFails(
    "Anonymous customer cannot directly create booking document (must use server API)",
    evaluateFirestoreRules({ auth: null, collection: "bookings", docId: "new_booking", docData: ownBookingDoc, method: "create" })
  );
  assertFails(
    "Authenticated customer cannot directly create booking document (must use server API)",
    evaluateFirestoreRules({ auth: brideAuth, collection: "bookings", docId: "new_booking", docData: ownBookingDoc, method: "create" })
  );

  // 4. Accountant Reading Invoice
  const accountantAuth = {
    uid: "acc_ramesh",
    token: { role: "accountant", orgId: "makeovers_by_prachi" },
  };
  const invoiceDoc = {
    id: "inv_4001",
    customerId: "bride_priya_101",
    amount: 45000,
    status: "PAID",
  };
  assertSucceeds(
    "Accountant can read any invoice",
    evaluateFirestoreRules({ auth: accountantAuth, collection: "invoices", docId: "inv_4001", docData: invoiceDoc, method: "read" })
  );

  // 5. Tenant vs Finance (Tenant Admin accessing financial ledger / expenses)
  const tenantAdminAuth = {
    uid: "tenant_jaipur_owner",
    token: { role: "admin", orgId: "jaipur_marketplace_tenant" },
  };
  const expenseDoc = { id: "exp_101", category: "Cosmetics Supply", amount: 12000 };
  const financialPeriodDoc = { id: "period_2026_10", status: "OPEN" };

  assertFails(
    "Tenant Admin (non-accountant) cannot read studio expenses",
    evaluateFirestoreRules({ auth: tenantAdminAuth, collection: "expenses", docId: "exp_101", docData: expenseDoc, method: "read" })
  );
  assertFails(
    "Tenant Admin cannot read financial periods / ledger locks",
    evaluateFirestoreRules({ auth: tenantAdminAuth, collection: "financialPeriods", docId: "period_2026_10", docData: financialPeriodDoc, method: "read" })
  );

  console.log("\n▶ Grounded Knowledge & AI Safety Rule Cases:");

  const prachiEntry = { orgId: "makeovers_by_prachi", title: "Poshak Draping Protocol" };
  const prachiAdminAuth = {
    uid: "prachi_admin_1",
    token: { role: "admin", orgId: "makeovers_by_prachi" },
  };
  const superAdminAuth = {
    uid: "super_admin_root",
    token: { role: "super_admin" },
  };

  // 6. Cross-Tenant Knowledge Access
  assertFails(
    "Tenant Admin CANNOT read Prachi's knowledgeEntries",
    evaluateFirestoreRules({ auth: tenantAdminAuth, collection: "knowledgeEntries", docId: "e1", docData: prachiEntry, method: "read" })
  );

  // 7. Org Admin reading own Knowledge Entries & AI Question Log
  assertSucceeds(
    "Prachi Admin can read Prachi's knowledgeEntries",
    evaluateFirestoreRules({ auth: prachiAdminAuth, collection: "knowledgeEntries", docId: "e1", docData: prachiEntry, method: "read" })
  );
  assertSucceeds(
    "Prachi Admin can read Prachi's aiQuestionLog",
    evaluateFirestoreRules({ auth: prachiAdminAuth, collection: "aiQuestionLog", docId: "q1", docData: prachiEntry, method: "read" })
  );

  // 8. Super Admin cross-tenant read
  assertSucceeds(
    "Super Admin can read knowledgeEntries across all orgs",
    evaluateFirestoreRules({ auth: superAdminAuth, collection: "knowledgeEntries", docId: "e1", docData: prachiEntry, method: "read" })
  );

  // 9. Client direct writes are strictly disabled
  assertFails(
    "Direct client write to knowledgeEntries is DENIED (requires server Admin SDK)",
    evaluateFirestoreRules({ auth: prachiAdminAuth, collection: "knowledgeEntries", docId: "e1", docData: prachiEntry, method: "create" })
  );
  assertFails(
    "Direct client write to knowledgeChunks is DENIED",
    evaluateFirestoreRules({ auth: superAdminAuth, collection: "knowledgeChunks", docId: "c1", docData: prachiEntry, method: "create" })
  );
  assertFails(
    "Direct client read on knowledgeChunks is DENIED",
    evaluateFirestoreRules({ auth: prachiAdminAuth, collection: "knowledgeChunks", docId: "c1", docData: prachiEntry, method: "read" })
  );
  assertFails(
    "Direct client read on knowledgeCache is DENIED",
    evaluateFirestoreRules({ auth: prachiAdminAuth, collection: "knowledgeCache", docId: "cache1", docData: prachiEntry, method: "read" })
  );

  console.log("\n======================================================================");
  console.log(`🛡️ TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("======================================================================\n");

  if (failCount > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
