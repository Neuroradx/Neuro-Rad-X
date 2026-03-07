# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added – Plan de mejoras (correcciones y calidad — marzo 2025)

Cambios derivados del plan de corrección y mejoras: CI, tests, lint, validación de env, errores globales, loading y tipos.

#### Configuración y resiliencia (Environment Variables)

- **Firebase Config Opcional:** Las variables de entorno de Firebase (`NEXT_PUBLIC_FIREBASE_*`) ya no bloquean el inicio de la app si no están presentes.
- **`EnvSetupMessage`:** Si falta la configuración de Firebase, la app muestra una pantalla de aviso amigable en las rutas dependientes de base de datos o autenticación (Login, Registro, Home, etc.) indicando que se debe configurar `.env.local` y reiniciar el servidor.
- **`src/lib/env.ts` y `src/lib/firebase.ts`:** Refactorizados para usar inicialización condicional y proxies (stubs) que lanzan errores claros solo si se intenta usar la base de datos o auth sin haber proporcionado las credenciales, en lugar de romper el build o el arranque inicial de Next.js.
- **Tipado en componentes dinámicos:** Corregido el tipado de los componentes importados con `next/dynamic` usando `as React.ComponentType` para evitar errores de compilación (`JSX element type does not have any construct or call signatures`).

#### Accessibility (a11y)

- **Login y registro:** Los `Alert` de error de Firebase tienen `role="alert"` y `aria-live="assertive"` para que los lectores de pantalla anuncien el fallo al producirse.
- **Question card** (`src/components/questions/question-card.tsx`): El botón de bookmark usa `aria-label` traducido (`studyMode.addBookmarkAria`). El enlace "View Full Question" tiene `aria-label` traducido. El título de la tarjeta usa la clave `questionCard.title` (traducible).
- **Report Issue Dialog:** Los campos del formulario con error tienen `aria-invalid` y `aria-describedby` apuntando al mensaje de error; los mensajes de error tienen `id` y `role="alert"`. El diálogo tiene `id` en título y descripción para `aria-labelledby`/`aria-describedby` del contenido.
- **Dialog (componente base):** El botón de cierre tiene `aria-label="Close"` explícito.
- **Traducciones:** Añadidas claves `questionCard.title` y `questionCard.viewFullQuestionAria` en `en.json`, `es.json` y `de.json` (EN: "Question Details" / "View full question"; ES: "Detalles de la pregunta" / "Ver pregunta completa"; DE: "Fragendetails" / "Vollständige Frage anzeigen").

#### CI (GitHub Actions)

- **Workflow `firebase-hosting-merge.yml`**: Orden de pasos actualizado a `npm ci` → `npm run lint` → `npm run test -- --run` → `npm run build` → deploy. Eliminado `CI=false` del build. Cada merge a `main` debe pasar lint y tests antes del deploy.

#### Tests

- **API set-claims** (`src/app/api/admin/set-claims/route.test.ts`): Tests con mocks de Firebase Admin y allowlist: 401 sin cabecera `Authorization`, 401 sin Bearer, 403 si el email no está en allowlist, 200 y set de claims si está.
- **API me** (`src/app/api/admin/me/route.test.ts`): 200 con `isAdmin: false` sin token o con token inválido; 200 con `isAdmin: true/false` según `verifyAdminRole` con token válido.
- **LoginForm** (`src/components/auth/login-form.test.tsx`): Render de campos y botón de envío; submit llama a `signInWithEmailAndPassword` con email y contraseña introducidos (Firebase y router mockeados).
- **Setup de tests** (`src/test/setup.ts`): Variables de entorno de prueba para `NEXT_PUBLIC_FIREBASE_*` para evitar fallos de carga de `env.ts`/Firebase en tests.

#### Lint y ESLint

- **`.eslintrc.json`**: Configuración con `next/core-web-vitals` y regla `react/no-unescaped-entities: "warn"` para no bloquear el build por comillas/apóstrofos en infografías.
- **Errores corregidos**: Comillas escapadas en `dashboard/page.tsx` y `not-found.tsx`; uso de `ChartTooltip` en lugar de `Tooltip` (Recharts) en infografías (QuantitativeAlcoholCns, IntracranialHemorrhage, Oligodendroglioma, BrainTumorsComprehensive, Pcnsl, Pml, PinealTumors).

#### Tipos y build (TypeScript)

- **`study/[mode]/page.tsx`**: Comprobación de `currentQuestion.options` antes de `findIndex`; paso de `difficultiesForFilter` como `[...DIFFICULTY_FILTER_OPTIONS]` para compatibilidad con `string[]`.
- **Infografías**: Eliminado `layout="vertical"` de `<Bar>` en BrainTumorsComprehensive (el layout va en `BarChart`); `percent` opcional en `IntracranialHemorrhage` con `(percent ?? 0)`.
- **`main-nav.tsx`**: Uso de `item.title ?? ''` y `item.title ?? item.href ?? 'nav-item'` (y análogo para subitems) para evitar `string | undefined` en `t()` y en `value`/`key` de Accordion y SidebarMenuSubItem.
- **`question-card.tsx` y `FlashcardDisplay.tsx`**: Eliminada la opción `suspense: true` de `dynamic()` (no soportada en el tipo actual de Next.js).
- **`question-filters.tsx`**: Tipo de `localizationsListForDropdown` ampliado a `Array<'all' | QuestionLocalization | 'Other'>`.
- **`src/types/index.ts`**: Añadida interfaz `AttemptedQuestion` (questionId, selectedOptionIndex, answeredCorrectly) usada por `ExamResultsDisplay` y la página de estudio.
- **`FlashcardDisplay.tsx`**: Uso de `main_localization` en lugar de `localization`; eliminada la condición `currentQuestion.type === 'mcq'` (propiedad no existente en `Question`).
- **`StudyModeConfigurationScreen.tsx`**: Tipo de `getModeIcon` cambiado de `JSX.Element` a `React.ReactNode` (compatibilidad con React 19 / tipos actuales).
- **`chart.tsx`**: Tipos propios para `ChartTooltipContent` (payload, label, formatter, etc.) y `ChartLegendContent` (payload, verticalAlign) para evitar conflictos con tipos de Recharts; `item.payload?.fill`; formatter con firma que acepta argumentos adicionales.
- **`PmlInfographic.tsx`**: Formatter del tooltip con cast de `entry` para acceder a `payload.name` de forma type-safe.

#### Documentación y estado

- **README.md**: Nueva sección "Accessibility" que describe las prácticas de a11y (formularios, question card, modales, atributo `lang`).
- **Build**: Sigue fallando por dependencia faltante `@radix-ui/react-slider` en `src/components/ui/slider.tsx`; pendiente instalar el paquete o sustituir el componente.
- **A11y y Sentry**: Revisión inicial de a11y completada (login, registro, question-card, report dialog, dialog base). Sentry sigue opcional; el README ya recomienda un servicio de errores (p. ej. Sentry) para producción.

---

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
