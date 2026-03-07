// src/lib/firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { publicEnv, hasFirebaseConfig } from "@/lib/env";

const FIREBASE_NOT_CONFIGURED =
  "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local (see README) and restart the dev server (npm run dev).";

function createNotConfiguredStub<T>(_name: string): T {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(FIREBASE_NOT_CONFIGURED);
      },
    }
  ) as T;
}

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: publicEnv.FIREBASE_API_KEY,
    authDomain: publicEnv.FIREBASE_AUTH_DOMAIN,
    projectId: publicEnv.FIREBASE_PROJECT_ID,
    storageBucket: publicEnv.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: publicEnv.FIREBASE_MESSAGING_SENDER_ID,
    appId: publicEnv.FIREBASE_APP_ID,
  };
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  app = createNotConfiguredStub<FirebaseApp>("app");
  db = createNotConfiguredStub<Firestore>("db");
  auth = createNotConfiguredStub<Auth>("auth");
  storage = createNotConfiguredStub<FirebaseStorage>("storage");
}

export { app, db, auth, storage };
