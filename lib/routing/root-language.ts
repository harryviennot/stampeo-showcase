/**
 * Which requests follow the visitor's language, and how their responses are
 * marked for caches.
 *
 * Only the bare root has no language of its own, so only `/` reads the
 * `NEXT_LOCALE` cookie and `Accept-Language`. Every deeper URL is served in the
 * language its path names: an unprefixed `/blog/{slug}` is French whatever the
 * browser says, because the French article is the only one at that URL.
 */

/** Does this path pick its language from the visitor's cookie and browser? */
export function negotiatesLanguage(pathname: string): boolean {
  return pathname === "/";
}

/**
 * Headers for a response to `/`. Its answer depends on the visitor's cookie
 * and browser language, so a shared cache must key on both, and the per-visitor
 * redirect is never stored at all.
 */
export function negotiatedResponseHeaders(status: number): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Accept-Language, Cookie" };
  if (status >= 300 && status < 400) headers["Cache-Control"] = "no-store";
  return headers;
}
