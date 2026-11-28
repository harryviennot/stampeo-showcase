/**
 * What a visitor of each homepage reads, through the real routes: `/`, `/en`, `/es`, `/pl` and `/uk` quote euros and
 * the 14-day trial, `/us` dollars and the same 14 days. The route's default export is rendered whole (the page, its shell and
 * the shell's pricing provider), as the server sends it before the browser's region can change anything, and the
 * homepage's structured data is read from the same render.
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { createTranslator } from "next-intl";
import { landingCopy } from "../landing-pages/copy/bundle";
import { FALLBACK_PRICING, formatMoney } from "../pricing";
import { loadCatalog } from "../testing/catalogs";
import { renderAtPathAsync } from "../testing/pathname-seam";
import { sectionsOf } from "../testing/preview-page";
import { renderInAsync, textOf } from "../testing/render-en";
import { restoreEnvAfterEach } from "../testing/restore-env";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { inServerLocale, mockEnglishServerTranslations } from "../testing/server-intl";

// The backend answers the catalog request with the baked ladders, so the pages print a live catalog (not the
// fallback) and the structured data carries its offers. No module is mocked: a module mock outlives this file.
restoreEnvAfterEach("NEXT_PUBLIC_API_URL");
restoreGlobalsAfterEach("fetch");
beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://backend.test";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const ladder = FALLBACK_PRICING[new URL(String(input)).searchParams.get("currency") ?? "eur"];
    const tiers = Object.fromEntries(
      Object.entries(ladder.tiers).map(([tier, { month, year }]) => [
        tier,
        { month: { amount: month * 100 }, year: { amount: year * 100 } },
      ]),
    );
    return new Response(JSON.stringify({ currency: ladder.currency, tiers }), { status: 200 });
  }) as typeof fetch;
});
await mockEnglishServerTranslations();

const home = await import("@/app/[locale]/page");
const usHome = await import("@/app/[locale]/us/page");
const ukHome = await import("@/app/[locale]/uk/page");

type Terms = { currency: "eur" | "usd"; trialDays: number };

const EURO: Terms = { currency: "eur", trialDays: 14 };
const DOLLAR: Terms = { currency: "usd", trialDays: 14 };

/** Each homepage URL, the language it is read in and what it quotes. */
const HOMEPAGES: ReadonlyArray<readonly [path: string, locale: string, terms: Terms]> = [
  ["/", "fr", EURO],
  ["/en", "en", EURO],
  ["/es", "es", EURO],
  ["/pl", "pl", EURO],
  ["/uk", "en", EURO],
  ["/us", "en", DOLLAR],
];

const OTHER = { eur: "usd", usd: "eur" } as const;
const VISITS = new Map<string, Promise<string>>();

/** The page of a URL as the server renders it. */
function visit(path: string, locale: string): Promise<string> {
  if (!VISITS.has(path)) {
    VISITS.set(
      path,
      inServerLocale(locale, async () => {
        const tree = path === "/us" ? usHome.default() : path === "/uk" ? ukHome.default() : await home.default({ params: Promise.resolve({ locale }) });

        return renderAtPathAsync(path, () => renderInAsync(locale, tree));
      }),
    );
  }
  return VISITS.get(path) as Promise<string>;
}

const tiers = ["starter", "growth", "pro"] as const;
const yearly = (currency: "eur" | "usd", locale: string) => tiers.map((tier) => formatMoney(FALLBACK_PRICING[currency].tiers[tier].year, currency, locale));

describe.each(HOMEPAGES)("%s", (path, locale, { currency, trialDays }) => {
  test("the plans are priced in the market's currency, and in no other", async () => {
    const pricing = textOf(sectionsOf(await visit(path, locale)).find(({ id }) => id === "pricing")?.html ?? "");

    for (const total of yearly(currency, locale)) expect(pricing).toContain(total);
    for (const total of yearly(OTHER[currency], locale)) expect(pricing).not.toContain(total);
  });

  test("the pricing block and every trial button promise the market's trial, and no other", async () => {
    const text = textOf(await visit(path, locale));
    const { reassurance } = landingCopy(locale, path === "/us" ? "us" : "int").shared.SHARED;
    const pricing = createTranslator({ locale, messages: loadCatalog(locale), namespace: "pricing" });
    // The retired 30-day trial: a page that still prints it promises what the backend no longer grants.
    const other = 30;

    const times = (line: string) => text.split(line).length - 1;

    // The hero, the two buttons in the middle and the closing band; each plan's own line (in Polish the two are one line).
    expect(times(reassurance.replace("{trialDays}", String(trialDays)))).toBeGreaterThanOrEqual(4);
    expect(times(pricing("ctaSubtext", { trialDays }))).toBeGreaterThanOrEqual(3);
    expect(text).not.toContain(reassurance.replace("{trialDays}", String(other)));
    expect(text).not.toContain(pricing("ctaSubtext", { trialDays: other }));
  });

  test("the structured data offers each plan at that ladder: the price and its currency", async () => {
    const html = await visit(path, locale);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((match) => JSON.parse(match[1].replaceAll("\\u003c", "<")));
    const software = blocks.find((block) => block["@type"] === "SoftwareApplication");
    const offers = (software?.offers ?? []) as Array<{ price: string; priceCurrency: string }>;
    const ladder = FALLBACK_PRICING[currency].tiers;

    expect(offers).toHaveLength(6);
    expect(offers.map((offer) => offer.priceCurrency)).toEqual(Array(6).fill(currency.toUpperCase()));
    expect(offers.map((offer) => offer.price).sort()).toEqual(tiers.flatMap((tier) => [ladder[tier].month, ladder[tier].year]).map(String).sort());
  });
});
