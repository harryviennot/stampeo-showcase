/**
 * Internal-link integrity (STA-355).
 *
 * The crawl that opened STA-355 found nine broken destinations and one wasted
 * redirect, in three shapes: a prefixed href handed to next-intl's prefixing
 * `Link`, Spanish slugs transliterated from French for articles nobody wrote,
 * and one French feature slug left in the Spanish catalog.
 *
 * None of it was catchable at the type level. `messages/*.json` values are read
 * at runtime, and the call sites cast them to a literal anyway
 * (`href={feature.link as "/features/…"}`). So this suite resolves every
 * AUTHORED link against the REAL route inventory on disk — the same
 * pin-the-filesystem approach `consent-routes.test.ts` uses, for the same
 * reason: the table and the routes must not be allowed to drift apart.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../i18n/routing";
import { BLOG_LOCALES } from "./blog/locales";
import { getAllSlugs } from "./blog/index";
import {
  classifyLink,
  extractCatalogLinks,
  extractCtaHrefs,
  extractMarkdownLinks,
  type BlogInventory,
} from "./internal-links";

const ROOT = join(import.meta.dir, "..");

/** The real article inventory, read from disk. */
const BLOG: BlogInventory = Object.fromEntries(
  BLOG_LOCALES.map((locale) => [locale, getAllSlugs(locale)])
);

// ---------------------------------------------------------------------------
// The rule itself
// ---------------------------------------------------------------------------

describe("classifyLink — the two conventions", () => {
  test("a localized Link takes a locale-free href and supplies the locale", () => {
    for (const locale of ["en", "es", "pl"]) {
      const v = classifyLink("/onboarding", locale, "localized-link", BLOG);
      expect(v.ok).toBe(true);
      expect(v.resolved).toBe(`/${locale}/onboarding`);
    }
    // French is the default locale, so it stays unprefixed. This is exactly why
    // the bug below was invisible to anyone reading the French posts.
    expect(classifyLink("/onboarding", "fr", "localized-link", BLOG).resolved).toBe(
      "/onboarding"
    );
  });

  test("a prefixed href handed to a localized Link doubles the prefix", () => {
    // The headline STA-355 regression: 16 blog posts shipped this.
    const en = classifyLink("/en/onboarding", "en", "localized-link", BLOG);
    expect(en.ok).toBe(false);
    expect(en).toMatchObject({ problem: "double-prefix", resolved: "/en/en/onboarding" });

    const es = classifyLink("/es/onboarding", "es", "localized-link", BLOG);
    expect(es).toMatchObject({ problem: "double-prefix", resolved: "/es/es/onboarding" });
  });

  test("a raw anchor is rendered verbatim, so it must carry the prefix", () => {
    expect(classifyLink("/es/pricing", "es", "raw-anchor", BLOG).ok).toBe(true);
    expect(classifyLink("/pricing", "es", "raw-anchor", BLOG)).toMatchObject({
      problem: "missing-prefix",
    });
    // …and must NOT carry one in the default locale, which is unprefixed.
    expect(classifyLink("/pricing", "fr", "raw-anchor", BLOG).ok).toBe(true);
    expect(classifyLink("/fr/pricing", "fr", "raw-anchor", BLOG)).toMatchObject({
      problem: "double-prefix",
    });
  });
});

