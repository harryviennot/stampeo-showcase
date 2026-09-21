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
 * A pilot goes live by setting `indexable: true` on its market. That one flag
 * drives both the page's `robots` and its presence in PILOT_HREFLANG, because
 * they are the same decision and were previously two edits in two files with the
 * instructions living in a third. Indexing a page without advertising it in the
 * homepage cluster produces an unreciprocated hreflang, which Google ignores —
 * so /us would compete with /en as a duplicate rather than being its US variant.
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
  /**
   * May Google index this pilot, and may the homepage advertise it?
   *
   * One flag for both: see the note above. A market must not be indexable while
   * its `currency` is not what it actually bills — /uk declared GBP with no GBP
   * Price for weeks, and indexing that would have ranked a "UK" page quoting
   * euros. Flip it in the same change as the Price, per
   * backend/docs/billing/ADDING_A_CURRENCY.md.
   */
  indexable: boolean;
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
    // Not a pilot: /en is the homepage, indexed through the normal locale
    // cluster rather than this one.
    indexable: false,
  },
  uk: {
    hreflang: "en-GB",
    path: "/uk",
    ogLocale: "en_GB",
    // EUR, not GBP. This field must state what the market is ACTUALLY billed
    // in, never what we intend to bill it in one day. It said "GBP" while no
    // GBP Price existed, so /uk requested a currency the catalog could not
    // price and was silently downgraded to euros — and the aspiration then
    // caused a second bug, offering a UK visitor a "see UK pricing" link that
    // changes no number. Change this in the same commit as the GBP ladder,
    // following docs/billing/ADDING_A_CURRENCY.md, and not before.
    currency: { symbol: "€", code: "EUR" },
    europeTrust: true,
    label: "uk",
    trialDays: 30,
    // Stays noindex while the line above says EUR. Indexing a "UK" page that
    // quotes euros ranks a promise we would not honour.
    indexable: false,
  },
  us: {
    hreflang: "en-US",
    path: "/us",
    ogLocale: "en_US",
    currency: { symbol: "$", code: "USD" },
    europeTrust: false,
    label: "us",
    trialDays: 14,
    // LIVE since 2026-09-15. All six public Prices carry currency_options.usd,
    // `currency_is_priceable('usd')` is true, and /us/pricing renders
    // $49 / $79 / $119 — so the page Google crawls quotes what a US business is
    // actually charged. It was noindex until that was true, for exactly this
    // reason: an indexed snippet outlives the page by weeks.
    indexable: true,
  },
};

/**
 * The hreflang cluster for the homepage: the plain locales, plus every pilot
 * that is actually indexable.
 *
 * DERIVED, not hand-written. The hand-written version listed `en-GB -> /uk`
 * while /uk was noindex — telling Google "the British version is here" and
 * pointing it at a page marked noindex, an annotation it cannot honour. Reading
 * `indexable` means the cluster and the pages' `robots` cannot disagree.
 */
export const PILOT_HREFLANG: Record<string, string> = {
  "x-default": "/en",
  fr: "/",
  en: "/en",
  es: "/es",
  pl: "/pl",
  ...Object.fromEntries(
    (Object.keys(MARKETS) as Market[])
      .filter((market) => market !== "int" && MARKETS[market].indexable)
      .map((market) => [MARKETS[market].hreflang, MARKETS[market].path]),
  ),
};

/**
 * The `robots` directive for any page inside a market.
 *
 * Neither the landing page nor the pricing page decides this for itself.
 * `/us/pricing` hardcoded `index: false` while `indexable` was flipped to true
 * and `indexablePilotPaths()` was already listing it in the sitemap, so the
 * sitemap invited Google to a page marked noindex. The comment saying the two
 * should track each other was in the file that did not get updated, which is
 * the argument for deriving it instead of writing it down twice.
 *
 * `follow` stays true even when noindex: a held-back pilot should still have
 * its links crawled, so going live does not start from zero discovery.
 */
export function marketRobots(market: Market): { index: boolean; follow: boolean } {
  return { index: MARKETS[market].indexable, follow: true };
}

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

/**
 * Where a visitor's chosen market is remembered between the showcase and the
 * dashboard.
 *
 * **A hint, never a price.** `/us` quotes $49 and a 14-day trial, its CTA opens
 * `/onboarding` on another host, and the country field there is defaulted by a
 * 12-entry timezone table that falls back to `en -> GB`. GB has no USD ladder,
 * so a US visitor could be quoted $49 and then check out at EUR 20. Someone who
 * deliberately opened `/us` has told us more than that heuristic can guess.
 *
 * What it must not do is decide the price. The backend never reads it: billing
 * currency comes from the postal address, then the country dropdown, both typed
 * by the owner. A cookie records which page someone clicked, which is weaker
 * evidence than either and trivially forged. All this does is prefill a field
 * the owner can change. (The showcase's DISPLAYED prices follow the visitor's
 * detected region since STA-330 — `lib/region-pricing.ts` — but that is
 * display-only and reads the browser directly, never this cookie.)
 *
 * Deliberately NOT `NEXT_LOCALE`. Locale, market and billing currency are three
 * axes this codebase keeps apart on purpose (see the header of the backend's
 * `app/core/pricing_region.py`): Polish is a locale that quotes euros, and `/uk`
 * is English and is not GBP. Carrying a market on the locale cookie is that
 * exact conflation.
 */
export const MARKET_COOKIE = "stampeo_market";

/** A month. Long enough to survive a think-it-over, short enough to expire. */
export const MARKET_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * The pilot market this path belongs to, or null for the international site.
 *
 * `int` is never returned: it implies no country, and stamping it would erase a
 * real market the moment a US visitor clicked through to the homepage.
 */
export function marketFromPath(pathname: string): Market | null {
  for (const market of Object.keys(MARKETS) as Market[]) {
    if (market === "int") continue;
    const root = MARKETS[market].path;
    if (pathname === root || pathname.startsWith(`${root}/`)) return market;
  }
  return null;
}

/**
 * The `Domain` the cookie needs so the dashboard can read it.
 *
 * The app is always a subdomain of the showcase — `stampeo.app` /
 * `app.stampeo.app` in production, `dev.stampeo.app` / `app.dev.stampeo.app` on
 * dev — so the showcase's own host with a leading dot covers both without an
 * environment switch.
 *
 * Returns undefined for single-label hosts and IPs: browsers reject a `Domain`
 * attribute there and drop the cookie silently, which would make local dev look
 * like a code bug.
 */
export function cookieDomainForHost(host: string | null | undefined): string | undefined {
  const bare = (host ?? "").split(":")[0].trim().toLowerCase();
  if (!bare || !bare.includes(".")) return undefined;
  if (/^[\d.]+$/.test(bare)) return undefined;
  return `.${bare}`;
}

/**
 * Every pilot URL that belongs in the sitemap.
 *
 * A market that Google may index should also be listed, or it is discoverable
 * only through the homepage's hreflang annotation — which works, but leaves the
 * page's existence dependent on Google following one link. The sitemap iterates
 * LOCALES, and a pilot is not a locale, so these would never appear there
 * otherwise.
 *
 * Reads the same `indexable` flag as the pages' `robots` and PILOT_HREFLANG, so
 * a market cannot end up listed in one place and hidden in another.
 */
export function indexablePilotPaths(): string[] {
  return (Object.keys(MARKETS) as Market[])
    .filter((market) => market !== "int" && MARKETS[market].indexable)
    .flatMap((market) => [MARKETS[market].path, `${MARKETS[market].path}/pricing`]);
}
