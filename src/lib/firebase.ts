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

// Initialize Firebase using the standard pattern to prevent re-initialization.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { app, auth };
