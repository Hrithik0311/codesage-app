import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANXI_daofPZ9TOwAEBKsV0xAc3RzPi0KU",
  authDomain: "work-ftc.firebaseapp.com",
  projectId: "work-ftc",
  storageBucket: "work-ftc.firebasestorage.app",
  messagingSenderId: "899528797860",
  appId: "1:899528797860:web:68a1a471d44192738d4031",
  measurementId: "G-9L13PTJ89L"
};


let app: FirebaseApp;
let auth: Auth;

// This check prevents Firebase from being initialized on the server.
if (typeof window !== "undefined") {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
}

// @ts-ignore
export { app, auth };
