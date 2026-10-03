/**
 * Staff Custom User Claims Migration Script
 *
 * Enforces multi-tenant security by setting `orgId: 'makeovers_by_prachi'`
 * and appropriate `role` claims on all Makeovers by Prachi staff accounts.
 *
 * Usage:
 *   node scripts/set-staff-claims.js
 *   FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" node scripts/set-staff-claims.js
 */

const { initializeApp, getApps, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const STUDIO_ORG_ID = process.env.STUDIO_ORG_ID || "makeovers_by_prachi";

// Known Staff Accounts for Makeovers by Prachi
const STAFF_ACCOUNTS = [
  { email: "prachi@makeoversbyprachi.com", role: "owner", orgId: STUDIO_ORG_ID },
  { email: "admin@makeoversbyprachi.com", role: "admin", orgId: STUDIO_ORG_ID },
  { email: "accounts@makeoversbyprachi.com", role: "accountant", orgId: STUDIO_ORG_ID },
  { email: "dispatch@makeoversbyprachi.com", role: "admin", orgId: STUDIO_ORG_ID },
  { email: "operations@makeoversbyprachi.com", role: "admin", orgId: STUDIO_ORG_ID },
];

async function initAdmin() {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      console.log(`Connecting to Firebase Auth Emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}...`);
      initializeApp({ projectId: process.env.GCLOUD_PROJECT || "makeovers-by-prachi-test" });
    } else {
      initializeApp({
        credential: applicationDefault(),
      });
    }
  }
}

async function setStaffClaims() {
  console.log("======================================================================");
  console.log("🛡️ MIGRATION: SETTING STAFF CUSTOM CLAIMS WITH CENTRALIZED ORG_ID");
  console.log(`Target Studio Org ID: ${STUDIO_ORG_ID}`);
  console.log("======================================================================\n");

  await initAdmin();
  const auth = getAuth();

  let updatedCount = 0;
  let skippedCount = 0;

  for (const staff of STAFF_ACCOUNTS) {
    try {
      let user;
      try {
        user = await auth.getUserByEmail(staff.email);
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          console.log(`Creating initial staff user in Auth: ${staff.email} (${staff.role})`);
          user = await auth.createUser({
            email: staff.email,
            emailVerified: true,
            displayName: staff.email.split("@")[0].toUpperCase(),
          });
        } else {
          throw err;
        }
      }

      const existingClaims = user.customClaims || {};
      const newClaims = {
        ...existingClaims,
        role: staff.role,
        orgId: staff.orgId,
      };

      await auth.setCustomUserClaims(user.uid, newClaims);
      console.log(`  ✅ Successfully set claims for ${staff.email} (UID: ${user.uid}):`);
      console.log(`     role: '${staff.role}', orgId: '${staff.orgId}'`);
      updatedCount++;
    } catch (e) {
      console.error(`  ❌ Failed to set claims for ${staff.email}:`, e.message);
      skippedCount++;
    }
  }

  console.log("\n======================================================================");
  console.log(`📊 CLAIMS UPDATE COMPLETE: ${updatedCount} Updated, ${skippedCount} Failed`);
  console.log("======================================================================\n");
}

if (require.main === module) {
  setStaffClaims().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
}

module.exports = { setStaffClaims, STAFF_ACCOUNTS, STUDIO_ORG_ID };
