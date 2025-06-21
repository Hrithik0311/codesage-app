import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2_N-mx5S7aMCKbG1F-KUFGEa8m-1r044",
  authDomain: "contact-connectlocal.firebaseapp.com",
  databaseURL: "https://contact-connectlocal-default-rtdb.firebaseio.com",
  projectId: "contact-connectlocal",
  storageBucket: "contact-connectlocal.firebasestorage.app",
  messagingSenderId: "688308168438",
  appId: "1:688308168438:web:44f7f705813649ca48eed7"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Check if the essential Firebase config values are present.
// This prevents crashes if the environment variables are not set.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (e) {
    console.error('Firebase initialization error', e);
    // If initialization fails, ensure app and auth are null.
    app = null;
    auth = null;
  }
}

export { app, auth };
