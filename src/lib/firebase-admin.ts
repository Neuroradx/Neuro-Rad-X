// src/lib/firebase-admin.ts
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const serviceAccountEnvVarName = "firebase_service_account";
const serviceAccountString = process.env[serviceAccountEnvVarName];

let serviceAccountJson;

if (serviceAccountString) {
  try {
    serviceAccountJson = JSON.parse(serviceAccountString);
  } catch (error: any) {
    console.error("[firebase-admin.ts] Failed to parse service account JSON.");
    serviceAccountJson = null;
  }
}

if (!getApps().length && serviceAccountJson && serviceAccountJson.project_id) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
  } catch (initError: any) {
    console.error("[firebase-admin.ts] Firebase Admin SDK init FAILED:", initError.message);
  }
}

const adminDb = getApps().length ? admin.firestore() : null;
const adminAuth = getApps().length ? admin.auth() : null;
const adminApp = getApps().length ? admin.app() : null;

export { adminDb, adminAuth, adminApp };