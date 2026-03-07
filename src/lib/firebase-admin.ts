import * as admin from 'firebase-admin';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'neuroradx-jovto';

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const serviceAccountVar = process.env.ADMIN_SERVICE_ACCOUNT;

  try {
    if (serviceAccountVar) {
      // Si el secreto existe, lo usamos. Es lo más seguro.
      const serviceAccount = JSON.parse(serviceAccountVar);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
      });
    } else {
      // Si no hay secreto, usamos la identidad del servidor (ADC)
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