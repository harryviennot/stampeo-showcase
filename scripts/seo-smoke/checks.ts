/** Smoke checks: each returns its problems, and an empty list is a PASS. */

import {
  countBrand,
  parseAlternates,
  parseCanonical,
  parseJsonLdBlocks,
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

/**
 * Prices a crawler can read: an amount in the page's currency, the trial
 * length when given, and no per-month suffix left without a number in front of
 * it (the shape a loading skeleton leaves behind).
 */
export function priceProblems(
  html: string,
  expected: { currency: "€" | "$"; trialDays?: number },
): string[] {
  const text = visibleText(html);
  const problems: string[] = [];
  const symbol = expected.currency === "$" ? "\\$" : "€";
  if (!new RegExp(`${symbol}\\s*\\d|\\d\\s*${symbol}`).test(text)) {
    problems.push(`no ${expected.currency} amount next to digits`);
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
