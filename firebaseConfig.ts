
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";

export const isFirebaseConfigured = Boolean(
  rawApiKey && 
  rawApiKey.trim() !== "" && 
  rawApiKey !== "YOUR_API_KEY" && 
  !rawApiKey.startsWith("YOUR_")
);

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey : "AIzaSyDummyInitializationKeyForPreviewOnly00",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fbdm-blood-donation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fbdm-blood-donation",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fbdm-blood-donation.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "105968496137",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:105968496137:web:fbdm0000"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);


