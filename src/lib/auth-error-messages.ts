/**
 * Centralized Firebase Auth error code to user-facing message.
 * Use in login, registration, and re-auth flows to avoid duplicated if/else.
 */
import type { AuthError } from "firebase/auth";

export type AuthErrorContext = "login" | "register" | "reauth";

/**
 * Returns a translated message for a Firebase Auth error.
 * @param error - The caught error (cast to AuthError when from Firebase Auth).
 * @param t - Translation function (e.g. from useTranslation).
 * @param context - Optional: "login" | "register" | "reauth". Affects message for wrong-password/invalid-credential.
 */
export function getAuthErrorMessage(
  error: AuthError,
  t: (key: string, params?: Record<string, unknown> & { defaultValue?: string }) => string,
  context: AuthErrorContext = "login"
): string {
  const code = error?.code ?? "";

  switch (code) {
    case "auth/email-already-in-use":
      return t("registrationForm.errorEmailInUse");
    case "auth/weak-password":
      return t("registrationForm.errorWeakPassword");
    case "auth/too-many-requests":
      return t("loginForm.errorTooManyRequests");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      if (context === "reauth") {
        return t("authErrors.incorrectPassword", { defaultValue: "Incorrect password. Please try again." });
      }
      return t("loginForm.errorInvalidCredentials");
    case "auth/requires-recent-login":
      return t("toast.reauthNeededDescriptionDelete");
    default:
      if (error?.message) {
        return t("registrationForm.errorGenericWithMessage", { message: error.message });
      }
      return t("loginForm.errorUnexpected");
  }
}
