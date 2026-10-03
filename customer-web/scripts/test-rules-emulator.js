/**
 * REAL Firestore Security Rules Unit Test Suite
 *
 * Runs exclusively through `@firebase/rules-unit-testing` against the real Firestore Emulator
 * loading the REAL firestore.rules file from repository root.
 * Uses real `assertSucceeds` and `assertFails` assertions on live emulator document operations.
 */

const fs = require("fs");
const path = require("path");
const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");

const rulesPath = path.resolve(__dirname, "../../firestore.rules");
if (!fs.existsSync(rulesPath)) {
  console.error(`FATAL: firestore.rules not found at ${rulesPath}`);
  process.exit(1);
}

const rulesContent = fs.readFileSync(rulesPath, "utf-8");
const PROJECT_ID = "makeovers-by-prachi-test";

let testEnv;
let passCount = 0;
let failCount = 0;

async function check(description, promise, expectedSuccess) {
  try {
    if (expectedSuccess) {
      await assertSucceeds(promise);
      console.log(`  ✅ assertSucceeds PASS: ${description}`);
    } else {
      await assertFails(promise);
      console.log(`  ✅ assertFails PASS: ${description}`);
    }
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

async function run() {
  console.log("======================================================================");
  console.log("🛡️ REAL FIRESTORE RULES UNIT TEST SUITE (EMULATOR + RULES-UNIT-TESTING)");
  console.log(`📄 Rules File: ${rulesPath} (${rulesContent.length} bytes)`);
  console.log(`🎯 Emulator Host: ${process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080"}`);
  console.log("======================================================================\n");

  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rulesContent,
      host: host || "127.0.0.1",
      port: parseInt(port || "8080", 10),
    },
  });

  // Seed documents via admin context (bypassing rules)
  console.log("🌱 Seeding test documents via withSecurityRulesDisabled...");
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    // 1. Bookings
    await adminDb.doc("bookings/booking_own").set({
      orgId: "makeovers_by_prachi",
      customerDetails: { email: "priya@example.com", phone: "+919829011111", name: "Priya" },
      service: "Royal Rajputi Signature",
    });
    await adminDb.doc("bookings/booking_other").set({
      orgId: "makeovers_by_prachi",
      customerDetails: { email: "ananya@example.com", phone: "+919829099999", name: "Ananya" },
      service: "Palace HD Bridal",
    });

    // 2. Invoices & Expenses & Periods
    await adminDb.doc("invoices/inv_4001").set({
      customerId: "priya_uid",
      amount: 45000,
      status: "PAID",
    });
    await adminDb.doc("expenses/exp_101").set({
      category: "Cosmetics Supply",
      amount: 12000,
    });
    await adminDb.doc("financialPeriods/period_2026_10").set({
      status: "OPEN",
    });
    await adminDb.doc("payments/pay_101").set({
      customerId: "priya_uid",
      amount: 15000,
    });

    // 3. Knowledge Base
    await adminDb.doc("knowledgeEntries/e_prachi").set({
      orgId: "makeovers_by_prachi",
      title: "Poshak Draping Protocol",
      status: "published",
    });
    await adminDb.doc("knowledgeEntries/e_tenant").set({
      orgId: "jaipur_marketplace_tenant",
      title: "Salon Hair Cut",
      status: "published",
    });
    await adminDb.doc("aiQuestionLog/q_prachi").set({
      orgId: "makeovers_by_prachi",
      question: "Sample Question",
    });
    await adminDb.doc("knowledgeChunks/c1").set({
      orgId: "makeovers_by_prachi",
      title: "Chunk 1",
    });

    // 4. Artists, Support, Orders
    await adminDb.doc("artists/artist_1").set({
      name: "Prachi",
      city: "Jodhpur",
    });
    await adminDb.doc("supportTickets/ticket_priya").set({
      customerId: "priya_uid",
      subject: "Poshak trial date query",
    });
    await adminDb.doc("orders/order_priya").set({
      customerId: "priya_uid",
      items: ["Sindoor", "Bindi Set"],
    });
  });

  console.log("✅ Seed completed. Executing real security rule evaluations against live emulator...\n");

  // Create Authenticated Contexts
  const anonDb = testEnv.unauthenticatedContext().firestore();

  const brideDb = testEnv
    .authenticatedContext("priya_uid", {
      email: "priya@example.com",
      phone_number: "+919829011111",
      role: "customer",
    })
    .firestore();

  const otherCustomerDb = testEnv
    .authenticatedContext("ananya_uid", {
      email: "ananya@example.com",
      phone_number: "+919829099999",
      role: "customer",
    })
    .firestore();

  const accountantDb = testEnv
    .authenticatedContext("accountant_uid", {
      email: "accounts@makeoversbyprachi.com",
      role: "accountant",
      orgId: "makeovers_by_prachi",
    })
    .firestore();

  const studioAdminDb = testEnv
    .authenticatedContext("admin_uid", {
      email: "admin@makeoversbyprachi.com",
      role: "admin",
      orgId: "makeovers_by_prachi",
    })
    .firestore();

  const adminWithoutOrgIdDb = testEnv
    .authenticatedContext("rogue_admin_uid", {
      email: "rogue@example.com",
      role: "admin",
      // NO orgId!
    })
    .firestore();

  const tenantAdminDb = testEnv
    .authenticatedContext("tenant_admin_uid", {
      email: "admin@jaipurtenant.com",
      role: "admin",
      orgId: "jaipur_marketplace_tenant",
    })
    .firestore();

  const superAdminDb = testEnv
    .authenticatedContext("super_uid", {
      email: "super@platform.com",
      role: "super_admin",
    })
    .firestore();

  // =========================================================================
  // SECTION 1: BOOKINGS SECURITY
  // =========================================================================
  console.log("▶ [Category 1] Bookings Collection:");
  await check(
    "Bride can read her own booking by matching customerDetails.email",
    brideDb.doc("bookings/booking_own").get(),
    true
  );
  await check(
    "Bride CANNOT read another customer's booking",
    brideDb.doc("bookings/booking_other").get(),
    false
  );
  await check(
    "Anonymous customer CANNOT directly create booking document",
    anonDb.doc("bookings/new_booking_anon").set({ service: "Tampered Bridal" }),
    false
  );
  await check(
    "Authenticated bride CANNOT directly create booking document (must use server API)",
    brideDb.doc("bookings/new_booking_bride").set({ service: "Tampered Bridal" }),
    false
  );
  await check(
    "Studio Admin can create booking via Admin SDK / admin token",
    studioAdminDb.doc("bookings/new_booking_admin").set({ orgId: "makeovers_by_prachi", customerDetails: { email: "test@example.com" } }),
    true
  );

  // =========================================================================
  // SECTION 2: FINANCE & ACCOUNTING
  // =========================================================================
  console.log("\n▶ [Category 2] Financial Security (Invoices, Expenses, Periods, Payments):");
  await check(
    "Accountant can read any invoice",
    accountantDb.doc("invoices/inv_4001").get(),
    true
  );
  await check(
    "Customer can read their own invoice",
    brideDb.doc("invoices/inv_4001").get(),
    true
  );
  await check(
    "Other customer CANNOT read Priya's invoice",
    otherCustomerDb.doc("invoices/inv_4001").get(),
    false
  );
  await check(
    "Tenant Admin CANNOT read studio expenses",
    tenantAdminDb.doc("expenses/exp_101").get(),
    false
  );
  await check(
    "Tenant Admin CANNOT read studio financial periods / ledger locks",
    tenantAdminDb.doc("financialPeriods/period_2026_10").get(),
    false
  );
  await check(
    "Tenant Admin CANNOT read studio payments belonging to other customers",
    tenantAdminDb.doc("payments/pay_101").get(),
    false
  );
  await check(
    "Studio Admin can read studio expenses",
    studioAdminDb.doc("expenses/exp_101").get(),
    true
  );

  // =========================================================================
  // SECTION 3: ORG_ID ENFORCEMENT & REMOVED !hasOrgId() ALLOWANCE
  // =========================================================================
  console.log("\n▶ [Category 3] Enforced orgId & Removed !hasOrgId() Allowance:");
  await check(
    "Admin token WITHOUT orgId claim CANNOT access studio expenses (Proof !hasOrgId removed)",
    adminWithoutOrgIdDb.doc("expenses/exp_101").get(),
    false
  );
  await check(
    "Admin token WITHOUT orgId claim CANNOT access knowledgeEntries",
    adminWithoutOrgIdDb.doc("knowledgeEntries/e_prachi").get(),
    false
  );

  // =========================================================================
  // SECTION 4: GROUNDED KNOWLEDGE BASE & AI SAFETY
  // =========================================================================
  console.log("\n▶ [Category 4] Grounded Knowledge Base & Multi-Tenancy:");
  await check(
    "Tenant Admin CANNOT read Prachi's knowledgeEntries",
    tenantAdminDb.doc("knowledgeEntries/e_prachi").get(),
    false
  );
  await check(
    "Tenant Admin CAN read own tenant's knowledgeEntries",
    tenantAdminDb.doc("knowledgeEntries/e_tenant").get(),
    true
  );
  await check(
    "Prachi Admin can read Prachi's knowledgeEntries",
    studioAdminDb.doc("knowledgeEntries/e_prachi").get(),
    true
  );
  await check(
    "Prachi Admin can read Prachi's aiQuestionLog",
    studioAdminDb.doc("aiQuestionLog/q_prachi").get(),
    true
  );
  await check(
    "Super Admin can read knowledgeEntries across orgs",
    superAdminDb.doc("knowledgeEntries/e_prachi").get(),
    true
  );
  await check(
    "Direct client write to knowledgeEntries is DENIED (requires server Admin SDK)",
    studioAdminDb.doc("knowledgeEntries/e_prachi").update({ title: "Client Hacked" }),
    false
  );
  await check(
    "Direct client read on knowledgeChunks is DENIED (server-only)",
    studioAdminDb.doc("knowledgeChunks/c1").get(),
    false
  );
  await check(
    "Direct client write on knowledgeChunks is DENIED",
    superAdminDb.doc("knowledgeChunks/c1").set({ title: "Injected" }),
    false
  );

  // =========================================================================
  // SECTION 5: ARTISTS, ORDERS, TICKETS
  // =========================================================================
  console.log("\n▶ [Category 5] Artists, Orders & Support Tickets:");
  await check(
    "Public/Anonymous user can read artist profile",
    anonDb.doc("artists/artist_1").get(),
    true
  );
  await check(
    "Customer CANNOT modify artist profile",
    brideDb.doc("artists/artist_1").update({ city: "Hacked" }),
    false
  );
  await check(
    "Studio Admin can modify artist profile",
    studioAdminDb.doc("artists/artist_1").update({ city: "Jodhpur Royal Palace" }),
    true
  );
  await check(
    "Customer can read own support ticket",
    brideDb.doc("supportTickets/ticket_priya").get(),
    true
  );
  await check(
    "Other customer CANNOT read Priya's support ticket",
    otherCustomerDb.doc("supportTickets/ticket_priya").get(),
    false
  );
  await check(
    "Customer can read own ecommerce order",
    brideDb.doc("orders/order_priya").get(),
    true
  );
  await check(
    "Other customer CANNOT read Priya's ecommerce order",
    otherCustomerDb.doc("orders/order_priya").get(),
    false
  );

  console.log("\n======================================================================");
  console.log(`🛡️ EMULATOR RULES VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("======================================================================\n");

  await testEnv.cleanup();

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch(async (err) => {
  console.error("Fatal test runner error:", err);
  if (testEnv) await testEnv.cleanup();
  process.exit(1);
});