describe("classifyLink — route resolution", () => {
  test("a blog slug must exist in THAT locale, not merely somewhere", () => {
    // The negative assertion that matters. Every dead Spanish link in STA-355
    // was a real article — in French or English.
    expect(classifyLink("/blog/apple-wallet-loyalty-card", "en", "localized-link", BLOG).ok).toBe(
      true
    );
    const es = classifyLink("/blog/apple-wallet-loyalty-card", "es", "localized-link", BLOG);
    expect(es.ok).toBe(false);
    expect(es).toMatchObject({ problem: "missing-post" });
    // The message has to name where it DOES exist, or the next person reads
    // "404" and writes a redirect instead of the missing article.
    expect(!es.ok && es.detail).toContain("en");
  });

  test("a feature slug from another locale is a redirect, not a 404", () => {
    expect(
      classifyLink("/features/difusiones-promocionales", "es", "localized-link", BLOG).ok
    ).toBe(true);
    expect(
      classifyLink("/features/campagnes-promotionnelles", "es", "localized-link", BLOG)
    ).toMatchObject({ problem: "wrong-locale-slug" });
  });

  test("a feature slug in no map is a hard 404", () => {
    // `notificaciones` vs the real `notificaciones-push`: resolveToCanonicalSlug
    // returns null and the route calls notFound().
    expect(
      classifyLink("/features/notificaciones", "es", "localized-link", BLOG)
    ).toMatchObject({ problem: "unknown-route" });
  });

  test("the loyalty page is four sibling routes, one per locale", () => {
    expect(classifyLink("/programa-de-fidelizacion", "es", "localized-link", BLOG).ok).toBe(true);
    expect(classifyLink("/programme-fidelite", "fr", "localized-link", BLOG).ok).toBe(true);
    expect(
      classifyLink("/programme-fidelite", "es", "localized-link", BLOG)
    ).toMatchObject({ problem: "wrong-locale-slug" });
  });

  test("an unowned first segment falls through to the enrollment page, not a 404", () => {
    // `/{slug}` is a merchant's QR destination. A typo'd marketing link lands on
    // a business lookup, which is a worse failure than a 404 because it looks
    // deliberate. Worth naming in the verdict.
    const v = classifyLink("/feautres/analytiques", "fr", "localized-link", BLOG);
    expect(v).toMatchObject({ problem: "unknown-route" });
    expect(!v.ok && v.detail).toContain("enrollment");
  });

  test("query strings and trailing slashes do not change the answer", () => {
    expect(classifyLink("/pricing/", "en", "localized-link", BLOG).ok).toBe(true);
    expect(classifyLink("/pricing?utm_source=x", "en", "localized-link", BLOG).ok).toBe(true);
    expect(classifyLink("/blog/nope#top", "en", "localized-link", BLOG).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Extractors
// ---------------------------------------------------------------------------

describe("extractors", () => {
  test("CallToAction is read in both the inline and multi-line form", () => {
    // French authors it across lines, English and Spanish inline. Matching only
    // one shape would have hidden half the bug.
    const source = [
      '<CallToAction title="a" buttonText="b" href="/one" />',
      "",
      "<CallToAction",
      '  title="c"',
      '  href="/two"',
      "/>",
    ].join("\n");
    expect(extractCtaHrefs(source)).toEqual([
      { href: "/one", line: 1 },
      { href: "/two", line: 3 },
    ]);
  });

  test("markdown links are found and external ones ignored", () => {
    const source = "see [a](/es/pricing) and [b](https://example.com) and [c](#anchor)";
    expect(extractMarkdownLinks(source)).toEqual([{ href: "/es/pricing", line: 1 }]);
  });

  test("catalog links are found at any depth, with a path back to them", () => {
    const catalog = { a: { b: [{ link: "/pricing" }, { href: "/about" }] }, c: "/not-a-link" };
    expect(extractCatalogLinks(catalog)).toEqual([
      { href: "/pricing", at: "a.b.0.link" },
      { href: "/about", at: "a.b.1.href" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// The drift guards: every authored link in the repo, against the real routes
// ---------------------------------------------------------------------------

interface Broken {
  where: string;
  href: string;
  problem: string;
  detail: string;
}

function check(
  href: string,
  locale: string,
  kind: "localized-link" | "raw-anchor",
  where: string,
  into: Broken[]
) {
  const v = classifyLink(href, locale, kind, BLOG);
  if (!v.ok) into.push({ where, href, problem: v.problem, detail: v.detail });
}

describe("every authored link resolves", () => {
  test("blog CallToAction buttons (localized Link — must be locale-free)", () => {
    const broken: Broken[] = [];
    for (const locale of BLOG_LOCALES) {
      const dir = join(ROOT, "content", "blog", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
        const source = readFileSync(join(dir, file), "utf-8");
        for (const { href, line } of extractCtaHrefs(source)) {
          check(href, locale, "localized-link", `content/blog/${locale}/${file}:${line}`, broken);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  test("blog prose links (raw <a> — must be locale-prefixed)", () => {
    const broken: Broken[] = [];
    for (const locale of BLOG_LOCALES) {
      const dir = join(ROOT, "content", "blog", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
        const source = readFileSync(join(dir, file), "utf-8");
        for (const { href, line } of extractMarkdownLinks(source)) {
          check(href, locale, "raw-anchor", `content/blog/${locale}/${file}:${line}`, broken);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  test("message catalogs (localized Link — must be locale-free)", () => {
    const broken: Broken[] = [];
    for (const locale of routing.locales) {
      const dir = join(ROOT, "messages", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
        const catalog = JSON.parse(readFileSync(join(dir, file), "utf-8"));
        for (const { href, at } of extractCatalogLinks(catalog)) {
          check(href, locale, "localized-link", `messages/${locale}/${file} @ ${at}`, broken);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  test("a locale with no blog links to no articles", () => {
    // Polish has no blog route at all, so a `/blog/…` value in pl/*.json would
    // render a link into a redirect. It sidesteps this today by pointing every
    // sector card at the loyalty page; this pins that it keeps doing so.
    const noBlog = routing.locales.filter(
      (l) => !(BLOG_LOCALES as readonly string[]).includes(l)
    );
    expect(noBlog).toContain("pl");
    for (const locale of noBlog) {
      const dir = join(ROOT, "messages", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
        const catalog = JSON.parse(readFileSync(join(dir, file), "utf-8"));
        for (const { href } of extractCatalogLinks(catalog)) {
          expect(href.startsWith("/blog")).toBe(false);
        }
      }
    }
  });
});
