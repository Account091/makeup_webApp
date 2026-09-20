import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (useEmulators ? "demo-makeovers-local" : "tiktok1-d7d25");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyTiktok1D7d25WebApiKeyPlaceholder",
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: "858543997223",
  appId: "1:858543997223:web:tiktok1d7d25webapp"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to Local Firebase Emulator Suite when NEXT_PUBLIC_USE_FIREBASE_EMULATORS is true
if (useEmulators && typeof window !== "undefined") {
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || "127.0.0.1";
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
    console.log(`[Firebase Local Certification] Connected to Emulator Suite (${projectId}) at http://${host}`);
  } catch (e) {
    console.warn("[Firebase Local Certification] Emulators already connected or notice:", e);
  }
}
