import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

// This function ensures Firebase is initialized only once.
function initializeFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    // Only attempt to initialize if the API key is provided.
    // This prevents errors during server-side builds if env vars aren't available.
    if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      database = getDatabase(app);
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    database = getDatabase(app);
  }
}

// Initialize Firebase when this module is first loaded in the browser.
if (typeof window !== "undefined") {
    initializeFirebase();
}

export { app, auth, database };
