/**
 * Crawler-view smoke test: fetches a running build the way a non-JS crawler
 * does and checks what the raw HTML and headers say (structured data, prices,
 * titles, canonical, hreflang, redirects, icons and machine files).
 *
 *   bun scripts/seo-smoke.ts [baseUrl]     (default http://localhost:3000)
 *
 * Prints PASS/FAIL per check and exits 1 on any FAIL. Canonical and hreflang
 * hrefs are absolute https://stampeo.app URLs (metadataBase) even on localhost,
 * so every URL is compared by path.
 */

const BRAND = /stampeo/gi;
const MAX_TITLE_LENGTH = 60;
const PER_MONTH = /\/(?:mo|month|mois)(?![a-zà-ÿ])/gi;

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const point = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const body = tag.replace(/^<[a-z]+/i, "").replace(/\/?>$/, "");
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

/** The markup a crawler parses as elements: scripts, styles and inline SVGs removed. */
function markup(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg\s*>/gi, "");
}

function tags(html: string, name: string): Record<string, string>[] {
  return [...markup(html).matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => parseAttributes(m[0]));
}

/** The page text without tags, entities decoded and every no-break space made a plain space. */
function visibleText(html: string): string {
  return decodeEntities(markup(html).replace(/<[^>]*>/g, "")).replace(/[   ]/g, " ");
}

/** The path of an absolute or relative URL, without a trailing slash (except `/`). */
function pathOf(url: string): string {
  const path = new URL(url, "https://stampeo.app").pathname;
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

export function parseTitle(html: string): string | null {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(markup(html));
  return match ? decodeEntities(match[1]).trim() : null;
}

export function parseMetaDescription(html: string): string | null {
  const meta = tags(html, "meta").find((attrs) => attrs.name?.toLowerCase() === "description");
  return meta?.content ?? null;
}

function linksWithRel(html: string, rel: string): Record<string, string>[] {
  return tags(html, "link").filter((attrs) => (attrs.rel ?? "").toLowerCase().split(/\s+/).includes(rel));
}

export function parseCanonical(html: string): string | null {
  return linksWithRel(html, "canonical")[0]?.href ?? null;
}

/** hreflang → href, as written in the page. Alternates without hreflang (RSS) are skipped. */
export function parseAlternates(html: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attrs of linksWithRel(html, "alternate")) {
    if (attrs.hreflang && attrs.href) map[attrs.hreflang] = attrs.href;
  }
  return map;
}

export type JsonLdBlock =
  | { ok: true; raw: string; data: unknown }
  | { ok: false; raw: string; error: string };

/**
 * Every real `<script type="application/ld+json">` element. Script bodies are
 * consumed whole, so the RSC flight payload (which mentions the same type
 * inside an escaped string) never counts.
 */
export function parseJsonLdBlocks(html: string): JsonLdBlock[] {
  const blocks: JsonLdBlock[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const type = parseAttributes(`<script${match[1]}>`).type?.trim().toLowerCase();
    if (type !== "application/ld+json") continue;
    const raw = match[2];
    try {
      blocks.push({ ok: true, raw, data: JSON.parse(raw) });
    } catch (error) {
      blocks.push({ ok: false, raw, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return blocks;
}

export function countBrand(title: string): number {
  return title.match(BRAND)?.length ?? 0;
}

// ---------------------------------------------------------------------------
// Checks: each returns its problems; an empty list is a PASS.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

type Check = { name: string; run: () => Promise<string[]> };

const EN_US = { "Accept-Language": "en-US,en;q=0.9" };

function createClient(baseUrl: string) {
  const request = (path: string, headers: Record<string, string> = {}) =>
    fetch(new URL(path, baseUrl), { redirect: "manual", headers, signal: AbortSignal.timeout(30_000) });

  const pages = new Map<string, Promise<{ status: number; html: string }>>();
  const page = (path: string) => {
    if (!pages.has(path)) {
      pages.set(path, request(path).then(async (res) => ({ status: res.status, html: await res.text() })));
    }
    return pages.get(path)!;
  };

  /** Runs `check` on a page that must answer 200 without redirecting. */
  const onPage = (path: string, check: (html: string) => string[]) => async () => {
    const { status, html } = await page(path);
    return status === 200 ? check(html) : [`HTTP ${status}, expected 200`];
  };

  return { request, onPage };
}

function buildChecks(baseUrl: string): Check[] {
  const { request, onPage } = createClient(baseUrl);
  const jsonLdPages = ["/", "/en", "/us", "/pricing", "/us/pricing", "/en/blog/coffee-shop-loyalty-card"];
  const metadataPages = ["/", "/en", "/us", "/pricing", "/en/pricing", "/us/pricing"];

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

  return [
    ...jsonLdPages.map((path) => ({ name: `JSON-LD ${path}`, run: onPage(path, jsonLdProblems) })),

    { name: "Prices /pricing (€)", run: onPage("/pricing", (html) => priceProblems(html, { currency: "€" })) },
    { name: "Prices /us/pricing ($)", run: onPage("/us/pricing", (html) => priceProblems(html, { currency: "$" })) },
    {
      name: "Prices /us ($, 14-day trial)",
      run: onPage("/us", (html) => priceProblems(html, { currency: "$", trialDays: 14 })),
    },

    ...metadataPages.map((path) => ({
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

    {
      name: "hreflang /pricing",
      run: onPage("/pricing", (html) =>
        alternateProblems(html, { "en-US": "/us/pricing", "x-default": "/en/pricing" }),
      ),
    },
    {
      name: "hreflang /en/blog/coffee-shop-loyalty-card",
      run: onPage("/en/blog/coffee-shop-loyalty-card", (html) =>
        alternateProblems(html, { fr: "/blog/carte-fidelite-cafe" }),
      ),
    },

    {
      name: "Redirect / (en-US) → 307 /en, Vary: Accept-Language",
      run: async () => {
        const res = await request("/", EN_US);
        const vary = res.headers.get("vary") ?? "";
        return [
          ...redirectProblems(res, { status: 307, to: "/en" }),
          ...(/accept-language/i.test(vary) ? [] : [`Vary is "${vary}", expected it to contain Accept-Language`]),
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
