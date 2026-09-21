/**
 * The CTA taxonomy shared by every ad vendor.
 *
 * Extracted from `lib/google-analytics.ts` and `lib/meta-pixel.ts`, which each
 * carried a private copy (the extraction STA-320 planned, pulled forward by
 * the STA-319 review). One module means a CTA added for one vendor cannot
 * silently not exist for the other: both mappers read the same sets, so a new
 * location is either mapped everywhere or unmapped everywhere — and "unmapped"
 * is the deliberate, visible state (the mappers return null for it).
 *
 * `lib/analytics.ts` still owns the `CTALocation` union itself; the
 * source-reading union tests in `lib/google-analytics.test.ts` pin that every
 * declared location appears here.
 */

/**
 * CTAs that mean "I want to start using this". They leave showcase for the
 * app, so the events name the click, never the account.
 */
export const SIGNUP_CTAS: ReadonlySet<string> = new Set([
  "hero",
  "pricing_starter",
  "pricing_growth",
  "pricing_pro",
  "faq",
  "final_cta",
  "loyalty_picker",
]);

/** CTAs that mean "talk to a human". A different funnel, tracked separately. */
export const CONTACT_CTAS: ReadonlySet<string> = new Set([
  "hero_demo",
  "final_cta_demo",
]);

/** Has anyone deliberately mapped this CTA location? Unknown means silent. */
export function isKnownCTALocation(location: string): boolean {
  return SIGNUP_CTAS.has(location) || CONTACT_CTAS.has(location);
}

/**
 * Does this href point at the contact page?
 *
 * Locale-prefixed hrefs are matched too: `Link` from @/i18n/navigation
 * prefixes at render time, and a call site passing a resolved href must not
 * silently downgrade a Contact to a Lead. The prefix strip repeats
 * (`(?:[a-z]{2}\/)*`) so a market+locale path like `/en/us/contact` — not a
 * route today, defensive only — is still recognised.
 */
export function isContactHref(href: string): boolean {
  return /^\/(?:[a-z]{2}\/)*contact(?:\/|$|\?|#)/.test(href);
}
