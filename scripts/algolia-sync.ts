// scripts/algolia-sync.ts
import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import { algoliasearch } from 'algoliasearch';

dotenv.config({ path: '.env.local' });

const firebaseConfigString = process.env.firebase_service_account;
if (!firebaseConfigString) {
    console.error('Error: firebase_service_account not found in .env.local');
    process.exit(1);
}

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;

if (!appId || !adminKey) {
    console.error('Error: Algolia credentials missing in .env.local');
    process.exit(1);
}

const serviceAccount = JSON.parse(firebaseConfigString);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const client = algoliasearch(appId, adminKey);

async function migrate() {
    console.log('Starting migration to Algolia...');

    try {
        const questionsSnapshot = await db.collection('questions').get();
        console.log(`Found ${questionsSnapshot.size} questions in Firestore.`);

        const objects = questionsSnapshot.docs.map(doc => {
            const data = doc.data();

            // Extract translations
            const translations = data.translations || {};
            const en = translations.en || {};
            const es = translations.es || {};
            const de = translations.de || {};

            return {
                objectID: doc.id,
                main_localization: data.main_localization,
                sub_main_location: data.sub_main_location,
                difficulty: data.difficulty,
                type: data.type,
                // Text search fields
                questionText_en: en.questionText || '',
                questionText_es: es.questionText || '',
                questionText_de: de.questionText || '',
                explanation_en: en.explanation || '',
                explanation_es: es.explanation || '',
                explanation_de: de.explanation || '',
                // Metadata
                Question_revised: data.Question_revised,
            };
        });

        // Algolia v5 uses saveObjects differently, but let's check the client API
        // Actually, v5 client uses client.saveObjects({ indexName, objects })

        console.log('Sending objects to Algolia...');
        const result = await client.saveObjects({
            indexName: 'questions',
            objects: objects,
        });

        console.log(`Successfully synced ${objects.length} questions to Algolia.`);
        console.log('Result:', result);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
