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

import {
  alternateProblems,
  canonicalProblems,
  jsonLdProblems,
  priceProblems,
  redirectProblems,
  titleProblems,
} from "./seo-smoke/checks";
import { parseTitle } from "./seo-smoke/html";

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
