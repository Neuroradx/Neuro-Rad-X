// src/lib/algolia.ts
import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const adminKey = process.env.ALGOLIA_ADMIN_KEY || ''; // Backend only
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ''; // Frontend/Search only

if (!appId) {
    console.warn('[Algolia] Warning: NEXT_PUBLIC_ALGOLIA_APP_ID is not defined.');
}

/**
 * Admin client for backend operations (indexing, deleting).
 * NEVER use this on the client side.
 */
export const algoliaAdminClient = appId && adminKey ? algoliasearch(appId, adminKey) : null;

/**
 * Search client for frontend operations (querying).
 * Safe to use on the client side.
 */
export const algoliaSearchClient = appId && searchKey ? algoliasearch(appId, searchKey) : null;

export const QUESTIONS_INDEX_NAME = 'questions';
