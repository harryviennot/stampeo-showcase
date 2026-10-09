/**
 * Crawler-view smoke test: fetches a running build the way a non-JS crawler
 * does and checks what the raw HTML and headers say (structured data, prices,
 * titles, canonical, hreflang, redirects, icons and machine files).
 *
 *   bun scripts/seo-smoke.ts [baseUrl]     (default http://localhost:3000)
 *
 * Prints PASS/FAIL per check and exits 1 on any FAIL. Canonical and hreflang
 * hrefs are absolute https://stampeo.app URLs (metadataBase) even on localhost,
 * so every URL is compared by path. The checks hold on a build with the plan
 * catalog and on one without (the fallback price ladder, which emits no Offers).
 */

import { buildSeoLinks } from "../lib/seo-links";
import type { Market } from "../lib/markets";
import {
  alternateProblems,
  articleImageUrls,
  breadcrumbPaths,
  breadcrumbProblems,
  canonicalProblems,
  feedLinkProblems,
  fontPreloadProblems,
  hiddenHeaderLinkProblems,
  imageResponseProblems,
  indexNowKeyProblems,
  indexablePageProblems,
  jsonLdProblems,
  linkProblems,
  offerProblems,
  openGraphProblems,
  priceProblems,
  privatePageProblems,
  redirectProblems,
  sitemapPaths,
  statusProblems,
  textProblems,
  titleProblems,
} from "./seo-smoke/checks";
import { createClient, inBatches, onBase } from "./seo-smoke/client";
import { parseOpenGraph, parseTitle } from "./seo-smoke/html";
import { findKeyFile } from "./indexnow";

type Check = { name: string; run: () => Promise<string[]> };

const EN_US = { "Accept-Language": "en-US,en;q=0.9" };
const SITEMAP_BATCH = 8;

/** The complete hreflang cluster: the same set on every page that belongs to it. */
const cluster = (prefixes: Record<string, string>) => ({ ...prefixes, "x-default": prefixes.en });
const HOME_CLUSTER = cluster({ fr: "/", en: "/en", es: "/es", pl: "/pl", "en-US": "/us" });
const PRICING_CLUSTER = cluster({
  fr: "/pricing",
  en: "/en/pricing",
  es: "/es/pricing",
  pl: "/pl/pricing",
  "en-US": "/us/pricing",
});
const COFFEE_POST_CLUSTER = cluster({ fr: "/blog/carte-fidelite-cafe", en: "/en/blog/coffee-shop-loyalty-card" });

