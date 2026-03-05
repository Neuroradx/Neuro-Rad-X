/**
 * Lista todos los usuarios de la colección Firestore "users" con su email y datos básicos.
 * Uso: node scripts/list-firestore-users.js
 * Requiere: firebase_service_account en .env.local (JSON del service account)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const admin = require('firebase-admin');

const serviceAccountString = process.env.firebase_service_account;
if (!serviceAccountString) {
  console.error('Error: firebase_service_account no encontrado en .env.local');
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

const projectId = serviceAccount.project_id || '(desconocido)';
console.log('Proyecto Firebase:', projectId);
console.log('(Debe ser neuroradx-jovto para ver los usuarios de producción)\n');

const db = admin.firestore();

async function listUsers() {
  const snapshot = await db.collection('users').get();
  const users = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    users.push({
      uid: doc.id,
      email: d.email ?? '(sin email)',
      displayName: d.displayName ?? '',
      role: d.role ?? '',
      status: d.status ?? '',
      subscriptionLevel: d.subscriptionLevel ?? '',
    });
  });

  // Ordenar por email
  users.sort((a, b) => (a.email || '').localeCompare(b.email || ''));

  console.log('\n--- Usuarios en Firestore (colección users) ---\n');
  console.log(
    [
      'UID (document id)',
      'Email',
      'Display name',
      'Role',
      'Status',
      'Subscription',
    ]
      .map((h) => h.padEnd(h.length < 20 ? 20 : h.length))
      .join('  ')
  );
  console.log('-'.repeat(120));

  users.forEach((u) => {
    const uid = (u.uid || '').substring(0, 28);
    const email = (u.email || '').substring(0, 32);
    const name = (u.displayName || '').substring(0, 24);
    const role = (u.role || '').substring(0, 10);
    const status = (u.status || '').substring(0, 10);
    const sub = (u.subscriptionLevel || '').substring(0, 12);
    console.log(
      [uid.padEnd(28), email.padEnd(32), name.padEnd(24), role.padEnd(10), status.padEnd(10), sub].join('  ')
    );
  });

  console.log('\nTotal:', users.length, 'usuarios\n');
}

listUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
