/** Smoke checks: each returns its problems, and an empty list is a PASS. */

import { extractSitemapUrls } from "../indexnow";
import {
  countBrand,
  hiddenLinksWithin,
  jsonLdOfType,
  parseAlternates,
  parseCanonical,
  parseFeedLinks,
  parseFontPreloads,
  parseHrefs,
  parseJsonLdBlocks,
  parseOpenGraph,
  parseRobots,
  pathOf,
  visibleText,
} from "./html";

const MAX_TITLE_LENGTH = 60;
const PER_MONTH = /\/(?:mo|month|mois)(?![a-zà-ÿ])/gi;

export function jsonLdProblems(html: string): string[] {
  const blocks = parseJsonLdBlocks(html);
  if (blocks.length === 0) return ['no <script type="application/ld+json"> in the raw HTML'];
  return blocks.flatMap((block, index) =>
    block.ok ? [] : [`ld+json block ${index + 1} is not valid JSON (${block.error})`],
  );
}

const MIN_DISTINCT_AMOUNTS = 3;
const NUMBER = "\\d+(?:[.,]\\d+)*";

/** The distinct amounts in one currency, each as symbol plus number whichever side the symbol sits on. */
function distinctAmounts(text: string, currency: "€" | "$"): Set<string> {
  const symbol = currency === "$" ? "\\$" : "€";
  const pattern = new RegExp(`${symbol}\\s?(${NUMBER})|(${NUMBER})\\s?${symbol}`, "g");
  return new Set([...text.matchAll(pattern)].map((match) => `${currency}${match[1] ?? match[2]}`));
}

/**
 * Prices a crawler can read: at least three distinct amounts in the page's
 * currency (a plan ladder, not one stray figure), the trial length when given,
 * and no per-month suffix left without a number in front of it (the shape a
 * loading skeleton leaves behind).
 */
export function priceProblems(
  html: string,
  expected: { currency: "€" | "$"; trialDays?: number },
): string[] {
  const text = visibleText(html);
  const problems: string[] = [];
  const amounts = distinctAmounts(text, expected.currency);
  if (amounts.size === 0) {
    problems.push(`no ${expected.currency} amount next to digits`);
  } else if (amounts.size < MIN_DISTINCT_AMOUNTS) {
    problems.push(
      `${amounts.size} distinct ${expected.currency} amount(s) (${[...amounts].join(", ")}), expected at least ${MIN_DISTINCT_AMOUNTS}`,
    );
  }
  if (
    expected.trialDays !== undefined &&
    !new RegExp(`\\b${expected.trialDays}[\\s-]*(?:days?|jours?|días|dni)\\b`, "i").test(text)
  ) {
    problems.push(`no ${expected.trialDays}-day trial in the raw HTML`);
  }
  for (const match of text.matchAll(PER_MONTH)) {
    const before = text.slice(0, match.index).trimEnd();
    if (!/[\d€$£]$/.test(before)) {
      const context = text.slice(Math.max(0, match.index - 40), match.index + match[0].length);
      problems.push(`empty price before "${match[0]}" (…${context.trim()})`);
    }
  }
  return problems;
}

export function titleProblems(title: string | null): string[] {
  if (title === null) return ["no <title>"];
  const problems: string[] = [];
  const brands = countBrand(title);
  if (brands > 1) problems.push(`"Stampeo" appears ${brands} times`);
  const length = [...title].length;
  if (length > MAX_TITLE_LENGTH) problems.push(`${length} characters (max ${MAX_TITLE_LENGTH})`);
  return problems;
}

export function canonicalProblems(html: string, path: string): string[] {
  const canonical = parseCanonical(html);
  if (!canonical) return ["no canonical link"];
  const actual = pathOf(canonical);
  return actual === path ? [] : [`canonical is "${actual}", expected "${path}"`];
}

/** `expected` maps hreflang → path; hreflang values compare case-insensitively. */
export function alternateProblems(html: string, expected: Record<string, string>): string[] {
  const alternates = Object.fromEntries(
    Object.entries(parseAlternates(html)).map(([lang, href]) => [lang.toLowerCase(), href]),
  );
  return Object.entries(expected).flatMap(([lang, path]) => {
    const href = alternates[lang.toLowerCase()];
    if (!href) return [`no hreflang="${lang}"`];
    const actual = pathOf(href);
    return actual === path ? [] : [`hreflang="${lang}" is "${actual}", expected "${path}"`];
  });
}

export function redirectProblems(
  response: { status: number; headers: Headers },
  expected: { status: number; to: string },
): string[] {
  const problems: string[] = [];
  if (response.status !== expected.status) {
    problems.push(`HTTP ${response.status}, expected ${expected.status}`);
  }
  const location = response.headers.get("location");
  if (!location) problems.push("no Location header");
  else if (pathOf(location) !== expected.to) {
    problems.push(`Location is "${pathOf(location)}", expected "${expected.to}"`);
  }
  return problems;
}

const NOINDEX = /noindex/i;

/** An indexable page: its canonical is its own path and no robots meta says noindex. */
export function indexablePageProblems(html: string, path: string): string[] {
  const robots = parseRobots(html);
  return [...canonicalProblems(html, path), ...(robots && NOINDEX.test(robots) ? [`robots meta is "${robots}"`] : [])];
}

