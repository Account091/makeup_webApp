import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoKeyForMakeoversByPrachiWeb",
  authDomain: "makeovers-by-prachi.firebaseapp.com",
  projectId: "makeovers-by-prachi",
  storageBucket: "makeovers-by-prachi.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:makeoversbyprachi"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
