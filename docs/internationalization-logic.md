# Lógica de Internacionalización (Traducción) de la Aplicación

Este documento describe la arquitectura y el flujo de trabajo del sistema de internacionalización (i18n) de la aplicación, que permite mostrar la interfaz de usuario en varios idiomas.

El sistema está diseñado para ser centralizado y fácil de usar en toda la aplicación, utilizando un patrón común en React.

## Componentes Clave

El sistema se basa en el Contexto de React y se compone de varias partes que trabajan juntas:

### 1. `src/providers/language-provider.tsx`

Este es el componente central del sistema de traducción.

-   **`LanguageContext`**: Crea un contexto de React que actúa como un contenedor global para el estado del idioma.
-   **Idiomas Disponibles**: Define los idiomas soportados por la aplicación (actualmente inglés, español y alemán).
-   **Estado del Idioma**: Utiliza el hook `useState` para gestionar el idioma seleccionado actualmente.
-   **Persistencia**: Guarda la preferencia de idioma del usuario en el `localStorage` del navegador. Esto asegura que la selección del usuario se recuerde en futuras visitas.
-   **Función de Traducción `t()`**: Expone una función `t(key, options)` a través del contexto. Esta es la función principal que todos los componentes usarán para obtener las cadenas de texto traducidas.

### 2. `src/locales/*.json`

Estos son los "diccionarios" de la aplicación.

-   Cada idioma tiene su propio archivo JSON (`en.json`, `es.json`, `de.json`).
-   Cada archivo contiene un objeto JSON con las mismas "claves" de traducción, pero con los "valores" correspondientes a cada idioma.
-   **Ejemplo**:
    -   En `en.json`: `{ "nav": { "dashboard": "Dashboard" } }`
    -   En `es.json`: `{ "nav": { "dashboard": "Panel de control" } }`

### 3. `src/hooks/use-translation.ts`

Este es un "atajo" personalizado (`custom hook`) para simplificar el uso del contexto.

-   Define el hook `useTranslation()`, que permite a cualquier componente acceder fácilmente al `LanguageContext`.
-   Al usar `const { t } = useTranslation();`, un componente obtiene acceso directo a la función de traducción `t()` sin necesidad de importar `useContext` y `LanguageContext` cada vez.

### 4. `src/providers/providers.tsx` y `src/app/layout.tsx`

Estos archivos aseguran que el proveedor de idioma esté disponible en toda la aplicación.

-   El `RootLayout` (`app/layout.tsx`), que es el layout principal de toda la aplicación, utiliza el componente `<Providers>`.
-   El componente `<Providers>` envuelve a toda la aplicación con el `<LanguageProvider>`.
-   Esto garantiza que **cualquier componente en cualquier lugar de la aplicación** pueda acceder al contexto del idioma y mostrar el texto en el idioma correcto.

## Flujo Lógico de Traducción

1.  **Carga de la Aplicación**: Al iniciar, el `LanguageProvider` se renderiza en la parte superior del árbol de componentes. Revisa el `localStorage` para ver si el usuario ya ha seleccionado un idioma. Si no encuentra ninguno, utiliza `'en'` (inglés) como idioma predeterminado.
2.  **Cambio de Idioma**: El usuario interactúa con el componente `LanguageSwitcher` (el globo terráqueo en la cabecera). Al hacer clic en un nuevo idioma, se llama a la función `setLanguage` del `LanguageProvider`.
3.  **Actualización de Estado**: `setLanguage` actualiza el estado interno del proveedor con el nuevo idioma seleccionado y también guarda esta nueva preferencia en el `localStorage`.
4.  **Re-renderizado**: La actualización del estado del `LanguageProvider` provoca que todos los componentes que utilizan el hook `useTranslation` se vuelvan a renderizar.
5.  **Obtención de Nuevas Traducciones**: Durante el re-renderizado, la función `t('key')` se ejecuta de nuevo en cada componente. Esta vez, busca la `key` en el archivo JSON del nuevo idioma activo y devuelve la cadena de texto traducida.

Este sistema centralizado hace que añadir un nuevo idioma en el futuro sea muy sencillo: solo se necesita crear un nuevo archivo `.json` en `src/locales/` y agregarlo a la lista de idiomas en el `LanguageProvider`.
