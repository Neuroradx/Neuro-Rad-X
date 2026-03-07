import { MAIN_CATEGORIES } from '@/lib/constants';

/** Allowed question categories for bundles (must match main_localization in Firestore). */
export const ALLOWED_BUNDLE_CATEGORIES = MAIN_CATEGORIES;

export function isAllowedBundleCategory(category: string): category is (typeof ALLOWED_BUNDLE_CATEGORIES)[number] {
  return (ALLOWED_BUNDLE_CATEGORIES as readonly string[]).includes(category);
}
