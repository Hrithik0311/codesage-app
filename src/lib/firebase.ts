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
