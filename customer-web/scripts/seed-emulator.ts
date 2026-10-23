/**
 * Seed services + settings/business.
 *
 * Idempotent: existing documents are left untouched (only missing fields are
 * filled in) unless you pass --force, so it is safe to run against production.
 *
 * Emulator:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-makeovers npx tsx scripts/seed-emulator.ts
 * Production (service account):
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
 *   SEED_UPI_ID=studio@okicici SEED_PAYEE_NAME="Makeovers by Prachi" SEED_WHATSAPP=919800000000 \
 *   npx tsx scripts/seed-emulator.ts
 */
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const force = process.argv.includes("--force");

function init() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const sa = JSON.parse(raw);
    if (sa.private_key) sa.private_key = String(sa.private_key).replace(/\\n/g, "\n");
    return initializeApp({
      credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key }),
      projectId: process.env.FIREBASE_PROJECT_ID || sa.project_id,
    });
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId = process.env.FIREBASE_PROJECT_ID || "demo-makeovers";
    return initializeApp({ projectId });
  }
  throw new Error("Set FIRESTORE_EMULATOR_HOST (+ FIREBASE_PROJECT_ID) or FIREBASE_SERVICE_ACCOUNT_JSON.");
}

const SERVICES: Record<string, Record<string, unknown>> = {
  "bridal-signature": {
    title: "Signature Bridal Makeup",
    description:
      "Full bridal look by Prachi: long-wear HD/airbrush base, eye makeup with lashes, hair styling and poshak / dupatta draping.",
    price: 25000,
    category: "Bridal",
    durationMinutes: 240,
    active: true,
    sortOrder: 1,
  },
  "engagement-glam": {
    title: "Engagement & Pre-wedding Glam",
    description: "Soft glam for ring ceremony, sangeet or pre-wedding shoot, with hair styling and draping.",
    price: 15000,
    category: "Engagement",
    durationMinutes: 150,
    active: true,
    sortOrder: 2,
  },
  "party-makeup": {
    title: "Party & Festive Makeup",
    description: "Photo-ready makeup and hair for family, bridesmaids and guests.",
    price: 8500,
    category: "Party",
    durationMinutes: 90,
    active: true,
    sortOrder: 3,
  },
  "destination-bridal": {
    title: "Destination Bridal Package",
    description: "Bridal coverage for destination weddings, including multiple functions. Travel fee applies.",
    price: 45000,
    category: "Destination",
    durationMinutes: null,
    active: true,
    sortOrder: 4,
  },
};

const SETTINGS = {
  businessName: "Makeovers by Prachi",
  upiId: process.env.SEED_UPI_ID || "SET-UPI-ID@bank",
  payeeName: process.env.SEED_PAYEE_NAME || "Makeovers by Prachi",
  whatsappNumber: (process.env.SEED_WHATSAPP || "910000000000").replace(/[^0-9]/g, ""),
  phoneDisplay: process.env.SEED_PHONE_DISPLAY || "",
  email: process.env.SEED_EMAIL || "",
  studioAddress: process.env.SEED_STUDIO_ADDRESS || "Jodhpur, Rajasthan",
  depositPercent: 30,
  holdMinutes: 15,
  travelFees: { jodhpur: 0, jaipur: 3500, udaipur: 3500, other: 8500 },
};

async function upsert(path: string, data: Record<string, unknown>) {
  const db = getFirestore();
  const ref = db.doc(path);
  const snap = await ref.get();
  if (!snap.exists || force) {
    await ref.set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return snap.exists ? "overwritten" : "created";
  }
  const existing = snap.data() || {};
  const missing: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) if (existing[k] === undefined) missing[k] = v;
  if (Object.keys(missing).length === 0) return "unchanged";
  await ref.set({ ...missing, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return `filled ${Object.keys(missing).join(", ")}`;
}

async function main() {
  const app = init();
  console.log(`Seeding project ${app.options.projectId}${process.env.FIRESTORE_EMULATOR_HOST ? " (emulator)" : ""}${force ? " --force" : ""}`);
  for (const [id, data] of Object.entries(SERVICES)) {
    console.log(`services/${id}: ${await upsert(`services/${id}`, data)}`);
  }
  console.log(`settings/business: ${await upsert("settings/business", SETTINGS)}`);
  if (SETTINGS.upiId.startsWith("SET-")) {
    console.warn("WARNING: settings/business.upiId is a placeholder. Set the real UPI ID in the admin app or via SEED_UPI_ID.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
