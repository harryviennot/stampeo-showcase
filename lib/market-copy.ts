import type { ReactNode } from "react";

import type { Market } from "./markets";

/**
 * Market-scoped copy: the same language, written for a different country.
 *
 * `/us` quotes dollars, grants a 14-day trial and hides the "Made in Europe"
 * strip, but it renders from the English catalog. What it also needs is
 * different English: an American small-business owner is sold to differently
 * than the generic international reader, and a few of our strings are simply
 * false in the US ("no commitment" is not the phrase, a free month is not the
 * trial).
 *
 * A new `en-US` LOCALE would be the obvious way to get that and is the wrong
 * one. Locale, market and billing currency are three axes this codebase keeps
 * apart on purpose (see the header of `lib/markets.ts` and the backend's
 * `app/core/pricing_region.py`): Polish is a locale that quotes euros, and
 * `/uk` is English and is not GBP. Adding `en-US` would conflate market with
 * language, oblige a fifth folder under `messages/`, and put the whole
 * marketing site into a locale negotiation it does not belong in.
 *
 * So a market override is a subtree inside the English catalog:
 *
 *     variant.hero.title        <- everyone
 *     variant.us.hero.title     <- /us only, falls back to the line above
 *
 * Only the strings that must differ are overridden. Everything else stays
 * single-sourced, which is the point: a page with two full copies of its text
 * drifts within a month.
 */

/**
 * The key to actually read, given the market looking.
 *
 * Kept as a free function taking `has` so it can be tested without a next-intl
 * runtime, per the repo's preference for pure-function unit tests.
 */
export function marketScopedKey(
  key: string,
  market: Market,
  has: (key: string) => boolean,
): string {
  // `int` is the page the overrides exist to differ FROM. It must not merely
  // fail to find `int.*` today; it must never look, or a market subtree added
  // later would silently rewrite the homepage.
  if (market === "int") return key;
  const scoped = `${market}.${key}`;
  return has(scoped) ? scoped : key;
}

/** What next-intl accepts as interpolation values for a plain string. */
export type CopyValues = Record<string, string | number | Date>;

/** ...and for a rich string, where a tag maps to a wrapping render function. */
export type RichCopyValues = Record<
  string,
  string | number | Date | ((chunks: ReactNode) => ReactNode)
>;

/**
 * The subset of a next-intl translator this needs. Structural on purpose: both
 * `useTranslations` and `getTranslations` satisfy it, and neither one's full
 * generic signature is worth reproducing here.
 */
export interface Translator {
  (key: string, values?: CopyValues): string;
  rich(key: string, values?: RichCopyValues): ReactNode;
  raw(key: string): unknown;
  has(key: string): boolean;
}

/**
 * Wrap a translator so every lookup prefers the market's own copy.
 *
 * `t` must be namespaced at `variant`, so the keys passed in read
 * `hero.title`, not `variant.hero.title`.
 */
export function marketCopy(t: Translator, market: Market) {
  const pick = (key: string) => marketScopedKey(key, market, (k) => t.has(k));

  return {
    t: (key: string, values?: CopyValues) => t(pick(key), values),
    rich: (key: string, values?: RichCopyValues) => t.rich(pick(key), values),
    raw: (key: string) => t.raw(pick(key)),
    /** Does this key resolve at all, as an override or as the base string? */
    has: (key: string) => t.has(pick(key)),
  };
}

export type MarketCopy = ReturnType<typeof marketCopy>;
