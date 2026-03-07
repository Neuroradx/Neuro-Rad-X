import { algoliasearch } from 'algoliasearch';
import { publicEnv, serverEnv } from '@/lib/env';

const appId = publicEnv.ALGOLIA_APP_ID;
const searchKey = publicEnv.ALGOLIA_SEARCH_KEY;
const adminKey = serverEnv.ALGOLIA_ADMIN_KEY;

if (!appId) {
  console.warn('[Algolia] Warning: NEXT_PUBLIC_ALGOLIA_APP_ID is not defined.');
}

export const algoliaAdminClient = appId && adminKey ? algoliasearch(appId, adminKey) : null;
export const algoliaSearchClient = appId && searchKey ? algoliasearch(appId, searchKey) : null;
export const QUESTIONS_INDEX_NAME = 'questions';
