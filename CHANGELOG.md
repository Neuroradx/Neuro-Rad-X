# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Changed – Consolidación de duplicados (refactor marzo 2025)

Refactor en cinco fases para eliminar código duplicado y centralizar constantes, helpers y componentes.

#### Fase 1: Constantes compartidas

- **Categorías principales**: Se añadieron `MAIN_CATEGORIES` y el tipo `MainCategory` en `src/lib/constants.ts`. `bundle-actions.ts` usa esta constante (y reexporta `ALLOWED_BUNDLE_CATEGORIES`). `question-filters.tsx` y `admin/edit-question/page.tsx` importan `MAIN_CATEGORIES` en lugar de arrays literales.
- **Opciones de dificultad**: Se añadió `DIFFICULTY_FILTER_OPTIONS` en `constants.ts`. La página de estudio (`study/[mode]/page.tsx`) y `question-filters.tsx` la utilizan en lugar de duplicar `['all', 'Easy', 'Advanced']`.

#### Fase 2: APIs

- **`fetchUserWithNotifications`**: Las páginas cliente `admin/send-notification/[userId]/client-page.tsx` y `admin/sent-notifications/[userId]/client-page.tsx` ahora obtienen el usuario actual con `onAuthStateChanged` y pasan `callerUid` (currentUser.uid) a la acción, corrigiendo la llamada incompleta y permitiendo la verificación de admin en servidor.

#### Fase 3: Helpers de dominio

- **Mensajes de error de Firebase Auth**: Nuevo módulo `src/lib/auth-error-messages.ts` con `getAuthErrorMessage(error, t, context?)` (`context`: `'login' | 'register' | 'reauth'`). Sustituye los bloques if/else por código de error en `login-form.tsx`, `registration-form.tsx` y `delete-account-dialog.tsx`.
- **Nombres de tema y subtema**: Nuevo módulo `src/lib/formatting.ts` con `getTopicDisplayName(mainLocalization, t)` y `getSubtopicDisplayName(subtopicKey, t)`. Se usa en `study/[mode]/page.tsx`, `bookmarks/page.tsx`, `my-notes/page.tsx`, `progress/page.tsx`, `question-filters.tsx`, `questions/[id]/page.tsx` y `StudyModeConfigurationScreen.tsx` para unificar la lógica "General → categoryOther" y la resolución de subtopics.

#### Fase 4: UI reutilizable

- **ErrorAlert**: Nuevo componente `src/components/ui/error-alert.tsx` (props: `description`, `title?`, `className?`, `icon?`). Sustituye el patrón repetido `<Alert variant="destructive"><AlertTitle>{t('toast.errorTitle')}</AlertTitle><AlertDescription>...</AlertDescription></Alert>` en múltiples páginas de admin, bookmarks y similares.
- **Toast helpers**: Nuevo módulo `src/lib/toast-helpers.ts` con `showErrorToast(toast, t, description, title?)` y `showSuccessToast(...)`. Se utiliza en `reset-statistics-dialog.tsx` para los toasts de error.

#### Fase 5: Hook useAdminCheck

- **Hook**: Nuevo `src/hooks/use-admin-check.ts` que retorna `{ isAdmin, isLoading, user }` usando `onAuthStateChanged` y `getIdTokenResult(true)` para leer el claim `admin`.
- **Admin layout**: Usa `useAdminCheck()` y un efecto separado para redirigir a `/auth/login` cuando no hay usuario.
- **Settings**: Usa `useAdminCheck()` para `user`, `isAdmin` e `isAuthLoading`; la carga del perfil de Firestore se hace en un efecto cuando hay usuario.

#### Documentación

- **CHANGELOG.md**: Entrada anterior con el detalle de las fases 1–5.
- **PROJECT_STRUCTURE.md**: Actualizado para describir `lib/auth-error-messages.ts`, `lib/formatting.ts`, `lib/toast-helpers.ts`, el componente `ui/error-alert.tsx` y el hook `use-admin-check`.
- **.cursor/commands/plan-consolidacion-duplicados.md**: Marcado como completado y referencia de criterios de “hecho”.

---

### Security (Auditoría de ciberseguridad — marzo 2025)

Implementación de las correcciones derivadas de la auditoría técnica de seguridad (Firebase/Google Cloud).

#### Crítico

- **Allowlist de admins no expuesta en el cliente**: Se eliminó la importación de `admin-emails.json` en `admin-check.ts`. La verificación de admin en el cliente se basa solo en el documento de Firestore (`role === 'admin'`). Para flujos donde el usuario aún no tiene documento o claim (p. ej. login de admin en allowlist), el cliente usa la API **GET `/api/admin/me`** que devuelve `{ isAdmin: boolean }` sin exponer la lista de correos.
- **Allowlist no expuesta en respuestas de error**: El endpoint **POST `/api/admin/set-claims`** ya no incluye la propiedad `allowlist` en las respuestas 403.

#### Medio

- **Storage — avatares**: Las reglas de Storage restringen la **lectura** de avatares al propietario: `allow read: if request.auth != null && request.auth.uid == userId` (antes cualquier usuario autenticado podía leer cualquier avatar).
- **Bundles — allowlist de categorías**: La ruta **GET `/api/bundles/[category]`** y la acción `generateQuestionBundle` validan `category` contra una lista permitida (`Head`, `Spine`, `Neck`, `General`, `Chest`, `Abdomen`, `Limbs`). Categorías no permitidas devuelven 400.
- **Logging**: Se redujo el logging sensible en `auth-helpers.ts` (sin allowlist ni datos de usuario en logs), en `check-status` (se reemplazó `envVarName` por un booleano `envConfigured`) y en `user-data-actions.ts` (se eliminó el log de claves de `process.env`).

#### Bajo

- **Project ID por variable de entorno**: En `firebase-admin.ts`, el `projectId` usa `process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'neuroradx-jovto'` para facilitar múltiples entornos.

#### Documentación

- Añadida **`docs/security/SECURITY.md`** con la documentación de aspectos de seguridad (reglas Firestore/Storage, auth, secretos, APIs y referencias de archivos).

---

## Formato de entradas futuras

- **Added**: nuevas funcionalidades.
- **Changed**: cambios en comportamiento o APIs existentes.
- **Deprecated**: funcionalidades obsoletas que se eliminarán.
- **Removed**: funcionalidades eliminadas.
- **Fixed**: corrección de bugs.
- **Security**: vulnerabilidades o mejoras de seguridad.
