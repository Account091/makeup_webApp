import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyTiktok1D7d25WebApiKeyPlaceholder",
  authDomain: "tiktok1-d7d25.firebaseapp.com",
  projectId: "tiktok1-d7d25",
  storageBucket: "tiktok1-d7d25.appspot.com",
  messagingSenderId: "858543997223",
  appId: "1:858543997223:web:tiktok1d7d25webapp"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
