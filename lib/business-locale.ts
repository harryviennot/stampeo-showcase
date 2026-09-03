/**
 * Look up a shop's own language, for the middleware's locale fallback.
 *
 * This runs in front of every QR scan that arrives without a usable
 * `Accept-Language`, so it is deliberately small: one GET against the public
 * business endpoint, a short in-memory cache, a hard timeout, and `null` on
 * anything unexpected. `null` is not an error state — the caller falls back to
 * the site default, so a slow or down API costs the visitor nothing but the
 * shop's language.
 *
 * Next's Data Cache is not available in middleware, hence the local map. It is
 * per-instance and best-effort; the point is to keep a shop that is being
 * scanned all afternoon from re-reading on every scan.
 */

/** Matches the showcase Data Cache window for the same record. */
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 500;
const DEFAULT_TIMEOUT_MS = 1500;

export interface BusinessLocaleLookupOptions {
  /** Public API base, e.g. `NEXT_PUBLIC_API_URL`. Absent disables the lookup. */
  apiUrl: string | undefined;
  fetchImpl?: typeof fetch;
  ttlMs?: number;
  maxEntries?: number;
  timeoutMs?: number;
  now?: () => number;
}

/**
 * Build a cached `slug -> primary_locale` lookup.
 *
 * The returned value is whatever the API said, un-validated: deciding whether
 * `primary_locale` is a locale we serve belongs to `resolveAcquisitionLocale`,
 * which is where every other locale-shaped input is validated too.
 */
export function createBusinessLocaleLookup({
  apiUrl,
  fetchImpl = fetch,
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = Date.now,
}: BusinessLocaleLookupOptions): (slug: string) => Promise<string | null> {
  const base = apiUrl?.replace(/\/+$/, "");
  const cache = new Map<string, { locale: string | null; expiresAt: number }>();

  return async function getBusinessLocale(slug: string): Promise<string | null> {
    if (!base) return null;

    const cached = cache.get(slug);
    if (cached && cached.expiresAt > now()) return cached.locale;

    let locale: string | null = null;
    try {
      const response = await fetchImpl(
        `${base}/businesses/slug/${encodeURIComponent(slug)}`,
        { signal: AbortSignal.timeout(timeoutMs) }
      );

      if (response.status === 404) {
        // A slug that does not exist stays cached: the page 404s anyway, and
        // bots walking made-up slugs must not turn into API traffic.
        remember(slug, null);
        return null;
      }
      if (!response.ok) return null;

      const body = (await response.json()) as { primary_locale?: unknown };
      locale =
        typeof body?.primary_locale === "string" ? body.primary_locale : null;
    } catch {
      // Timeout, network error, non-JSON body. Fail open, and do not cache —
      // the next scan should get a fresh try.
      return null;
    }

    remember(slug, locale);
    return locale;
  };

  function remember(slug: string, locale: string | null) {
    if (cache.size >= maxEntries) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    cache.set(slug, { locale, expiresAt: now() + ttlMs });
  }
}
