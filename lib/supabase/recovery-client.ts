import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import type { VerifyFailureReason, VerifyState } from "../auth/reset-page-state";

/**
 * Client for the password-recovery session on /reset-password. The session
 * lives in memory only, and supabase-js takes no Web Lock for such a client,
 * so it can never steal the app session's lock (a stolen lock aborts the
 * request holding it). Its own storage key keeps it apart from the app session.
 * A reload after the link is checked drops the session: request a new email.
 */
export function createRecoveryClient(
  url: string = process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) {
  return createClient(url, anonKey, {
    auth: {
      storageKey: "sb-password-recovery",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

type AuthFailure = { message: string; name?: string; status?: number; code?: string };

type LinkVerifier = {
  auth: {
    verifyOtp: (params: { token_hash: string; type: "recovery" }) => Promise<{
      data: { user: { email?: string } | null };
      error: AuthFailure | null;
    }>;
  };
};

const CONNECTION_FAILURE = /network|fetch|load failed/i;

function verifyFailureReason(failure: unknown): VerifyFailureReason {
  const { name, status, code, message } = (failure ?? {}) as Partial<AuthFailure>;
  if (name === "AuthRetryableFetchError" || failure instanceof TypeError || CONNECTION_FAILURE.test(message ?? "")) {
    return "network";
  }
  if (status === 429 || code?.includes("rate_limit")) return "rateLimited";
  return "linkExpired";
}

/**
 * Checks the reset link's token with Supabase, which opens the recovery
 * session on `client`. A failure comes back as a reason, never as Supabase's text.
 */
export async function verifyRecoveryLink(client: LinkVerifier, tokenHash: string): Promise<VerifyState> {
  try {
    const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error) return { status: "failed", reason: verifyFailureReason(error) };
    const email = data.user?.email?.trim();
    return email ? { status: "verified", email } : { status: "verified" };
  } catch (err) {
    return { status: "failed", reason: verifyFailureReason(err) };
  }
}

type PasswordUpdater = {
  auth: {
    updateUser: (attrs: { password: string }) => Promise<{
      data: { user: { email?: string } | null };
      error: (AuthFailure & { reasons?: string[] }) | null;
    }>;
  };
};

/**
 * Saves the new password; a failure, thrown or returned, comes back as `error`.
 * A refusal also carries Supabase's `code` and, for a weak password, its `reasons`.
 * A thrown failure is unexpected, so it is also reported (the error only).
 */
export async function saveNewPassword(
  client: PasswordUpdater,
  password: string,
  report: (err: unknown) => void = Sentry.captureException
): Promise<{ email?: string; error?: string; code?: string; reasons?: string[] }> {
  try {
    const { data, error } = await client.auth.updateUser({ password });
    if (error) return { error: error.message, code: error.code, reasons: error.reasons };
    return { email: data.user?.email };
  } catch (err) {
    report(err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export type PasswordRefusalKey =
  | "samePassword"
  | "weakPasswordLength"
  | "weakPasswordCharacters"
  | "weakPasswordPwned"
  | "weakPassword";

// Known weak-password reasons, in the order the page lists them.
const WEAK_REASON_KEYS = [
  ["length", "weakPasswordLength"],
  ["characters", "weakPasswordCharacters"],
  ["pwned", "weakPasswordPwned"],
] as const;

/**
 * The `auth.resetPassword` messages for a password Supabase refused: none for
 * any other error, so the page keeps its generic message.
 */
export function passwordRefusalKeys(code?: string, reasons?: readonly string[]): PasswordRefusalKey[] {
  if (code === "same_password") return ["samePassword"];
  if (code !== "weak_password") return [];
  const named = WEAK_REASON_KEYS.filter(([reason]) => reasons?.includes(reason)).map(([, key]) => key);
  return named.length > 0 ? named : ["weakPassword"];
}
