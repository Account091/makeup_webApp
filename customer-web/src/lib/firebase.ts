/**
 * Firebase CLIENT SDK.
 *
 * The public go-live site does NOT use this: every customer read/write goes
 * through server routes backed by `firebase-admin` (see ./firebase-admin.ts).
 * It is kept only for internal (hidden) tools. There are no fallback/fake
 * project values — if the NEXT_PUBLIC_FIREBASE_* env vars are missing, any use
 * of `db`/`auth`/`storage` throws a clear configuration error.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (useEmulators ? "emulator-api-key" : undefined);

const CONFIG_ERROR =
  "Firebase client SDK is not configured: set NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_API_KEY, " +
  "NEXT_PUBLIC_FIREBASE_APP_ID (or NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true for local).";

export const isFirebaseClientConfigured = Boolean(projectId && apiKey);

function unconfigured<T extends object>(name: string): T {
  return new Proxy({} as T, {
    get(_t, prop) {
      if (prop === "then") return undefined; // not a thenable
      throw new Error(`${CONFIG_ERROR} (accessed ${name}.${String(prop)})`);
    },
  });
}

let app: FirebaseApp | null = null;
if (isFirebaseClientConfigured) {
  app =
    getApps().length === 0
      ? initializeApp({
          apiKey,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        })
      : getApps()[0];
}

export const db: Firestore = app ? getFirestore(app) : unconfigured<Firestore>("db");
export const auth: Auth = app ? getAuth(app) : unconfigured<Auth>("auth");
export const storage: FirebaseStorage = app ? getStorage(app) : unconfigured<FirebaseStorage>("storage");

if (app && useEmulators && typeof window !== "undefined") {
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || "127.0.0.1";
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
  } catch (e) {
    console.warn("[firebase] Emulators already connected:", e);
  }
}
