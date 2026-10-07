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
  "header",
  "header_mobile",
  "demo_stamps_claim",
  "demo_points_claim",
  "founder_program",
  "about",
  "feature_hero",
  "feature_cta",
  "card_style_gallery",
  "blog_cta",
  "blog_link",
  "pricing_final_cta",
]);

/** CTAs that mean "talk to a human". A different funnel, tracked separately. */
export const CONTACT_CTAS: ReadonlySet<string> = new Set([
  "hero_demo",
  "final_cta_demo",
  "footer_contact",
  "faq_contact",
  "pricing_contact",
  "blog_contact",
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
 * silently be read as a signup. The prefix strip repeats
 * (`(?:[a-z]{2}\/)*`) so a market+locale path like `/en/us/contact` — not a
 * route today, defensive only — is still recognised.
 */
export function isContactHref(href: string): boolean {
  return /^\/(?:[a-z]{2}\/)*contact(?:\/|$|\?|#)/.test(href);
}

/**
 * Does this href open the visitor's mail, phone or WhatsApp app: a `mailto:` or
 * `tel:` link, or one to `wa.me` itself (not a look-alike host, and not a URL
 * that merely mentions it)? Following one leaves the page without a request of
 * ours, so the click is the only moment it can be reported.
 */
export function isDirectContactHref(href: string): boolean {
  if (/^(?:mailto|tel):/i.test(href)) return true;
  try {
    const url = new URL(href);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname === "wa.me";
  } catch {
    return false;
  }
}

/** Does this href point at the signup or the contact page? Same prefix rule as `isContactHref`. */
function isCtaHref(href: string): boolean {
  return /^\/(?:[a-z]{2}\/)*(?:onboarding|contact)(?:[/?#]|$)/.test(href);
}

/**
 * The location of a markdown link in a blog post, or null when it points
 * anywhere but the signup or contact page.
 */
export function blogLinkLocation(href: string): "blog_link" | "blog_contact" | null {
  if (isContactHref(href)) return "blog_contact";
  return isCtaHref(href) ? "blog_link" : null;
}
