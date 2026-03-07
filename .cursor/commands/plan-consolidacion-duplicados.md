# Plan de consolidación de duplicados – NeuroRadX

**Estado:** Completado (todas las fases 1–5 implementadas).

Plan por pasos para corregir duplicados y centralizar lógica según la revisión de código. Los pasos siguientes ya se aplicaron en el código; este documento queda como referencia y criterios de “hecho”.

---

## Fase 1: Constantes compartidas

### Paso 1.1 – Categorías principales (main_localization)

1. **Crear/actualizar `src/lib/constants.ts`:**
   - Añadir (o mover desde bundle-actions):
     ```ts
     export const MAIN_CATEGORIES = ['Head', 'Spine', 'Neck', 'General', 'Chest', 'Abdomen', 'Limbs'] as const;
     export type MainCategory = (typeof MAIN_CATEGORIES)[number];
     ```
   - Opcional: exportar `isAllowedBundleCategory(category: string): category is MainCategory` aquí si quieres una sola fuente; si no, mantenerla en bundle-actions y que importe `MAIN_CATEGORIES` desde constants.

2. **Refactorizar `src/actions/bundle-actions.ts`:**
   - Importar `MAIN_CATEGORIES` desde `@/lib/constants`.
   - Definir `ALLOWED_BUNDLE_CATEGORIES = MAIN_CATEGORIES` (o usar directamente `MAIN_CATEGORIES`).
   - Ajustar `isAllowedBundleCategory` para usar `MAIN_CATEGORIES`.

3. **Refactorizar `src/components/questions/question-filters.tsx`:**
   - Eliminar `mainCategoriesForFilter`.
   - Importar `MAIN_CATEGORIES` desde `@/lib/constants` y usarla en topics/localizations.

4. **Refactorizar `src/app/admin/edit-question/page.tsx`:**
   - Sustituir el array literal `(['Head', 'Neck', 'Spine', 'General'] as const)` por import de `MAIN_CATEGORIES` (o un subset derivado si solo quieres esas cuatro en el select).

---

### Paso 1.2 – Opciones de dificultad

1. **En `src/lib/constants.ts`:**
   - Añadir:
     ```ts
     export const DIFFICULTY_FILTER_OPTIONS = ['all', 'Easy', 'Advanced'] as const;
     ```

2. **Refactorizar `src/app/study/[mode]/page.tsx`:**
   - Eliminar `const DIFFICULTIES_FOR_FILTER = ...`.
   - Importar `DIFFICULTY_FILTER_OPTIONS` desde `@/lib/constants` y pasarla a `StudyModeConfigurationScreen` (p. ej. como `difficultiesForFilter={DIFFICULTY_FILTER_OPTIONS}`).

3. **Refactorizar `src/components/questions/question-filters.tsx`:**
   - Eliminar `difficultyOptionsList`.
   - Importar `DIFFICULTY_FILTER_OPTIONS` y usarla en el dropdown de dificultad.

---

## Fase 2: Bug y consistencia en APIs

### Paso 2.1 – Pasar `callerUid` a `fetchUserWithNotifications`

1. **En `src/app/admin/send-notification/[userId]/client-page.tsx`:**
   - Obtener el UID del usuario actual (p. ej. `auth.currentUser` en un `useEffect` o estado derivado del layout/página).
   - Cambiar la llamada de `fetchUserWithNotifications(userId)` a `fetchUserWithNotifications(userId, currentUser.uid)`.
   - Asegurar que no se llame a la acción si no hay `currentUser` (mostrar mensaje o redirigir).

2. **En `src/app/admin/sent-notifications/[userId]/client-page.tsx`:**
   - Mismo cambio: obtener `currentUser` y llamar `fetchUserWithNotifications(userId, currentUser.uid)`.

---

## Fase 3: Helpers de dominio

### Paso 3.1 – Mensajes de error de Firebase Auth

1. **Crear `src/lib/auth-error-messages.ts`:**
   - Función `getAuthErrorMessage(error: AuthError, t: TFunction): string`.
   - Cubrir códigos: `auth/email-already-in-use`, `auth/weak-password`, `auth/too-many-requests`, `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`, y un caso por defecto (genérico o `error.message`).
   - Usar claves de i18n existentes (p. ej. `registrationForm.errorEmailInUse`, `loginForm.errorInvalidCredentials`, etc.) según el contexto si quieres; o claves genéricas como `authErrors.emailAlreadyInUse` si unificas traducciones.

2. **Refactorizar `src/components/auth/login-form.tsx`:**
   - En el `catch`, asignar `errorMessage = getAuthErrorMessage(authError, t)` y eliminar el bloque if/else de códigos.

3. **Refactorizar `src/components/auth/registration-form.tsx`:**
   - Igual: usar `getAuthErrorMessage(authError, t)` en el catch.

4. **Refactorizar `src/components/settings/delete-account-dialog.tsx`:**
   - En el bloque de re-autenticación, usar `getAuthErrorMessage(error, t)` para wrong-password/invalid-credential (o añadir esas claves a la función si no están).

---

### Paso 3.2 – Nombres de tema y subtema (topic/subtopic display)

