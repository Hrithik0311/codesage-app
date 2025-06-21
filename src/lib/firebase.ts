import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
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

// Conditionally initialize Firebase only on the client side.
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== "undefined" && !getApps().length) {
  // This code only runs on the client
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else if (getApps().length > 0) {
  // Use the existing app instance
  app = getApp();
  auth = getAuth(app);
} else {
  // On the server, we cannot initialize auth.
  // We will rely on client-side components to handle this.
  // This else block prevents server-side initialization crash.
}

// @ts-ignore
export { app, auth };
