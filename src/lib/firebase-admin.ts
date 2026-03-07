import * as admin from 'firebase-admin';
import { serverEnv } from '@/lib/env';

const PROJECT_ID = serverEnv.FIREBASE_PROJECT_ID;

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const serviceAccountVar = serverEnv.ADMIN_SERVICE_ACCOUNT;

  try {
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
      });
    } else {
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: PROJECT_ID
      });
    }
  } catch (error) {
    console.error('[firebase-admin] Error inicializando:', error);
    return admin.initializeApp({ projectId: PROJECT_ID });
  }
}

const app = initializeAdmin();
export const adminDb = admin.firestore(app!);
export const adminAuth = admin.auth(app!);
