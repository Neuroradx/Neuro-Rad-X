"use client";

/**
 * Catches errors in the root layout. Replaces the entire document,
 * so we must include <html> and <body> and cannot use app providers/context.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "32rem", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            window.location.href = "/";
          }}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
