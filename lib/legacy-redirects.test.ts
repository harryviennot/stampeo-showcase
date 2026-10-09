/**
 * Old URLs that Search Console still crawls, followed the way a crawler
 * follows them: through Next's own `redirects()` matcher, then through the
 * proxy with an English browser and no cookie. Each one must land on a live
 * page in one permanent hop, and junk must stay 404.
 */

import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import sitemap from "@/app/sitemap";
import { routing } from "@/i18n/routing";
import proxy from "../proxy";
import { hasBlog } from "./blog/locales";
import { FEATURE_SLUGS, getLocalizedSlug } from "./feature-slugs";
import { DEFAULT_LOCALE, SITE_LOCALES, legacyRedirects } from "./legacy-redirects";

const ORIGIN = "https://stampeo.app";
const ROOT = join(import.meta.dir, "..");
const APP = join(ROOT, "app", "[locale]");
const BLOG = join(ROOT, "content", "blog");

const RULES = legacyRedirects();
const nextConfig = { redirects: async () => RULES };

/** Where Next's `redirects()` sends this path, or null when no rule matches. */
async function redirectOf(path: string): Promise<{ status: number; to: string } | null> {
  const response = await unstable_getResponseFromNextConfig({ url: `${ORIGIN}${path}`, nextConfig });
  const location = getRedirectUrl(response);
  if (!location) return null;
  const url = new URL(location);
  return { status: response.status, to: `${url.pathname}${url.search}` };
}

/** Does the proxy redirect an English browser with no cookie away from this path? */
async function proxyRedirects(path: string): Promise<boolean> {
  const request = new NextRequest(`${ORIGIN}${path}`, {
    headers: { "accept-language": "en-US,en;q=0.9" },
  });
  return getRedirectUrl(await proxy(request)) !== null;
}

