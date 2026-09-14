/**
 * Country "pilots" — distinct English landing URLs so each market can be SEO'd
 * independently (hreflang en-GB vs en-US) instead of geo-swapping copy on one
 * URL (which Google, crawling from the US, would only ever see one side of).
 *
 * A pilot renders the same VariantLanding as /en, with a `market` that overrides
 * the country-specific bits (currency wording, trust strip). The clean URLs
 * (/uk, /us) are served by a middleware rewrite to the English route so they
 * keep lang=en and never 307 to /en/uk for English visitors.
 *
 * NOTE: pilots ship NOINDEX until the copy is signed off. Flipping live = set
 * `index: true` in the pilot pages + wire PILOT_HREFLANG into the homepage.
 */

export type Market = "int" | "uk" | "us";

export interface MarketConfig {
  /** hreflang region code for this market's homepage. */
  hreflang: string;
  /** Canonical path for this market's homepage. */
  path: string;
  /** OpenGraph locale tag. */
  ogLocale: string;
  /** Currency shown in market-tuned copy. Pricing localization is a follow-up. */
  currency: { symbol: string; code: string };
  /** Whether to show the "Made in Europe · GDPR" trust strip. Off outside
   *  Europe (e.g. US), where it isn't a selling point. */
  europeTrust: boolean;
  /** Short label for the dev switcher. */
  label: string;
  /**
   * Free-trial length in days for this market, mirroring
   * `backend/app/core/pricing_region.TRIAL_DAYS_BY_COUNTRY`.
   *
   * It lives here because it is a PROMISE made in copy, and QA found /us
   * offering "30-day free trial" one click before Stripe granted 14. A number
   * written into eight strings across four locales cannot track a backend
   * constant; a number read from one place can.
   */
  trialDays: number;
}

export const MARKETS: Record<Market, MarketConfig> = {
  int: {
    hreflang: "en",
    path: "/en",
    ogLocale: "en_US",
    currency: { symbol: "€", code: "EUR" },
    europeTrust: true,
    label: "int",
    trialDays: 30,
  },
  uk: {
    hreflang: "en-GB",
    path: "/uk",
    ogLocale: "en_GB",
    currency: { symbol: "£", code: "GBP" },
    europeTrust: true,
    label: "uk",
    trialDays: 30,
  },
  us: {
    hreflang: "en-US",
    path: "/us",
    ogLocale: "en_US",
    currency: { symbol: "$", code: "USD" },
    europeTrust: false,
    label: "us",
    trialDays: 14,
  },
};

/**
 * The full hreflang cluster for the homepage, kept in one place so going live
 * with the pilots is a single edit (drop this into the homepage `alternates`).
 * Not wired into the indexed homepage yet — pilots are noindex during testing.
 */
export const PILOT_HREFLANG: Record<string, string> = {
  "x-default": "/en",
  fr: "/",
  en: "/en",
  "en-GB": "/uk",
  "en-US": "/us",
  es: "/es",
  pl: "/pl",
};

/**
 * A path inside a market.
 *
 * A market is a set of routes, not a single landing page. /us quotes dollars,
 * so every link a US visitor can follow has to stay inside /us — otherwise the
 * shared nav walks them onto the international pricing page and quotes euros,
 * which is a price checkout will not honour.
 *
 * `int` is deliberately bare: next-intl owns locale prefixing there, and
 * hardcoding /en would break the default-locale URLs.
 */
export function marketPath(market: Market, path: string): string {
  const base = market === "int" ? "" : MARKETS[market].path;
  if (path === "/") return base || "/";
  return `${base}${path}`;
}

/**
 * Is this URL inside a country pilot?
 *
 * Prefix-aware on purpose, and carefully. The original check was an exact-match
 * Set so that a business slug like /usual-cafe could not be mistaken for /us —
 * but that also meant /us/pricing was never rewritten, fell through to locale
 * detection, and 404'd as /en/us/pricing. Matching the pilot root OR the pilot
 * followed by a slash keeps both properties.
 */
export function isPilotPath(pathname: string): boolean {
  return (Object.keys(MARKETS) as Market[]).some((market) => {
    if (market === "int") return false;
    const root = MARKETS[market].path;
    return pathname === root || pathname.startsWith(`${root}/`);
  });
}

/**
 * An in-market link that also has to work for the locale-prefixed international
 * site.
 *
 * The two prefixing schemes are mutually exclusive and combining them produces
 * nonsense: pilots are served at locale-free URLs (/us/pricing), so applying the
 * next-intl prefix as well yields /us/en/pricing, which routes nowhere. `int`
 * keeps the locale prefix; every pilot ignores it.
 */
export function marketLink(market: Market, seoPrefix: string, path: string): string {
  return market === "int" ? `${seoPrefix}${path}` : marketPath(market, path);
}
