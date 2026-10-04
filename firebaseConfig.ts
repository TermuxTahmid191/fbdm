
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User-provided Firebase credentials for gen-lang-client-0186179192
const defaultFirebaseConfig = {
  apiKey: "AIzaSyAxXVy2Vv_G5-z1gcLSvCm2wrE9ikL3hww",
  authDomain: "gen-lang-client-0186179192.firebaseapp.com",
  projectId: "gen-lang-client-0186179192",
  storageBucket: "gen-lang-client-0186179192.firebasestorage.app",
  messagingSenderId: "556121713297",
  appId: "1:556121713297:web:388a6bbd996d72ee91ad30"
};

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey;

export const isFirebaseConfigured = Boolean(
  rawApiKey && 
  rawApiKey.trim() !== "" && 
  rawApiKey !== "YOUR_API_KEY" && 
  !rawApiKey.startsWith("YOUR_")
);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);


