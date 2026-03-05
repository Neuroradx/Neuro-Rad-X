/**
 * Crea o actualiza el documento en Firestore "users/{uid}" para un usuario de Auth,
 * con role "admin" y status "approved". Útil cuando Auth tiene usuarios pero
 * la colección Firestore "users" está vacía (p. ej. proyecto migrado).
 *
 * Uso: node scripts/ensure-admin-firestore.js <email>
 * Ejemplo: node scripts/ensure-admin-firestore.js info@andrespinta.com
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const admin = require('firebase-admin');

const email = process.argv[2];
if (!email) {
  console.error('Uso: node scripts/ensure-admin-firestore.js <email>');
  console.error('Ejemplo: node scripts/ensure-admin-firestore.js info@andrespinta.com');
  process.exit(1);
}

const serviceAccountString = process.env.ADMIN_SERVICE_ACCOUNT || process.env.firebase_service_account;
if (!serviceAccountString) {
  console.error('Error: No se encontró ADMIN_SERVICE_ACCOUNT ni firebase_service_account en .env.local');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
  console.error('Error: firebase_service_account no es un JSON válido');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const auth = admin.auth();
const db = admin.firestore();

async function ensureAdmin() {
  const userRecord = await auth.getUserByEmail(email);
  const uid = userRecord.uid;

  // Set Custom Claims for Auth
  await auth.setCustomUserClaims(uid, { admin: true });
  console.log('Asignado Custom Claim { admin: true } a Auth para el usuario %s', email);

  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();

  const data = {
    email: userRecord.email,
    displayName: userRecord.displayName || '',
    firstName: (userRecord.displayName || '').split(' ')[0] || '',
    lastName: (userRecord.displayName || '').split(' ').slice(1).join(' ') || '',
    role: 'admin',
    status: 'approved',
    subscriptionLevel: 'Owner',
    uid,
    institution: '',
    country: '',
    totalQuestionsAnsweredAllTime: 0,
    totalCorrectAnswersAllTime: 0,
  };

  if (snap.exists) {
    await ref.update({ role: 'admin', status: 'approved', subscriptionLevel: 'Owner' });
    console.log('Actualizado users/%s en Firestore → role: admin, status: approved', uid);
  } else {
    await ref.set(data);
    console.log('Creado users/%s en Firestore con role: admin, status: approved', uid);
  }
  console.log('Email:', userRecord.email);
  console.log('Listo. IMPORTANTE: El usuario debe cerrar sesión y volver a entrar para que el nuevo claim de admin sea efectivo.');
}

ensureAdmin().catch((err) => {
  if (err.code === 'auth/user-not-found') {
    console.error('No hay ningún usuario en Authentication con email:', email);
    console.error('Comprueba el email o crea el usuario en Firebase Console → Authentication.');
  } else {
    console.error(err);
  }
  process.exit(1);
});
