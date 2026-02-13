# Estrategias Técnicas y Lecciones Aprendidas

Este documento resume las estrategias clave para prevenir y diagnosticar problemas técnicos recurrentes en el proyecto, basándose en los errores experimentados con las dependencias de Genkit y las llamadas a la API de Gemini.

## 1. Mantener la Sincronización de Dependencias (El Problema "ERESOLVE")

El error `ERESOLVE` de NPM ocurre cuando hay un conflicto entre las versiones de los paquetes del proyecto. La lección principal es que, al trabajar con un ecosistema de software como Genkit, todas sus partes deben ser compatibles.

### Estrategia de Prevención:

- **Actualización en Bloque:** Al actualizar un paquete de un ecosistema (ej. `@genkit-ai/google-genai`), **todos** los paquetes relacionados (`genkit`, `@genkit-ai/next`, `genkit-cli`, etc.) deben actualizarse a la misma versión compatible en el archivo `package.json`.
- **Verificación de Pares (Peer Dependencies):** Antes de instalar una nueva dependencia, es una buena práctica revisar sus `peerDependencies` (dependencias de pares) para asegurarse de que no entren en conflicto con las versiones ya instaladas.

## 2. Verificar Modelos de IA Antes de Usar (El Problema "404 Not Found")

El error `404 Not Found` al llamar a un modelo de IA casi siempre significa que el nombre del modelo es incorrecto o no está disponible para la clave de API o la versión del SDK que se está utilizando.

### Estrategia de Diagnóstico y Prevención:

- **No Asumir, Verificar:** En lugar de probar nombres de modelos (`gemini-pro`, `gemini-1.0-pro`, etc.), la estrategia correcta es usar la API para listar los modelos disponibles.
- **Script de Diagnóstico:** Utilizar un script temporal (como el que implementamos en `src/ai/genkit.ts`) para llamar al método `listModels()` del SDK es la forma más fiable de obtener una lista precisa y actualizada de los modelos a los que tienes acceso.
- **Guardar la Evidencia:** Exportar esta lista a un archivo (como hicimos con `src/ai/available-models.json`) proporciona una referencia clara y evita la necesidad de ejecutar el script repetidamente.
- **Actualización de Código:** Una vez obtenido el nombre correcto de un modelo disponible, usar ese nombre exacto en el código que define el `prompt` o realiza la llamada a la API (`googleAI.model('nombre-exacto-del-modelo')`).

## 3. Separación de Cliente y Servidor (El Problema "Flujos de IA")

Un error crítico anterior fue causado al intentar llamar un flujo de IA de Genkit (código del lado del servidor) directamente desde un componente de React del lado del cliente.

### Causa Raíz del Problema:

- **Conflicto de Contexto de Ejecución**: Los componentes de React marcados con `"use client";` se ejecutan en el navegador. Los flujos de Genkit en `src/ai/flows/` están marcados con `'use server';` y están diseñados para ejecutarse solo en el servidor, donde tienen acceso seguro a las claves de API.
- **Error Fundamental de Arquitectura**: El código en un componente de cliente **no puede** importar y ejecutar directamente código de servidor. Hacerlo provoca errores de compilación irresolubles porque el navegador no entiende cómo manejar módulos del servidor.

### Solución Arquitectónica Correcta:

La comunicación entre el cliente y los flujos de IA del servidor **debe** realizarse a través de **Next.js Server Actions**.

1.  **Crear una Server Action Intermediaria**:
    *   Definir una función `async` en un archivo dentro de `src/actions/` (p. ej., `src/actions/enrichment-actions.ts`).
    *   Marcar esta función con la directiva `'use server';` en la parte superior del archivo.
    *   Esta función es la **única** que debe importar y llamar al flujo de Genkit (`findScientificArticle`, etc.).

2.  **Llamar a la Server Action desde el Cliente**:
    *   El componente de cliente (p. ej., `src/app/admin/edit-question/page.tsx`) importa y llama a la *Server Action* creada en el paso anterior.
    *   Next.js se encarga de gestionar de forma segura la llamada de red desde el cliente al servidor, ejecutando la lógica de IA y devolviendo el resultado.

Este patrón de diseño asegura que el código sensible del servidor nunca se exponga al cliente y respeta la arquitectura fundamental de cliente-servidor de Next.js.