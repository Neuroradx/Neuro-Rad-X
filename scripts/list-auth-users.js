/**
 * Lista usuarios de Firebase Authentication (proyecto neuroradx-jovto).
 * Así puedes ver si Auth tiene usuarios aunque Firestore "users" esté vacío.
 * Uso: node scripts/list-auth-users.js
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

console.log('Proyecto:', serviceAccount.project_id, '\n');

async function listAuthUsers() {
  const list = await admin.auth().listUsers(100);
  console.log('--- Usuarios en Firebase Authentication ---\n');
  list.users.forEach((u) => {
    console.log('UID:   ', u.uid);
    console.log('Email: ', u.email || '(sin email)');
    console.log('Name:  ', u.displayName || '');
    console.log('---');
  });
  console.log('Total:', list.users.length, 'usuarios en Auth\n');
}

listAuthUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
