
# Estructura del Proyecto NeuroRadX

Este documento describe la estructura de archivos y directorios de la aplicación NeuroRadX, un proyecto Next.js construido con TypeScript, Tailwind CSS y Firebase.

## Directorio Raíz

-   **`.vscode/`**: Contiene la configuración del editor Visual Studio Code y las extensiones recomendadas para el proyecto.
-   **`docs/`**: Documentación importante sobre la lógica de la aplicación, directivas para el agente de IA y notas técnicas.
-   **`public/`**: Almacena los recursos estáticos como imágenes de fondo.
-   **`src/`**: El directorio principal del código fuente de la aplicación.
    -   **`actions/`**: Funciones del lado del servidor (Next.js Server Actions) para la lógica de backend, como la gestión de usuarios, notificaciones y correos electrónicos.
    -   **`ai/`**: Configuración de Genkit y flujos para funciones de IA Generativa.
    -   **`app/`**: El App Router de Next.js, que contiene todas las páginas y layouts.
    -   **`components/`**: Componentes reutilizables de React utilizados en toda la aplicación.
    -   **`hooks/`**: Hooks personalizados de React para lógica compartida del lado del cliente.
    -   **`lib/`**: Bibliotecas principales, utilidades, constantes y archivos de datos.
    -   **`locales/`**: Archivos JSON para traducciones (en, de, es).
    -   **`providers/`**: Proveedores de Contexto de React, como el `LanguageProvider` para la internacionalización y el `ThemeProvider` para el tema.
    -   **`types/`**: Definiciones de tipos de TypeScript para las estructuras de datos utilizadas en la aplicación.
-   **`apphosting.yaml`**: Archivo de configuración para desplegar la aplicación en Firebase App Hosting.
-   **`components.json`**: Configuración para la biblioteca de componentes `shadcn/ui`.
-   **`next.config.js`**: Archivo de configuración para el framework Next.js.
-   **`package.json`**: Lista las dependencias y scripts del proyecto.
-   **`README.md`**: Descripción general del proyecto e instrucciones de configuración.
-   **`tailwind.config.ts`**: Configuración para el framework de utilidades CSS Tailwind CSS.
-   **`tsconfig.json`**: Opciones del compilador de TypeScript para el proyecto.

---

## Desglose Detallado de Directorios

### `src/app/` - Enrutamiento y Páginas

Este directorio utiliza el paradigma del App Router de Next.js. La lógica para diferenciar los layouts (público, de autenticación, de la aplicación) se gestiona en `src/app/layout.tsx`.

-   **`page.tsx`**: La página de inicio pública.
-   **`layout.tsx`**: El layout raíz. Contiene la lógica para determinar si se debe mostrar el `AppShell` (el layout principal de la aplicación con barra lateral) o un diseño simple para las páginas públicas y de autenticación.
-   **`globals.css`**: Estilos globales y configuración del tema de Tailwind CSS.
-   **`dashboard/page.tsx`**: El panel de control principal del usuario.
-   **`study/[mode]/page.tsx`**: Página dinámica para los diferentes modos de estudio (Tutor, Examen, Tarjetas de memoria).
-   **`progress/page.tsx`**: Página para que los usuarios vean su progreso de aprendizaje.
-   **`bookmarks/page.tsx`**: Muestra las preguntas que el usuario ha marcado.
-   **`my-notes/page.tsx`**: Página para gestionar las notas del usuario sobre las preguntas.
-   **`questions/[id]/page.tsx`**: Página de detalles para una sola pregunta.
-   **`settings/page.tsx`**: Configuración de la cuenta de usuario y de la aplicación.
-   **`about/page.tsx`**: La página "Acerca de".
-   **`auth/`**: Directorio para las páginas de autenticación.
    -   `layout.tsx`: Un layout simple y centrado, específico para los formularios de autenticación.
    -   `login/page.tsx`
    -   `register/page.tsx`
    -   `forgot-password/page.tsx`
    -   `pending-approval/page.tsx`
-   **`admin/`**: Directorio para todas las páginas exclusivas del administrador.
    -   `dashboard/page.tsx`: El panel principal de administración.
    -   `pending-users/page.tsx`: Página para aprobar nuevos registros de usuarios.
    -   `active-users/page.tsx`: Página para ver y gestionar todos los usuarios.
    -   `reported-questions/page.tsx`: Interfaz para revisar los informes de problemas enviados por los usuarios.
    -   `edit-question/page.tsx`: Formulario para editar el contenido de una pregunta.
    -   `send-notification/page.tsx`: Formulario para enviar una notificación a un usuario.
-   **`robots.ts` & `sitemap.ts`**: Archivos para SEO e instrucciones para los rastreadores web.

### `src/components/` - Componentes de UI Reutilizables

-   **`admin/`**: Componentes utilizados exclusivamente en las páginas de administración.
-   **`auth/`**: Componentes para los formularios de inicio de sesión y registro.
-   **`common/`**: Componentes de propósito general como el Logo, el conmutador de tema y los diálogos.
-   **`dashboard/`**: Componentes específicos para el panel de control del usuario.
-   **`layout/`**: Componentes relacionados con el layout principal de la aplicación (p. ej., Navegación Principal, Menú de Usuario).
-   **`questions/`**: Componentes para mostrar e interactuar con las preguntas.
-   **`settings/`**: Componentes utilizados en la página de configuración.
-   **`study/`**: Componentes para los diversos modos de estudio (MCQ, Tarjeta de memoria, Resultados del Examen).
-   **`ui/`**: Componentes de UI principales de la biblioteca `shadcn/ui` (Button, Card, Input, etc.).

### `src/lib/` - Lógica Principal y Datos

-   **`firebase.ts`**: Inicialización de Firebase del lado del cliente.
-   **`firebase-admin.ts`**: Inicialización del SDK de administración de Firebase del lado del servidor.
-   **`constants.ts`**: Constantes de toda la aplicación, como los elementos de navegación.
-   **`utils.ts`**: Funciones de utilidad, principalmente para `clsx` y `tailwind-merge`.
-   **`firestore-structures/`**: Archivos JSON que documentan el esquema de las colecciones de Firestore.
-   **`*.json`**: Varios archivos de datos JSON, incluyendo IDs de preguntas, correos electrónicos de administradores y datos de cursos.