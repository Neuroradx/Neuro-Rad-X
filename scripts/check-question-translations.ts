/**
 * Check if a question has translations in en, es, de.
 * Usage: npx tsx scripts/check-question-translations.ts <questionId>
 * Example: npx tsx scripts/check-question-translations.ts ADEM_ADVANCED_67_300525221206
 */
import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: '.env.local' });

const questionId = process.argv[2] || 'ADEM_ADVANCED_67_300525221206';

const serviceAccountString = process.env.firebase_service_account;
if (!serviceAccountString) {
  console.error('Error: firebase_service_account not found in .env.local');
  process.exit(1);
}

let serviceAccount: object;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch {
  console.error('Error: firebase_service_account is not valid JSON');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });
}

const db = admin.firestore();

function summary(locale: string, data: unknown): { exists: boolean; questionText: string; optionsCount: number; hasExplanation: boolean } {
  const obj = data && typeof data === 'object' ? data as Record<string, unknown> : null;
  if (!obj) return { exists: false, questionText: '', optionsCount: 0, hasExplanation: false };
  const questionText = typeof obj.questionText === 'string' ? obj.questionText : '';
  const options = Array.isArray(obj.options) ? obj.options : [];
  const explanation = obj.explanation;
  return {
    exists: true,
    questionText: questionText.slice(0, 80) + (questionText.length > 80 ? '...' : ''),
    optionsCount: options.length,
    hasExplanation: typeof explanation === 'string' && explanation.length > 0
  };
}

async function main() {
  const ref = db.collection('questions').doc(questionId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.log(`Question ID: ${questionId}`);
    console.log('Result: NOT FOUND in Firestore.');
    process.exit(1);
  }
  const data = snap.data();
  const translations = (data?.translations ?? {}) as Record<string, unknown>;
  const en = summary('en', translations.en);
  const es = summary('es', translations.es);
  const de = summary('de', translations.de);

  console.log(`\nQuestion ID: ${questionId}\n`);
  console.log('Translations:');
  console.log('  EN:', en.exists ? `YES (questionText: ${en.questionText.length > 0 ? en.questionText : '(empty)'}, options: ${en.optionsCount}, explanation: ${en.hasExplanation})` : 'NO');
  console.log('  ES:', es.exists ? `YES (questionText: ${es.questionText.length > 0 ? es.questionText : '(empty)'}, options: ${es.optionsCount}, explanation: ${es.hasExplanation})` : 'NO');
  console.log('  DE:', de.exists ? `YES (questionText: ${de.questionText.length > 0 ? de.questionText : '(empty)'}, options: ${de.optionsCount}, explanation: ${de.hasExplanation})` : 'NO');
  const allThree = en.exists && es.exists && de.exists && en.questionText.length > 0 && es.questionText.length > 0 && de.questionText.length > 0;
  console.log('\n' + (allThree ? '✓ This question has content in all three languages (en, es, de).' : '✗ This question does NOT have content in all three languages.'));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
