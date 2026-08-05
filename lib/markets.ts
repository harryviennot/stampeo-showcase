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
}

export const MARKETS: Record<Market, MarketConfig> = {
  int: {
    hreflang: "en",
    path: "/en",
    ogLocale: "en_US",
    currency: { symbol: "€", code: "EUR" },
    europeTrust: true,
    label: "int",
  },
  uk: {
    hreflang: "en-GB",
    path: "/uk",
    ogLocale: "en_GB",
    currency: { symbol: "£", code: "GBP" },
    europeTrust: true,
    label: "uk",
  },
  us: {
    hreflang: "en-US",
    path: "/us",
    ogLocale: "en_US",
    currency: { symbol: "$", code: "USD" },
    europeTrust: false,
    label: "us",
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
};
