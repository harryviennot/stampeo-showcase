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
    expect(!es.ok && es.detail).toContain("exists in: en");
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

  test("a route that always redirects is not a valid link target", () => {
    // The founding program closed, so /programme-fondateur resolves but sends
    // everyone to /pricing. Group (E)'s defect class: a valid URL that is still
    // the wrong thing to link to, and one no click-through would flag.
    expect(
      classifyLink("/programme-fondateur", "fr", "localized-link", BLOG)
    ).toMatchObject({ problem: "always-redirects" });
    expect(
      classifyLink("/founding-partner", "en", "localized-link", BLOG)
    ).toMatchObject({ problem: "always-redirects" });
  });

  test("routes outside the [locale] tree take no prefix, in either direction", () => {
    // middleware.ts excludes these from the matcher, so /go/app is right and
    // /es/go/app does not exist. Without this the guard cries wolf on a correct
    // link, which is how a guard gets switched off.
    expect(classifyLink("/go/app", "es", "localized-link", BLOG).ok).toBe(true);
    expect(classifyLink("/join/ABC123", "fr", "raw-anchor", BLOG).ok).toBe(true);
    expect(classifyLink("/es/go/app", "es", "raw-anchor", BLOG)).toMatchObject({
      problem: "unknown-route",
    });
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

  test("markdown links are found; external links and images are not", () => {
    // `![alt](/x.png)` shares the shape and is not a link. content/docs/ is full
    // of them, so this matters the moment another surface joins the walk.
    const source =
      "see [a](/es/pricing) and [b](https://example.com) and [c](#anchor) and ![d](/img/e.png)";
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

/**
 * A walk records what it CHECKED as well as what it found wrong.
 *
 * `expect(broken).toEqual([])` on its own is green when the extractor returns
 * nothing — rename `CallToAction`, move `content/blog/`, add a locale without
 * listing it, change the catalog key convention, and the suite passes over zero
 * coverage. That is the exact failure this whole file exists to prevent, so
 * every walk below asserts its own reach: which locales contributed, and how
 * many links were seen.
 */
interface Walk {
  broken: Broken[];
  /** Links checked, per locale. A locale that contributes 0 is drift. */
  checked: Record<string, number>;
}

const newWalk = (locales: readonly string[]): Walk => ({
  broken: [],
  checked: Object.fromEntries(locales.map((l) => [l, 0])),
});

function check(
  href: string,
  locale: string,
  kind: "localized-link" | "raw-anchor",
  where: string,
  walk: Walk
) {
  walk.checked[locale] = (walk.checked[locale] ?? 0) + 1;
  const v = classifyLink(href, locale, kind, BLOG);
  if (!v.ok) walk.broken.push({ where, href, problem: v.problem, detail: v.detail });
}

/** Every locale in scope contributed at least one link, and none was broken. */
function expectWalked(walk: Walk) {
  expect(walk.broken).toEqual([]);
  for (const [locale, count] of Object.entries(walk.checked)) {
    // Named in the message so a zero says WHICH surface stopped being read.
    expect({ locale, count: count > 0 }).toEqual({ locale, count: true });
  }
}

describe("every authored link resolves", () => {
  test("blog CallToAction buttons (localized Link — must be locale-free)", () => {
    const walk = newWalk(BLOG_LOCALES);
    for (const locale of BLOG_LOCALES) {
      const dir = join(ROOT, "content", "blog", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
        const source = readFileSync(join(dir, file), "utf-8");
        for (const { href, line } of extractCtaHrefs(source)) {
          check(href, locale, "localized-link", `content/blog/${locale}/${file}:${line}`, walk);
        }
      }
    }
    expectWalked(walk);
    // Every post carries a CTA, so the count cannot fall below the post count
    // without a post losing its call to action or the extractor going blind.
    const posts = BLOG_LOCALES.reduce((n, l) => n + (BLOG[l]?.length ?? 0), 0);
    expect(Object.values(walk.checked).reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(posts);
  });

  test("blog prose links (raw <a> — must be locale-prefixed)", () => {
    const walk = newWalk(BLOG_LOCALES);
    for (const locale of BLOG_LOCALES) {
      const dir = join(ROOT, "content", "blog", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
        const source = readFileSync(join(dir, file), "utf-8");
        for (const { href, line } of extractMarkdownLinks(source)) {
          check(href, locale, "raw-anchor", `content/blog/${locale}/${file}:${line}`, walk);
        }
      }
    }
    expectWalked(walk);
  });

  test("message catalogs (localized Link — must be locale-free)", () => {
    const walk = newWalk(routing.locales);
    for (const locale of routing.locales) {
      const dir = join(ROOT, "messages", locale);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
        const catalog = JSON.parse(readFileSync(join(dir, file), "utf-8"));
        for (const { href, at } of extractCatalogLinks(catalog)) {
          check(href, locale, "localized-link", `messages/${locale}/${file} @ ${at}`, walk);
        }
      }
    }
    expectWalked(walk);
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
