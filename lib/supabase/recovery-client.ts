import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";

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

type PasswordUpdater = {
  auth: {
    updateUser: (attrs: { password: string }) => Promise<{
      data: { user: { email?: string } | null };
      error: { message: string } | null;
    }>;
  };
};

/**
 * Saves the new password; a failure, thrown or returned, comes back as `error`.
 * A thrown one is unexpected, so it is also reported (the error only).
 */
export async function saveNewPassword(
  client: PasswordUpdater,
  password: string,
  report: (err: unknown) => void = Sentry.captureException
): Promise<{ email?: string; error?: string }> {
  try {
    const { data, error } = await client.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { email: data.user?.email };
  } catch (err) {
    report(err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
