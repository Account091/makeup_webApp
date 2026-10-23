/**
 * Server-only Firebase Admin SDK initialisation.
 *
 * NEVER import this file from a client component — it holds service-account
 * credentials. All customer writes (bookings, calendar holds, payment proofs)
 * go through API routes that use this module.
 *
 * Credential resolution:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON  -> cert(JSON.parse(...))  (production)
 *   2. FIRESTORE_EMULATOR_HOST        -> projectId only           (local emulator)
 *   3. otherwise                      -> throws a clear configuration error
 */
import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const APP_NAME = "makeovers-admin";

export class FirebaseAdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseAdminConfigError";
  }
}

function resolveProjectId(serviceAccountProjectId?: string): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    serviceAccountProjectId ||
    undefined
  );
}

function initAdminApp(): App {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || undefined;

  if (rawServiceAccount && rawServiceAccount.trim()) {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(rawServiceAccount);
    } catch {
      throw new FirebaseAdminConfigError(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Paste the whole service-account key file as a single line."
      );
    }
    if (parsed.private_key) {
      // Env var UIs often store the key with literal "\n" sequences.
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    const projectId = resolveProjectId(parsed.project_id);
    return initializeApp(
      {
        credential: cert({
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key,
        }),
        projectId,
        storageBucket,
      },
      APP_NAME
    );
  }

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId = resolveProjectId();
    if (!projectId) {
      throw new FirebaseAdminConfigError(
        "FIRESTORE_EMULATOR_HOST is set but FIREBASE_PROJECT_ID is missing (e.g. demo-makeovers)."
      );
    }
    // Without a credential, firebase-admin falls back to Application Default
    // Credentials, and google-auth-library then probes the GCP metadata server
    // (169.254.169.254 / metadata.google.internal). Off-GCP that probe times out
    // after ~3s on every cold start (the "MetadataLookupWarning" in dev logs).
    // The emulators never need real credentials, so skip the probe entirely.
    if (!process.env.METADATA_SERVER_DETECTION) process.env.METADATA_SERVER_DETECTION = "none";
    if (!process.env.GOOGLE_CLOUD_PROJECT) process.env.GOOGLE_CLOUD_PROJECT = projectId;
    return initializeApp({ projectId, storageBucket }, APP_NAME);
  }

  throw new FirebaseAdminConfigError(
    "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (production) or FIRESTORE_EMULATOR_HOST + FIREBASE_PROJECT_ID (local emulator)."
  );
}

let cachedApp: App | null = null;
function app(): App {
  if (!cachedApp) cachedApp = initAdminApp();
  return cachedApp;
}

/** Firestore (admin). Lazily initialised so `next build` never needs credentials. */
export function adminDb(): Firestore {
  return getFirestore(app());
}

export function adminAuth(): Auth {
  return getAuth(app());
}

/** Default Storage bucket (FIREBASE_STORAGE_BUCKET). */
export function adminBucket() {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new FirebaseAdminConfigError(
      "FIREBASE_STORAGE_BUCKET is not set (e.g. your-project.appspot.com or your-project.firebasestorage.app)."
    );
  }
  return getStorage(app()).bucket(bucketName);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIRESTORE_EMULATOR_HOST);
}

