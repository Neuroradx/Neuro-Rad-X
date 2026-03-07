/**
 * Validated environment variables. Use these instead of process.env so missing
 * required config fails with a clear message.
 */

function getEnv(key: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  return process.env[key];
}

function requireEnv(key: string): string {
  const value = getEnv(key);
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to .env.local (see README). If you just added it, restart the dev server (npm run dev) — Next.js only loads NEXT_PUBLIC_* at startup.`
    );
  }
  return value;
}

/** Public (NEXT_PUBLIC_*) env. Firebase keys are optional so the app can show EnvSetupMessage when .env.local is missing; use hasFirebaseConfig before loading Firebase-dependent UI. */
export const publicEnv = {
  get FIREBASE_API_KEY() {
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
  },
  get FIREBASE_AUTH_DOMAIN() {
    return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '';
  },
  get FIREBASE_PROJECT_ID() {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
  },
  get FIREBASE_STORAGE_BUCKET() {
    return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '';
  },
  get FIREBASE_MESSAGING_SENDER_ID() {
    return process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '';
  },
  get FIREBASE_APP_ID() {
    return process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '';
  },
  get ALGOLIA_APP_ID() {
    return process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '';
  },
  get ALGOLIA_SEARCH_KEY() {
    return process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? '';
  },
  get RECAPTCHA_SITE_KEY() {
    return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
  },
  get RECAPTCHA_VERSION(): '2' | '3' {
    const v = process.env.NEXT_PUBLIC_RECAPTCHA_VERSION;
    if (v === '2' || v === '3') return v;
    return '2';
  },
  get BUILD_TIME() {
    return process.env.NEXT_PUBLIC_BUILD_TIME ?? '';
  },
};

export const hasFirebaseConfig =
  typeof publicEnv.FIREBASE_API_KEY === 'string' &&
  publicEnv.FIREBASE_API_KEY.length > 0;

/** Server-only env. Optional so ADC and partial setups work. */
export const serverEnv = {
  get ADMIN_SERVICE_ACCOUNT(): string | undefined {
    return (
      getEnv('ADMIN_SERVICE_ACCOUNT') ??
      getEnv('FIREBASE_SERVICE_ACCOUNT') ??
      getEnv('firebase_service_account')
    );
  },
  get FIREBASE_PROJECT_ID(): string {
    return getEnv('FIREBASE_PROJECT_ID') ?? getEnv('GCLOUD_PROJECT') ?? 'neuroradx-jovto';
  },
  get ALGOLIA_ADMIN_KEY(): string | undefined {
    return getEnv('ALGOLIA_ADMIN_KEY');
  },
  get RECAPTCHA_SECRET_KEY(): string | undefined {
    return getEnv('RECAPTCHA_SECRET_KEY');
  },
};
