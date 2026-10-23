/**
 * Security-rules tests for the go-live core flow (docs/BOOKING_CONTRACT.md).
 *
 * Run against the emulators (from the repo root):
 *   firebase emulators:exec --only firestore,storage --project demo-makeovers \
 *     "node customer-web/scripts/test-core-rules.js"
 */
const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");

const root = path.resolve(__dirname, "../..");
const PROJECT_ID = "demo-makeovers";
const ORG = "makeovers_by_prachi";

let passed = 0;
let failed = 0;
async function check(name, promise, shouldSucceed) {
  try {
    await (shouldSucceed ? assertSucceeds(promise) : assertFails(promise));
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL  ${name}\n        ${err.message}`);
  }
}

async function main() {
  const env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: fs.readFileSync(path.join(root, "firestore.rules"), "utf8") },
    storage: { rules: fs.readFileSync(path.join(root, "storage.rules"), "utf8") },
  });
  await env.clearFirestore();

  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc("bookings/MBP-TEST01").set({
      bookingId: "MBP-TEST01",
      status: "PAYMENT_PROOF_SUBMITTED",
      customerDetails: { fullName: "Test", phone: "9800000000", email: "c@example.com" },
    });
    await db.doc("calendar/2027-01-10").set({ status: "HOLD", bookingId: "MBP-TEST01" });
    await db.doc("settings/business").set({ upiId: "studio@bank", depositPercent: 30 });
    await db.doc("services/bridal").set({ title: "Bridal", price: 25000, active: true });
    await db.doc("notifications/n1").set({ title: "x", isUnread: true });
    await db.doc("paymentUtrIndex/UTR_1").set({ bookingId: "MBP-TEST01" });
    await ctx.storage().ref("payment_proofs/MBP-TEST01/proof.png").putString("x");
  });

  const anon = env.unauthenticatedContext().firestore();
  const customer = env.authenticatedContext("cust", { email: "c@example.com" }).firestore();
  const otherOrgAdmin = env.authenticatedContext("eve", { role: "admin", orgId: "other_org" }).firestore();
  const staffCtx = env.authenticatedContext("staff", { role: "admin", orgId: ORG });
  const staff = staffCtx.firestore();
  const owner = env.authenticatedContext("owner", { role: "owner", orgId: ORG }).firestore();

  console.log("bookings");
  await check("anon cannot read a booking", anon.doc("bookings/MBP-TEST01").get(), false);
  await check("anon cannot create a booking", anon.doc("bookings/MBP-X").set({ bookingId: "MBP-X" }), false);
  await check("signed-in customer cannot read own booking directly (uses API)", customer.doc("bookings/MBP-TEST01").get(), false);
  await check("signed-in customer cannot list bookings", customer.collection("bookings").get(), false);
  await check("admin of another org cannot read", otherOrgAdmin.doc("bookings/MBP-TEST01").get(), false);
  await check("staff can list bookings", staff.collection("bookings").get(), true);
  await check(
    "staff can approve payment",
    staff.doc("bookings/MBP-TEST01").update({ status: "CONFIRMED", "payment.status": "VERIFIED" }),
    true,
  );
  await check(
    "staff cannot change bookingId",
    staff.doc("bookings/MBP-TEST01").update({ bookingId: "MBP-OTHER" }),
    false,
  );

  console.log("calendar");
  await check("anon can read availability", anon.doc("calendar/2027-01-10").get(), true);
  await check("anon cannot block a date", anon.doc("calendar/2027-02-01").set({ status: "BLOCKED" }), false);
  await check("customer cannot take a hold", customer.doc("calendar/2027-02-01").set({ status: "HOLD" }), false);
  await check("staff can block a date", staff.doc("calendar/2027-02-01").set({ status: "BLOCKED", note: "Holiday" }), true);
  await check("owner can unblock a date", owner.doc("calendar/2027-02-01").delete(), true);

  console.log("services & settings");
  await check("anon can read services", anon.collection("services").get(), true);
  await check("anon cannot edit price", anon.doc("services/bridal").update({ price: 1 }), false);
  await check("anon can read settings", anon.doc("settings/business").get(), true);
  await check("customer cannot change UPI id", customer.doc("settings/business").update({ upiId: "evil@bank" }), false);
  await check("staff can change settings", staff.doc("settings/business").update({ depositPercent: 25 }), true);

  console.log("notifications & UTR index");
  await check("anon cannot read notifications", anon.collection("notifications").get(), false);
  await check("staff can read notifications", staff.collection("notifications").get(), true);
  await check("staff can mark read", staff.doc("notifications/n1").update({ isUnread: false }), true);
  await check("staff cannot forge notifications", staff.collection("notifications").add({ title: "x" }), false);
  await check("anon cannot write UTR index", anon.doc("paymentUtrIndex/UTR_2").set({ bookingId: "x" }), false);
  await check("staff cannot write UTR index", staff.doc("paymentUtrIndex/UTR_2").set({ bookingId: "x" }), false);

  console.log("storage: payment proofs");
  const proof = "payment_proofs/MBP-TEST01/proof.png";
  await check("anon cannot view a payment proof", env.unauthenticatedContext().storage().ref(proof).getDownloadURL(), false);
  await check("customer cannot upload a proof directly", env.authenticatedContext("cust").storage().ref("payment_proofs/MBP-TEST01/x.png").putString("x"), false);
  await check("staff can view a payment proof", staffCtx.storage().ref(proof).getDownloadURL(), true);

  await env.cleanup();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
