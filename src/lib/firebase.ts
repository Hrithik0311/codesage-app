import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { firebaseConfig, allFirebaseKeysProvided } from './firebase-config';

let app: FirebaseApp;
let auth: Auth;
let database: Database;

function initializeFirebase() {
    if (allFirebaseKeysProvided) {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        database = getDatabase(app);
    }
}

// Initialize on first load in a client environment
if (typeof window !== 'undefined') {
    initializeFirebase();
}

// getFirebaseServices can be called from both client and server components
export function getFirebaseServices() {
    // This ensures that if the services are not initialized yet (e.g., in a server component),
    // they will be before being returned.
    if (!app) {
        initializeFirebase();
    }
    return { app, auth, database };
}