function postSlugs(locale: string): string[] {
  const dir = join(BLOG, locale);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

/** Does this path render a page today? Merchant slugs are out of reach and not counted. */
function isLiveRoute(path: string): boolean {
  const segments = path.split("?")[0].split("/").filter(Boolean);
  // The default locale is unprefixed; `/fr/...` itself only redirects.
  if (segments[0] === routing.defaultLocale) return false;
  const locale = (routing.locales as readonly string[]).includes(segments[0])
    ? (segments.shift() as string)
    : routing.defaultLocale;

  const [head, slug, ...rest] = segments;
  if (head === "blog" && !slug) return hasBlog(locale);
  if (head === "blog" && rest.length === 0) return postSlugs(locale).includes(slug);
  if (head === "features" && slug && rest.length === 0) {
    return FEATURE_SLUGS.some((fr) => getLocalizedSlug(fr, locale) === slug);
  }
  return existsSync(join(APP, ...segments, "page.tsx"));
}

/** Concrete URLs a rule answers: the source itself, or samples of its pattern. */
function probesFor(source: string): string[] {
  if (!source.includes(":")) return [source];
  const sample = source.replace(/\/:path[*+]$/, "/pricing");
  return source.endsWith(":path*") ? [source.replace(/\/:path\*$/, ""), sample] : [sample];
}

const PROBES = [...new Set(RULES.flatMap((rule) => probesFor(rule.source)))];

/** The supplied table (plan Reference A), restated as the expectation. */
const REFERENCE_A: Array<[string, string]> = [
  // Search Console 404s with a real destination
  ["/en/en/onboarding", "/en/onboarding"],
  ["/blog/apple-wallet-loyalty-card", "/en/blog/apple-wallet-loyalty-card"],
  ["/blog/paper-vs-digital-loyalty-card", "/en/blog/paper-vs-digital-loyalty-card"],
  ["/blog/como-crear-tarjeta-fidelidad-digital", "/es/blog/como-crear-tarjeta-fidelidad-digital"],
  ["/blog/mejor-app-fidelizacion-comercios", "/es/blog/mejor-app-fidelizacion-comercios"],
  ["/blog/coffee-shop-loyalty-card", "/en/blog/coffee-shop-loyalty-card"],
  ["/features/notificaciones", "/es/features/notificaciones-push"],
  ["/blog/best-loyalty-card-system-small-business", "/en/blog/best-loyalty-card-system-small-business"],
  ["/en/blog/carte-fidelite-dematerialisee", "/blog/carte-fidelite-dematerialisee"],
  ["/en/blog/carte-fidelite-sans-application", "/blog/carte-fidelite-sans-application"],
  ["/en/blog/carte-fidelite-cafe", "/blog/carte-fidelite-cafe"],
  ["/en/blog/carte-fidelite-papier-vs-digitale", "/blog/carte-fidelite-papier-vs-digitale"],
  // Paths from git history
  ["/en/blog/apple-wallet-loyalty-cards-setup", "/en/blog/apple-wallet-loyalty-card"],
  ["/en/blog/why-digital-loyalty-cards", "/en/blog/digital-loyalty-card-small-business"],
  ["/en/blog/founding-partner-program", "/en/pricing"],
  ["/blog/configurer-cartes-fidelite-apple-wallet", "/blog/apple-wallet-carte-fidelite"],
  ["/blog/pourquoi-cartes-fidelite-digitales", "/blog/carte-fidelite-dematerialisee"],
  ["/blog/programme-partenaire-fondateur", "/pricing"],
  ["/signup", "/onboarding"],
  ["/en/signup", "/en/onboarding"],
  ["/fr/signup", "/onboarding"],
  // Founding routes
  ["/programme-fondateur", "/pricing"],
  ["/founding-partner", "/pricing"],
  ["/en/programme-fondateur", "/en/pricing"],
  ["/en/founding-partner", "/en/pricing"],
  ["/es/programme-fondateur", "/es/pricing"],
  ["/es/founding-partner", "/es/pricing"],
  ["/pl/programme-fondateur", "/pl/pricing"],
  ["/pl/founding-partner", "/pl/pricing"],
  // Locale-prefixed copies of the country pilots
  ["/en/us", "/us"],
  ["/es/us/pricing", "/us/pricing"],
  ["/pl/uk", "/uk"],
  ["/en/uk/pricing", "/uk/pricing"],
];

/** Live pages a rule replaces on purpose. */
const FOUNDING_ROUTES = new Set(
  SITE_LOCALES.flatMap((locale) =>
    ["programme-fondateur", "founding-partner"].map((slug) =>
      locale === DEFAULT_LOCALE ? `/${slug}` : `/${locale}/${slug}`,
    ),
  ),
);
const isPilotCopy = (path: string) => /^\/(en|es|pl)\/(us|uk)(\/|$)/.test(path);

describe("legacy URLs from Search Console and git history", () => {
  test.each(REFERENCE_A)("%s -> %s in one permanent hop", async (source, destination) => {
    expect(await redirectOf(source)).toEqual({ status: 308, to: destination });
  });

  test.each(PROBES)("%s lands on a live page with no further redirect", async (probe) => {
    const hop = await redirectOf(probe);

    expect(hop?.status).toBe(308);
    const to = hop?.to ?? "";
    expect(isLiveRoute(to)).toBe(true);
    expect(await redirectOf(to)).toBeNull();
    expect(await proxyRedirects(to)).toBe(false);
  });

  test("no rule replaces a live page, except the closed founding routes and the pilot copies", () => {
    const shadowed = PROBES.filter((probe) => isLiveRoute(probe));
    expect(shadowed.filter((probe) => !FOUNDING_ROUTES.has(probe) && !isPilotCopy(probe))).toEqual([]);
  });
});

/** Rules that are not themselves a doubled-prefix copy (`/en/en/...`). */
const DOUBLED = new RegExp(`^/(${SITE_LOCALES.join("|")})/\\1(/|$)`);

/** `/en/us` -> `/en/en/us`; an unprefixed path doubles the default locale: `/signup` -> `/fr/fr/signup`. */
function withDoubledPrefix(path: string): string | null {
  const head = path.split("/")[1];
  if (head === DEFAULT_LOCALE || DOUBLED.test(path)) return null;
  const locale = (SITE_LOCALES as readonly string[]).includes(head) ? head : DEFAULT_LOCALE;
  return locale === DEFAULT_LOCALE ? `/${locale}/${locale}${path}` : `/${locale}${path}`;
}

const DOUBLED_VARIANTS = PROBES.flatMap((probe) => {
  const doubled = withDoubledPrefix(probe);
  return doubled ? [[probe, doubled] as const] : [];
});

describe("a doubled locale prefix", () => {
  test("every rule family has doubled variants to probe", () => {
    // Explicit, blog in both directions, the founding routes and the pilot copies.
    const samples = [
      "/signup",
      "/en/signup",
      "/blog/apple-wallet-loyalty-card",
      "/en/blog/carte-fidelite-cafe",
      "/en/founding-partner",
      "/es/us/pricing",
    ];
    const probes = DOUBLED_VARIANTS.map(([probe]) => probe);
    for (const sample of samples) expect(probes).toContain(sample);
  });

  test.each(DOUBLED_VARIANTS)(
    "%s doubled as %s reaches the same page in one permanent hop",
    async (probe, doubled) => {
      const hop = await redirectOf(doubled);

      expect(hop?.status).toBe(308);
      expect(hop?.to).toBe((await redirectOf(probe))?.to);
      expect(await redirectOf(hop?.to ?? "")).toBeNull();
    },
  );
});

describe("blog posts asked for in the wrong language", () => {
  test("an English or Spanish post asked for without its prefix gets it", async () => {
    for (const locale of ["en", "es"]) {
      for (const slug of postSlugs(locale)) {
        expect(await redirectOf(`/blog/${slug}`)).toEqual({ status: 308, to: `/${locale}/blog/${slug}` });
      }
    }
  });

  test("a French post asked for under /en or /es loses the prefix", async () => {
    for (const prefix of ["en", "es"]) {
      for (const slug of postSlugs("fr")) {
        expect(await redirectOf(`/${prefix}/blog/${slug}`)).toEqual({ status: 308, to: `/blog/${slug}` });
      }
    }
  });

  test("French, English and Spanish slugs never collide", () => {
    const seen = new Map<string, string>();
    for (const locale of ["fr", "en", "es"]) {
      for (const slug of postSlugs(locale)) {
        expect(seen.get(slug)).toBeUndefined();
        seen.set(slug, locale);
      }
    }
    expect(seen.size).toBeGreaterThan(30);
  });

  test("a slug published in two languages stops the build", () => {
    const dir = mkdtempSync(join(tmpdir(), "legacy-redirects-"));
    try {
      for (const locale of ["fr", "en"]) {
        mkdirSync(join(dir, locale));
        writeFileSync(join(dir, locale, "digital-stamp-card.mdx"), "");
      }
      expect(() => legacyRedirects(dir)).toThrow("digital-stamp-card");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("URLs that stay as they are", () => {
  test.each([
    // Junk from Search Console: stays 404.
    "/month",
    "/mo",
    "/mois",
    "/mes",
    "/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2",
    "/_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2",
    // Live, despite a stale Search Console report.
    "/es/blog/tarjeta-fidelidad-sin-app",
    // Articles that were planned and never written: 404 until they exist,
    // never sent to the homepage.
    "/es/blog/tarjeta-sellos-digital",
    "/es/blog/tarjeta-fidelidad-cafeteria",
    "/blog/tarjeta-fidelidad-restaurante",
    "/blog/tarjeta-fidelidad-panaderia",
  ])("%s is not redirected", async (path) => {
    expect(await redirectOf(path)).toBeNull();
  });

  test("no sitemap URL is a redirect source", async () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paths.length).toBeGreaterThan(50);
    for (const path of paths) {
      expect(await redirectOf(path)).toBeNull();
    }
  });
});

test("the locales restated for next.config match i18n/routing", () => {
  expect([...SITE_LOCALES]).toEqual([...routing.locales]);
  expect(DEFAULT_LOCALE).toBe(routing.defaultLocale);
});
