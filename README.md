# NeuroRadX

Expert-validated questions, AI-powered insights, and personalized progress tracking for neuroradiology. Study in English, German, or Spanish.

## Requirements

- **Node.js 22** (see `package.json` engines)
- npm or compatible package manager

## Installation

```bash
npm install
```

## Environment variables

Create a `.env.local` file in the project root. Do not commit secrets to version control.

### Firebase (client)

Used by `src/lib/firebase.ts`. **Note:** If you run the app locally without these variables, the app will still start and show an `EnvSetupMessage` on pages that require Firebase. It will not crash during the build step.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### Firebase Admin (server)

Used by API routes and server-side code (`src/lib/firebase-admin.ts`):

| Variable | Description |
|----------|-------------|
| `ADMIN_SERVICE_ACCOUNT` | JSON string of the Firebase service account key (for production). If omitted, Application Default Credentials are used (e.g. local emulator). |
| `FIREBASE_PROJECT_ID` or `GCLOUD_PROJECT` | Optional; defaults to `neuroradx-jovto` if unset. |

### Algolia

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Algolia application ID |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | Search-only API key (client-safe) |
| `ALGOLIA_ADMIN_KEY` | Admin API key (server only, for indexing) |

### reCAPTCHA

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA site key |
| `NEXT_PUBLIC_RECAPTCHA_VERSION` | `"2"` or `"3"` |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret key (server, for verify) |

### Optional

- **Error monitoring:** Consider integrating a service (e.g. [Sentry](https://sentry.io)) for production error tracking. Add `NEXT_PUBLIC_SENTRY_DSN` and server-side config as needed.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run test:ui` | Run tests with UI |

## Accessibility

The app follows basic accessibility practices:

- **Forms (login, registration):** Labels are associated with inputs (`htmlFor`/`id`). Validation errors are announced to screen readers via `role="alert"` and `aria-live="assertive"` on error messages; invalid fields use `aria-invalid` and `aria-describedby` linking to the error text.
- **Question cards and study UI:** Action buttons (bookmark, report issue, view full question) have descriptive `aria-label`s. Card titles use semantic headings where appropriate.
- **Modals (e.g. Report Issue):** Dialogs use Radix UI with focus trapping and Escape to close. Title and description are exposed for assistive tech; form fields with errors use `aria-invalid` and `aria-describedby`. The global close button has an explicit `aria-label="Close"`.
- **Language:** The document `lang` attribute is kept in sync with the selected app language (EN/ES/DE) for screen readers and SEO.

## Deploy

- **Script:** `scripts/deploy.sh` stages all changes, commits, and pushes to GitHub. It does not run Firebase deploy locally.
- **CI:** On push to `main`, GitHub Actions runs `npm run build` and deploys to Firebase Hosting (see `.github/workflows/firebase-hosting-merge.yml`). Ensure repository secrets (e.g. `FIREBASE_SERVICE_ACCOUNT_NEURORADX_JOVTO`) are set.

## License

Private. All rights reserved.