/** A private page: noindex, and no canonical for a crawler to follow. */
export function privatePageProblems(html: string): string[] {
  const robots = parseRobots(html);
  const canonical = parseCanonical(html);
  return [
    ...(robots && NOINDEX.test(robots) ? [] : [`robots meta is ${robots === null ? "missing" : `"${robots}"`}, expected noindex`]),
    ...(canonical ? [`declares canonical "${canonical}"`] : []),
  ];
}

export function statusProblems(status: number, expected: number): string[] {
  return status === expected ? [] : [`HTTP ${status}, expected ${expected}`];
}

/** The paths of every `<loc>` in a sitemap, whatever host it names. */
export function sitemapPaths(xml: string): string[] {
  return extractSitemapUrls(xml).map(pathOf);
}

/** Anchors by their href exactly as written: `/en/` and `/en` are different links (one redirects). */
export function linkProblems(html: string, expected: { has?: string[]; lacks?: string[] }): string[] {
  const hrefs = new Set(parseHrefs(html));
  return [
    ...(expected.has ?? []).filter((href) => !hrefs.has(href)).map((href) => `no link to ${href}`),
    ...(expected.lacks ?? []).filter((href) => hrefs.has(href)).map((href) => `links to ${href}`),
  ];
}

/** The page text, matched with patterns that carry no `g` flag. */
export function textProblems(html: string, expected: { includes?: RegExp[]; excludes?: RegExp[] }): string[] {
  const text = visibleText(html);
  return [
    ...(expected.includes ?? []).filter((pattern) => !pattern.test(text)).map((pattern) => `no text matching ${pattern}`),
    ...(expected.excludes ?? []).flatMap((pattern) => {
      const found = pattern.exec(text);
      return found ? [`text matches ${pattern}: "${found[0]}"`] : [];
    }),
  ];
}

/** The URLs in the Article structured data's `image` (a string, or a list of them). */
export function articleImageUrls(html: string): string[] {
  return jsonLdOfType(html, "Article").flatMap((article) => {
    const image = article.image;
    return (Array.isArray(image) ? image : [image]).filter((url): url is string => typeof url === "string");
  });
}

export function imageResponseProblems(response: { status: number; contentType: string | null }): string[] {
  return [
    ...statusProblems(response.status, 200),
    ...((response.contentType ?? "").startsWith("image/") ? [] : [`content-type "${response.contentType ?? ""}", expected image/*`]),
  ];
}

/** Offers, when the page has them, are priced in the market's currency. The fallback price ladder emits none. */
export function offerProblems(html: string, currency: "EUR" | "USD"): string[] {
  const applications = jsonLdOfType(html, "SoftwareApplication");
  if (applications.length === 0) return ["no SoftwareApplication structured data"];
  const offers = applications.flatMap((application) => [application.offers].flat().filter(Boolean)) as Array<{
    name?: string;
    priceCurrency?: string;
  }>;
  return offers
    .filter((offer) => offer.priceCurrency !== currency)
    .map((offer) => `offer "${offer.name ?? "?"}" is in ${offer.priceCurrency ?? "no currency"}, expected ${currency}`);
}

/** The blog's RSS autodiscovery link, pointing at the locale's feed when one is given. */
export function feedLinkProblems(html: string, expectedPath?: string): string[] {
  const feeds = parseFeedLinks(html);
  if (feeds.length === 0) return ['no <link rel="alternate" type="application/rss+xml">'];
  const paths = feeds.map(pathOf);
  return expectedPath && !paths.includes(expectedPath) ? [`feed link is ${paths.join(", ")}, expected ${expectedPath}`] : [];
}

const OPEN_GRAPH_KEYS = ["og:title", "og:description", "og:image", "og:site_name", "og:type"];

export function openGraphProblems(html: string): string[] {
  const og = parseOpenGraph(html);
  return OPEN_GRAPH_KEYS.filter((key) => !og[key]?.trim()).map((key) => `no ${key}`);
}

/** No link in the header is hidden from assistive technology (a hidden duplicate of the navigation reads as cloaking). */
export function hiddenHeaderLinkProblems(html: string): string[] {
  return hiddenLinksWithin(html, "header").map((href) => `aria-hidden link in the header: ${href}`);
}

export function fontPreloadProblems(html: string, max: number): string[] {
  const fonts = parseFontPreloads(html);
  return fonts.length <= max ? [] : [`${fonts.length} font preloads (max ${max}): ${fonts.join(", ")}`];
}

export function indexNowKeyProblems(body: string, key: string): string[] {
  return body.trim() === key ? [] : [`body is "${body.trim().slice(0, 40)}", expected the key`];
}

/** The paths of a BreadcrumbList's items, in order. */
export function breadcrumbPaths(html: string): string[] {
  return jsonLdOfType(html, "BreadcrumbList").flatMap((list) =>
    ([list.itemListElement].flat().filter(Boolean) as Array<{ item?: unknown }>).flatMap(({ item }) => {
      const url = typeof item === "string" ? item : (item as { "@id"?: string } | undefined)?.["@id"];
      return url ? [pathOf(url)] : [];
    }),
  );
}

/** Every breadcrumb item sits under the locale prefix of the page (`/en`), or is the prefix itself. */
export function breadcrumbProblems(html: string, prefix: string): string[] {
  const paths = breadcrumbPaths(html);
  if (paths.length === 0) return ["no BreadcrumbList items"];
  return paths
    .filter((path) => path !== prefix && !path.startsWith(`${prefix}/`))
    .map((path) => `breadcrumb item ${path} is outside ${prefix}`);
}
