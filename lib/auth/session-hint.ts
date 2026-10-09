/**
 * Reads the Supabase session from cookies alone, so a marketing page can pick
 * "Log in" or "Dashboard" without downloading supabase-js. It is a hint: an
 * expired session still reads as signed in until the dashboard clears it.
 */

/** The `<ref>` in `sb-<ref>-auth-token`, derived the way supabase-js names its storage key. */
export function supabaseProjectRef(supabaseUrl: string | undefined): string | null {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

function cookieEntries(cookieHeader: string): Array<[name: string, value: string]> {
  return cookieHeader.split(";").flatMap((part): Array<[string, string]> => {
    const eq = part.indexOf("=");
    return eq === -1 ? [] : [[part.slice(0, eq).trim(), part.slice(eq + 1).trim()]];
  });
}

function hasCookie(cookieHeader: string, matches: (name: string) => boolean): boolean {
  return cookieEntries(cookieHeader).some(([name, value]) => value !== "" && matches(name));
}

/**
 * True when the session cookie, or one of the `.0`, `.1`… chunks @supabase/ssr
 * splits a large session into, is set. The PKCE `-code-verifier` cookie left by
 * an unfinished OAuth sign-in does not count.
 */
export function hasSupabaseSession(cookieHeader: string, projectRef: string): boolean {
  if (!projectRef) return false;
  const key = `sb-${projectRef}-auth-token`;
  return hasCookie(
    cookieHeader,
    (name) => name === key || (name.startsWith(`${key}.`) && /^(0|[1-9]\d*)$/.test(name.slice(key.length + 1))),
  );
}

/**
 * True on a redirect supabase-js would exchange for a session: a `code` query
 * parameter plus the code verifier this browser stored when the flow started.
 */
export function isPkceCallback(search: string, cookieHeader: string, projectRef: string): boolean {
  if (!projectRef || !new URLSearchParams(search).get("code")) return false;
  const verifier = `sb-${projectRef}-auth-token-code-verifier`;
  return hasCookie(cookieHeader, (name) => name === verifier);
}
