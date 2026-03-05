import * as admin from 'firebase-admin';

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const serviceAccountVar = process.env.ADMIN_SERVICE_ACCOUNT;

  try {
    if (serviceAccountVar) {
      // Si el secreto existe, lo usamos. Es lo más seguro.
      const serviceAccount = JSON.parse(serviceAccountVar);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'neuroradx-jovto'
      });
    } else {
      // Si no hay secreto, usamos la identidad del servidor (ADC)
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'neuroradx-jovto'
      });
    }
  } catch (error) {
    console.error('[firebase-admin] Error inicializando:', error);
    return admin.initializeApp({ projectId: 'neuroradx-jovto' });
  }
}

const app = initializeAdmin();
export const adminDb = admin.firestore(app!);
export const adminAuth = admin.auth(app!);