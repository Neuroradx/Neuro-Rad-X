# Directivas para el Agente de IA

Este documento contiene una lista de reglas y directivas cruciales que el agente de IA debe seguir al realizar cambios en la aplicación NeuroRadX. El incumplimiento de estas directivas puede provocar errores de compilación o un comportamiento inesperado de la aplicación.

## 1. No utilizar Grupos de Rutas (Carpetas con Paréntesis)

**Regla:** Bajo ninguna circunstancia se deben crear carpetas con nombres entre paréntesis en el directorio `src/app`, como `(app)`, `(auth)` o cualquier otra variación.

**Justificación:** El uso de Grupos de Rutas ha demostrado ser problemático en esta configuración específica, causando `ChunkLoadErrors` y conflictos de enrutamiento. La solución preferida para gestionar diferentes layouts es utilizar una lógica condicional en el archivo `src/app/layout.tsx` o layouts anidados en subdirectorios estándar.

**Ejemplo de lo que NO se debe hacer:**

```
/src/app
  ├── (app)/
  │   └── dashboard/
  │       └── page.tsx
  └── (auth)/
      └── login/
          └── page.tsx
```

**Ejemplo de la estructura CORRECTA:**

```
/src/app
  ├── dashboard/
  │   └── page.tsx
  └── auth/
      ├── login/
      │   └── page.tsx
      └── layout.tsx  // Layout específico para las rutas de autenticación
```

## 2. Estricta Separación de Código de Cliente y Servidor

**Regla:** El código del lado del servidor, específicamente los flujos de IA de Genkit ubicados en `src/ai/flows/` (archivos marcados con `'use server';`), **NO DEBE** ser importado o llamado directamente desde componentes del lado del cliente (cualquier archivo marcado con `"use client";`).

**Justificación:** Esta es una regla arquitectónica fundamental en Next.js. Intentar llamar código de servidor desde el cliente causará errores de compilación irresolubles y fallos en la aplicación relacionados con la resolución de módulos y el contexto de ejecución. El cliente (navegador) no puede ejecutar lógica del lado del servidor que requiere acceso seguro a APIs o al sistema de archivos.

**Implementación Correcta:** Para ejecutar un flujo de Genkit desde un componente de cliente, **DEBE** utilizarse una **Server Action** como intermediario.

1.  **Crear una Server Action Intermediaria**:
    *   Defina una función `async` en un archivo dentro de `src/actions/` (p. ej., `src/actions/enrichment-actions.ts`).
    *   Marque este archivo con la directiva `'use server';` en la parte superior.
    *   Esta función es la **única** que debe importar y llamar al flujo de Genkit.

2.  **Llamar a la Server Action desde el Cliente**:
    *   El componente de cliente (p. ej., `src/app/admin/edit-question/page.tsx`) importa y llama a la *Server Action* creada en el paso anterior.
    *   Next.js se encarga de gestionar de forma segura la llamada de red desde el cliente al servidor, ejecutando la lógica de IA y devolviendo el resultado.