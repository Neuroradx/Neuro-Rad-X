"use server";

/**
 * Verifies a reCAPTCHA v2 token with Google's API.
 * Returns success: true if the token is valid, false otherwise.
 */
export async function verifyRecaptchaToken(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return { success: false, error: "reCAPTCHA is not configured." };
  }
  if (!token || token.trim().length === 0) {
    return { success: false, error: "No reCAPTCHA token provided." };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    if (data.success) {
      return { success: true };
    }
    return { success: false, error: data["error-codes"]?.join(", ") || "Verification failed." };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: message };
  }
}
