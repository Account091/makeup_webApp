/**
 * Create (or update) a staff login for the Flutter admin app.
 *
 *   node scripts/create-staff.js <email> <password> [owner|admin]
 *
 * Credentials: set FIREBASE_SERVICE_ACCOUNT_JSON (the JSON string) or
 * GOOGLE_APPLICATION_CREDENTIALS (path to the key file). For the emulator,
 * set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 and FIREBASE_PROJECT_ID.
 *
 * The user must sign out and back in after a role change for it to apply.
 */
const { initializeApp, cert, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const ORG_ID = "makeovers_by_prachi";
const ROLES = ["owner", "admin"];

function init() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return initializeApp({ projectId: projectId || "demo-makeovers" });
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    return initializeApp({ credential: cert(sa), projectId: projectId || sa.project_id });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({ credential: applicationDefault(), projectId });
  }
  throw new Error("No credentials: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.");
}

async function main() {
  const [email, password, role = "admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: node scripts/create-staff.js <email> <password> [owner|admin]");
    process.exitCode = 1;
    return;
  }
  if (!ROLES.includes(role)) {
    console.error(`Role must be one of: ${ROLES.join(", ")}`);
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  init();
  const auth = getAuth();
  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password });
    console.log(`Updated existing user ${email}`);
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
    user = await auth.createUser({ email, password, emailVerified: true });
    console.log(`Created user ${email}`);
  }
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), role, orgId: ORG_ID });
  console.log(`Granted role '${role}' for org '${ORG_ID}' (uid ${user.uid}).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