export function buildChecks(baseUrl: string): Check[] {
  const { request, fetchPage, page, onPage, probe } = createClient(baseUrl);
  const jsonLdPages = ["/", "/en", "/us", "/pricing", "/us/pricing", "/en/blog/coffee-shop-loyalty-card"];
  const metadataPages = ["/", "/en", "/us", "/pricing", "/en/pricing", "/us/pricing"];
  const titlePages = [...metadataPages, "/privacy", "/terms"];
  const privatePages = ["/login", "/en/login", "/onboarding", "/reset-password", "/email-preferences"];
  const junkPaths = ["/month", "/mo", "/mois", "/mes"];
  const openGraphPages = ["/us", "/us/pricing", "/pricing", "/en/pricing", "/contact"];
  const footerPages: Array<{ path: string; locale: string; market: Market }> = [
    { path: "/", locale: "fr", market: "int" },
    { path: "/en", locale: "en", market: "int" },
    { path: "/us", locale: "en", market: "us" },
  ];
  const hreflangPages: Array<[string, Record<string, string>]> = [
    ["/", HOME_CLUSTER],
    ["/en", HOME_CLUSTER],
    ["/us", HOME_CLUSTER],
    ["/pricing", PRICING_CLUSTER],
    ["/us/pricing", PRICING_CLUSTER],
    ["/blog/carte-fidelite-cafe", COFFEE_POST_CLUSTER],
    ["/en/blog/coffee-shop-loyalty-card", COFFEE_POST_CLUSTER],
  ];
  const feedPages: Array<[string, string]> = [
    ["/blog", "/feed-fr.xml"],
    ["/en/blog", "/feed-en.xml"],
    ["/blog/carte-fidelite-cafe", "/feed-fr.xml"],
    ["/en/blog/coffee-shop-loyalty-card", "/feed-en.xml"],
  ];

  const redirect = (path: string, to: string, status: number, headers?: Record<string, string>): Check => ({
    name: `Redirect ${path} → ${status} ${to}`,
    run: async () => redirectProblems(await request(path, headers), { status, to }),
  });

  const pngIcon = (path: string): Check => ({
    name: `Icon ${path}`,
    run: async () => {
      const res = await request(path);
      const type = res.headers.get("content-type") ?? "";
      return [
        ...(res.status === 200 ? [] : [`HTTP ${res.status}, expected 200`]),
        ...(type.startsWith("image/png") ? [] : [`content-type "${type}", expected image/png`]),
      ];
    },
  });

  const textFile = (path: string, name: string, check: (body: string) => string[]): Check => ({
    name,
    run: async () => {
      const res = await request(path);
      if (res.status !== 200) return [`HTTP ${res.status}, expected 200`];
      return check(await res.text());
    },
  });

  /** An image URL named by a page must answer 200 as an image. */
  const imageProblems = async (url: string) =>
    imageResponseProblems(await probe(onBase(url))).map((problem) => `${url}: ${problem}`);

  const articleImage = (path: string): Check => ({
    name: `Article image ${path}`,
    run: onPage(path, async (html) => {
      const urls = articleImageUrls(html);
      if (urls.length === 0) return ["no image in the Article structured data"];
      return (await Promise.all(urls.map(imageProblems))).flat();
    }),
  });

  const openGraph = (path: string): Check => ({
    name: `OpenGraph ${path}`,
    run: onPage(path, async (html) => {
      const image = parseOpenGraph(html)["og:image"];
      return [...openGraphProblems(html), ...(image ? await imageProblems(image) : [])];
    }),
  });

  const sitemapIsSelfCanonical: Check = {
    name: "Sitemap: every URL answers 200, is its own canonical and is indexable",
    run: async () => {
      const res = await request("/sitemap.xml");
      if (res.status !== 200) return [`sitemap.xml: HTTP ${res.status}, expected 200`];
      const paths = sitemapPaths(await res.text());
      if (paths.length === 0) return ["no <loc> in the sitemap"];
      const results = await inBatches(paths, SITEMAP_BATCH, async (path) => {
        const { status, html } = await fetchPage(path);
        const problems = status === 200 ? indexablePageProblems(html, path) : [`HTTP ${status}, expected 200`];
        return problems.map((problem) => `${path}: ${problem}`);
      });
      return results.flat();
    },
  };

  const breadcrumbLeadsToPages = (path: string, prefix: string): Check => ({
    name: `Breadcrumb ${path}: items under ${prefix}, each answers 200`,
    run: onPage(path, async (html) => {
      const statuses = await Promise.all(
        breadcrumbPaths(html).map(async (item) => ({ item, status: (await page(item)).status })),
      );
      return [
        ...breadcrumbProblems(html, prefix),
        ...statuses.flatMap(({ item, status }) => statusProblems(status, 200).map((problem) => `${item}: ${problem}`)),
      ];
    }),
  });

  return [
    ...jsonLdPages.map((path) => ({ name: `JSON-LD ${path}`, run: onPage(path, jsonLdProblems) })),

    { name: "Prices / (€)", run: onPage("/", (html) => priceProblems(html, { currency: "€" })) },
    {
      name: "Prices /pricing (€, 30-day trial)",
      run: onPage("/pricing", (html) => priceProblems(html, { currency: "€", trialDays: 30 })),
    },
    {
      name: "Prices /en/pricing (€, 30-day trial)",
      run: onPage("/en/pricing", (html) => priceProblems(html, { currency: "€", trialDays: 30 })),
    },
    { name: "Prices /us/pricing ($)", run: onPage("/us/pricing", (html) => priceProblems(html, { currency: "$" })) },
    {
      name: "Prices /us ($, 14-day trial)",
      run: onPage("/us", (html) => priceProblems(html, { currency: "$", trialDays: 14 })),
    },
    {
      name: "/us links to /us/pricing, never /en/us/pricing",
      run: onPage("/us", (html) => linkProblems(html, { has: ["/us/pricing"], lacks: ["/en/us/pricing"] })),
    },
    {
      name: "/us sector cards show $10, and no € anywhere",
      run: onPage("/us", (html) => textProblems(html, { includes: [/\$\s?10\b/], excludes: [/€/] })),
    },
    {
      name: "Offers /pricing are in EUR",
      run: onPage("/pricing", (html) => offerProblems(html, "EUR")),
    },
    {
      name: "Offers /us/pricing are in USD",
      run: onPage("/us/pricing", (html) => offerProblems(html, "USD")),
    },

    ...titlePages.map((path) => ({
      name: `Title ${path}`,
      run: onPage(path, (html) => {
        const title = parseTitle(html);
        const problems = titleProblems(title);
        return problems.length ? [...problems, `title: "${title}"`] : [];
      }),
    })),
    ...metadataPages.map((path) => ({
      name: `Canonical ${path}`,
      run: onPage(path, (html) => canonicalProblems(html, path)),
    })),
    sitemapIsSelfCanonical,
    ...privatePages.map((path) => ({ name: `Private page ${path}: noindex, no canonical`, run: onPage(path, privatePageProblems) })),
    {
      name: `Junk paths ${junkPaths.join(" ")} stay 404`,
      run: async () =>
        (
          await Promise.all(
            junkPaths.map(async (path) => statusProblems((await request(path)).status, 404).map((problem) => `${path}: ${problem}`)),
          )
        ).flat(),
    },

    ...hreflangPages.map(([path, languages]) => ({
      name: `hreflang ${path}`,
      run: onPage(path, (html) => alternateProblems(html, languages)),
    })),
    ...feedPages.map(([path, feed]) => ({
      name: `RSS link ${path}`,
      run: onPage(path, (html) => feedLinkProblems(html, feed)),
    })),
    ...openGraphPages.map(openGraph),
    articleImage("/en/blog/coffee-shop-loyalty-card"),
    articleImage("/blog/carte-fidelite-cafe"),

    ...footerPages.map(({ path, locale, market }) => ({
      name: `Footer links and no hidden header nav ${path}`,
      run: onPage(path, (html) => [
        ...linkProblems(html, { has: [...new Set(buildSeoLinks(locale, market).map(({ href }) => href))] }),
        ...hiddenHeaderLinkProblems(html),
      ]),
    })),
    { name: "At most 2 font preloads on /", run: onPage("/", (html) => fontPreloadProblems(html, 2)) },

    {
      name: "Blog header /en/blog/coffee-shop-loyalty-card: English reading time, no French",
      run: onPage("/en/blog/coffee-shop-loyalty-card", (html) =>
        textProblems(html, { includes: [/\d+ min read/], excludes: [/Mis à jour/] }),
      ),
    },
    {
      name: "Blog header /es/blog/tarjeta-fidelidad-sin-app: Spanish reading time",
      run: onPage("/es/blog/tarjeta-fidelidad-sin-app", (html) => textProblems(html, { includes: [/min de lectura/] })),
    },
    breadcrumbLeadsToPages("/en/blog/coffee-shop-loyalty-card", "/en"),

    {
      name: "Redirect / (en-US) → 307 /en, Vary: Accept-Language, Cache-Control: no-store",
      run: async () => {
        const res = await request("/", EN_US);
        const vary = res.headers.get("vary") ?? "";
        const cacheControl = res.headers.get("cache-control") ?? "";
        return [
          ...redirectProblems(res, { status: 307, to: "/en" }),
          ...(/accept-language/i.test(vary) ? [] : [`Vary is "${vary}", expected it to contain Accept-Language`]),
          ...(/no-store/i.test(cacheControl) ? [] : [`Cache-Control is "${cacheControl}", expected no-store`]),
        ];
      },
    },
    {
      name: "French deep URL /blog/carte-fidelite-wallet (en-US) → 200, no NEXT_LOCALE cookie",
      run: async () => {
        const res = await request("/blog/carte-fidelite-wallet", EN_US);
        const cookies = res.headers.getSetCookie().filter((cookie) => cookie.startsWith("NEXT_LOCALE="));
        return [
          ...(res.status === 200 ? [] : [`HTTP ${res.status}, expected 200`]),
          ...cookies.map((cookie) => `sets ${cookie.split(";")[0]}`),
        ];
      },
    },
    redirect("/en/us/pricing", "/us/pricing", 308),
    redirect("/founding-partner", "/pricing", 308),
    {
      name: "Redirect /en/blog/carte-fidelite-cafe → 308 /blog/carte-fidelite-cafe → 200 (en-US)",
      run: async () => {
        const first = redirectProblems(await request("/en/blog/carte-fidelite-cafe"), {
          status: 308,
          to: "/blog/carte-fidelite-cafe",
        });
        const destination = await request("/blog/carte-fidelite-cafe", EN_US);
        return [
          ...first,
          ...(destination.status === 200 ? [] : [`destination with en-US answers HTTP ${destination.status}`]),
        ];
      },
    },

    pngIcon("/icon-192.png"),
    pngIcon("/icon-512.png"),
    {
      name: "IndexNow key file is served and holds the key",
      run: async () => {
        const file = findKeyFile();
        if (!file) return ["no <key>.txt in public/"];
        const res = await request(`/${file}`);
        if (res.status !== 200) return statusProblems(res.status, 200);
        return indexNowKeyProblems(await res.text(), file.replace(/\.txt$/, ""));
      },
    },
    textFile("/llms.txt", "llms.txt has a US section", (body) =>
      /^#{2,3} United States\b/m.test(body) ? [] : ['no "United States" heading'],
    ),
    textFile("/robots.txt", "robots.txt does not mention opengraph-image", (body) =>
      body.includes("opengraph-image") ? ["mentions opengraph-image"] : [],
    ),
    textFile("/sitemap.xml", "sitemap.xml answers 200", () => []),
  ];
}

async function main(baseUrl: string): Promise<number> {
  console.log(`SEO smoke test against ${baseUrl}\n`);
  const checks = buildChecks(baseUrl);
  let failed = 0;
  for (const check of checks) {
    let problems: string[];
    try {
      problems = await check.run();
    } catch (error) {
      problems = [`request failed: ${error instanceof Error ? error.message : String(error)}`];
    }
    if (problems.length === 0) {
      console.log(`PASS  ${check.name}`);
    } else {
      failed += 1;
      console.log(`FAIL  ${check.name}`);
      for (const problem of problems) console.log(`        - ${problem}`);
    }
  }
  console.log(`\n${checks.length - failed} passed, ${failed} failed`);
  return failed === 0 ? 0 : 1;
}

if (import.meta.main) {
  process.exit(await main(process.argv[2] ?? "http://localhost:3000"));
}
