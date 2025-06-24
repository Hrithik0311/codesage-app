import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

// This check prevents Firebase from being initialized on the server.
if (typeof window !== "undefined") {
    if (firebaseConfig.apiKey) {
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApp();
        }
        auth = getAuth(app);
        database = getDatabase(app);
    }
}

export { app, auth, database };
