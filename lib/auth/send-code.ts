import type { VerifyMode } from "./onboarding-resume";

/** The two ways the auth provider sends a code to an email address. */
export interface CodeSenders {
  signInWithOtp(email: string): Promise<{ error: unknown }>;
  resendOtp(email: string): Promise<{ error: unknown }>;
}

/**
 * Sends an existing account a sign-in code, or the sign-up confirmation code
 * when it was never confirmed. Resolves to the type that went out, or null when
 * neither could be sent.
 */
export async function sendCodeToExistingUser(auth: CodeSenders, email: string): Promise<VerifyMode | null> {
  if (!(await auth.signInWithOtp(email)).error) return "signin";
  if (!(await auth.resendOtp(email)).error) return "signup";
  return null;
}

/** Sends the code again the way `mode` was first sent. True when it went out. */
export async function resendCode(auth: CodeSenders, email: string, mode: VerifyMode): Promise<boolean> {
  const { error } = mode === "signin" ? await auth.signInWithOtp(email) : await auth.resendOtp(email);
  return !error;
}