1. **En `src/lib/constants.ts` o nuevo `src/lib/formatting.ts`:**
   - Importar `subcategoryDisplayNames` si usas constants, o desde donde esté.
   - Crear:
     - `getTopicDisplayName(mainLocalization: string | undefined, t: TFunction): string`  
       (lógica: si `mainLocalization === 'General'` → `t('studyMode.categoryOther')`, si no → `t(\`topics.${mainLocalization.toLowerCase()}\`, { defaultValue: mainLocalization })`).
     - `getSubtopicDisplayName(subtopicKey: string | undefined, t: TFunction): string`  
       (usar `subcategoryDisplayNames[subtopicKey]` y fallback a `t(\`subtopics.${subtopicKey.toLowerCase()}\`, { defaultValue: subtopicKey })`).

2. **Sustituir usos en:**
   - `src/app/study/[mode]/page.tsx` (availableCategories, displayedCategoryCountText, breadcrumb, topic/subtopic en sesión).
   - `src/app/bookmarks/page.tsx` (topicDisplay / subtopicDisplay).
   - `src/app/my-notes/page.tsx` (topic/localization).
   - `src/app/progress/page.tsx` (topic y subtopics).
   - `src/components/questions/question-filters.tsx` (topicsForDropdown, localizationsForDropdown).
   - `src/app/questions/[id]/page.tsx` (topic y subtopic en metadata o breadcrumb).

---

## Fase 4: UI reutilizable (opcional pero recomendado)

### Paso 4.1 – Componente ErrorAlert

1. **Crear `src/components/ui/error-alert.tsx` (o extender `alert.tsx`):**
   - Props: `title?: string`, `description: string`, opcionalmente `variant="destructive"`.
   - Por defecto usar `t('toast.errorTitle')` para el título si no se pasa (necesitarás `useTranslation` dentro del componente o recibir `title` ya traducido desde el padre).
   - Renderizar `<Alert variant="destructive">` + `AlertTitle` + `AlertDescription`.

2. **Sustituir en todas las páginas que muestran el mismo patrón:**
   - Admin: sent-notifications, send-notification/[userId], pending-users, active-users, reported-questions, reviewed-report, enrich-questions, users-by-subscription.
   - Otros: bookmarks, y cualquier otra que tenga `<Alert variant="destructive"><AlertTitle>{t('toast.errorTitle')}</AlertTitle>...`.

---

### Paso 4.2 – Helpers de toast (opcional)

1. **Crear `src/lib/toast-helpers.ts`:**
   - `showErrorToast(toast, t, description: string)`.
   - `showSuccessToast(toast, t, titleKey, descriptionKey?: string, params?: object)`.
   - Internamente llamar a `toast({ variant: 'destructive', title: t('toast.errorTitle'), description })` etc.

2. **Refactorizar gradualmente** los archivos que repiten el patrón de toast destructivo para usar `showErrorToast` (empezar por admin y settings).

---

## Fase 5: Hook useAdminCheck (opcional)

1. **Crear `src/hooks/use-admin-check.ts`:**
   - `onAuthStateChanged` + al tener usuario llamar `user.getIdTokenResult(true)` y leer `!!claims.admin` (o, si quieres respetar allowlist, `fetch('/api/admin/me', { headers: { Authorization: 'Bearer ' + token } })`).
   - Retornar `{ isAdmin: boolean, isLoading: boolean }`.

2. **Refactorizar `src/app/admin/layout.tsx`:**
   - Usar `const { isAdmin, isLoading } = useAdminCheck()` y eliminar estado y efecto locales.

3. **Refactorizar `src/app/settings/page.tsx`:**
   - Usar el mismo hook para `isAdmin` (y opcionalmente para loading) y eliminar la lógica duplicada de token/claims.

---

## Orden sugerido de ejecución

| Orden | Paso | Dependencias |
|-------|------|--------------|
| 1 | 1.1 – MAIN_CATEGORIES y refactors (bundle-actions, question-filters, edit-question) | Ninguna |
| 2 | 1.2 – DIFFICULTY_FILTER_OPTIONS | Ninguna |
| 3 | 2.1 – callerUid en fetchUserWithNotifications | Ninguna |
| 4 | 3.1 – auth-error-messages + login/register/delete-account | Ninguna |
| 5 | 3.2 – getTopicDisplayName / getSubtopicDisplayName + todos los usos | Ninguna |
| 6 | 4.1 – ErrorAlert + sustitución en páginas | Opcional |
| 7 | 4.2 – toast-helpers | Opcional |
| 8 | 5 – useAdminCheck | Opcional |

---

## Criterios de “hecho” por paso

- **1.1:** No existe ningún array literal de categorías principales fuera de `constants.ts` / bundle-actions usando la constante.
- **1.2:** Una sola constante de dificultades y solo imports en study y question-filters.
- **2.1:** Las dos client pages pasan dos argumentos a `fetchUserWithNotifications` y el flujo funciona con usuario logueado.
- **3.1:** No hay if/else por código de auth en login-form, registration-form ni delete-account-dialog; solo llamada a `getAuthErrorMessage`.
- **3.2:** No hay lógica inline de “General → categoryOther” ni de subtopics repetida; solo llamadas a los helpers.
- **4.1 / 4.2 / 5:** Según decidas aplicarlos; el plan queda listo para ejecutarlos en cualquier momento.

Si quieres, el siguiente paso puede ser implementar solo la Fase 1 (pasos 1.1 y 1.2) en el código.
