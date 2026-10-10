/** Only `/` follows the visitor's language; every deeper URL is served in the language its path names. */

/** Does this path pick its language from the visitor's cookie and browser? */
export function negotiatesLanguage(pathname: string): boolean {
  return pathname === "/";
}

/** Headers for a response to `/`: caches key on cookie and language, and the per-visitor redirect is never stored. */
export function negotiatedResponseHeaders(status: number): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Accept-Language, Cookie" };
  if (status >= 300 && status < 400) headers["Cache-Control"] = "no-store";
  return headers;
}
