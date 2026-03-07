"use client";

/**
 * Shown when NEXT_PUBLIC_FIREBASE_API_KEY is missing so we don't load Firebase and crash.
 * Renders a full-page message with setup steps.
 */
export function EnvSetupMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold">
          Configuración de entorno requerida
        </h1>
        <p className="text-sm text-muted-foreground">
          Falta la variable{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_FIREBASE_API_KEY
          </code>{" "}
          (y el resto de la config de Firebase).
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            En la raíz del proyecto, en{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              .env.local
            </code>
            , pon al principio las 6 variables de Firebase (cada una en una
            línea, sin espacios alrededor del <code>=</code>).
          </li>
          <li>
            Obtén los valores en Firebase Console → tu proyecto →
            Configuración del proyecto → Tus aplicaciones → app web.
          </li>
          <li>
            Guarda el archivo, para el servidor (Ctrl+C) y ejecuta de nuevo:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              npm run dev
            </code>
            .
          </li>
          <li>Recarga esta página en el navegador.</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Más detalle en el README del proyecto.
        </p>
      </div>
    </div>
  );
}
