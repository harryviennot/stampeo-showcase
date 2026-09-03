/**
 * Which language a public acquisition page renders in.
 *
 * `/{slug}` (and `/{slug}/l/{store}`) is what a merchant's QR code encodes, so
 * it carries no locale prefix and the visitor is a stranger with no cookie. The
 * site-wide default is French, which meant a Polish customer in a Polish shop
 * got a French page whenever their browser did not hand us a language we serve.
 *
 * The rule here: an explicit choice wins, then the language the phone is
 * actually set to, and when neither says anything usable we show the shop's own
 * language rather than the site default. A shop's customers speak the shop's
 * language far more often than they speak French.
 *
 * Everything in this file is pure and synchronous; the middleware owns the one
 * network call (looking up the shop's language) and only makes it when the
 * first two signals came up empty.
 */

import { routing, type Locale } from "@/i18n/routing";

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (routing.locales as readonly string[]).includes(value)
  );
}

/**
 * The language the visitor's device is set to, or `null` if we do not serve it.
 *
 * Only the visitor's TOP-ranked language counts. Everything below it is the
 * browser's own fallback chain, not a statement by the person holding the phone:
 * Chrome appends `en` to almost every header it sends, so scanning down the list
 * would hand English to every device whose real language we do not serve. That
 * is how a Polish shop ended up reading English.
 *
 * Ranked by q-value rather than by position, because the header is a preference
 * list and not an ordered one: `en;q=0.5,pl;q=0.9` means Polish. Region is
 * dropped (`pl-PL` -> `pl`) since we ship one catalog per language. `null` means
 * "nothing here we can use" — the caller falls back to the shop's own language,
 * which beats guessing English at someone.
 */
export function deviceLanguage(
  header: string | null | undefined
): Locale | null {
  if (!header) return null;

  let bestTag: string | null = null;
  let bestQ = 0;

  for (const part of header.split(",")) {
    const [rawTag, ...params] = part.trim().split(";");
    const tag = rawTag.trim().toLowerCase();
    // `*` is "anything", which is the same as no preference for our purposes.
    if (!tag || tag === "*") continue;

    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=");
      if (key?.trim().toLowerCase() !== "q") continue;
      const parsed = Number.parseFloat(value ?? "");
      // A malformed q makes the whole entry untrustworthy; drop it rather than
      // promote it to the top by defaulting to 1.
      q = Number.isFinite(parsed) ? parsed : -1;
    }
    if (q <= 0) continue;

    // Strictly greater, so a tie keeps header order — what a client means by
    // listing two languages at the same q.
    if (q > bestQ) {
      bestQ = q;
      bestTag = tag;
    }
  }

  if (!bestTag) return null;

  const base = bestTag.split("-")[0];
  return isSupportedLocale(base) ? base : null;
}

/**
 * First path segments that belong to the marketing site, not to a merchant.
 *
 * Anything else in that position is a business slug. Kept as a literal list
 * because the middleware runs on the edge and cannot read the filesystem;
 * `locale-negotiation.test.ts` diffs it against `app/[locale]/` so a new
 * marketing page cannot quietly start being treated as a shop.
 */
export const RESERVED_TOP_SEGMENTS: ReadonlySet<string> = new Set([
  // Static routes under app/[locale]
  "about",
  "blog",
  "changelog",
  "contact",
  "demo",
  "email-preferences",
  "features",
  "founding-partner",
  "login",
  "loyalty-programs",
  "onboarding",
  "pricing",
  "privacy",
  "program-lojalnosciowy",
  "programa-de-fidelizacion",
  "programme-fidelite",
  "programme-fondateur",
  "reset-password",
  "terms",
  "uk",
  "us",
  // Non-localized route handlers. The middleware matcher already skips these,
  // but the set is also the answer to "is this a shop?" for callers that do not.
  "api",
  "auth",
  "go",
  "internal",
]);

/**
 * The business slug this pathname enrolls into, or `null`.
 *
 * `null` for anything already carrying a locale prefix: a locale in the URL is
 * an explicit choice (a shared link, the language switcher) and negotiating
 * over it would silently discard what the visitor asked for.
 */
export function acquisitionSlug(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  if (isSupportedLocale(segments[0])) return null;

  const slug = segments[0];
  if (RESERVED_TOP_SEGMENTS.has(slug)) return null;

  // `/{slug}` and `/{slug}/l/{store}` are the only enrollment shapes.
  const isPlain = segments.length === 1;
  const isPerStore = segments.length === 3 && segments[1] === "l";
  if (!isPlain && !isPerStore) return null;

  return slug;
}

export type LocaleSource = "cookie" | "header" | "business" | "default";

export interface AcquisitionLocaleInput {
  /** `NEXT_LOCALE`, set when the visitor used the language switcher. */
  cookieLocale?: string | null;
  /** Raw `Accept-Language` request header. */
  acceptLanguage?: string | null;
  /** The shop's `primary_locale`, when we managed to look it up. */
  businessLocale?: string | null;
}

/**
 * Pick the locale for an unprefixed acquisition URL.
 *
 * Always returns a locale `routing` actually serves, so the caller can splice
 * it straight into a pathname without next-intl 404ing on an unknown segment.
 */
export function resolveAcquisitionLocale({
  cookieLocale,
  acceptLanguage,
  businessLocale,
}: AcquisitionLocaleInput): { locale: Locale; source: LocaleSource } {
  if (isSupportedLocale(cookieLocale)) {
    return { locale: cookieLocale, source: "cookie" };
  }

  const fromDevice = deviceLanguage(acceptLanguage);
  if (fromDevice) return { locale: fromDevice, source: "header" };

  if (isSupportedLocale(businessLocale)) {
    return { locale: businessLocale, source: "business" };
  }

  return { locale: routing.defaultLocale, source: "default" };
}
