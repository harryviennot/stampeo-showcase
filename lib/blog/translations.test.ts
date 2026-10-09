/**
 * Which blog posts are translations of each other.
 *
 * The map drives the hreflang a post emits in its page and in the sitemap, so
 * a slug that does not exist sends Google to a 404, and a one-way pairing is
 * an annotation Google drops.
 */

import { describe, expect, test } from "bun:test";
import { getAllSlugs, postExistsInLocale } from "./index";
import { BLOG_LOCALES } from "./locales";
import { POST_TRANSLATIONS, postLanguages } from "./translations";

const members = POST_TRANSLATIONS.flatMap((cluster) =>
  Object.entries(cluster).map(([locale, slug]) => ({ locale, slug: slug as string })),
);

describe("POST_TRANSLATIONS", () => {
  test.each(members.map(({ locale, slug }) => [locale, slug]))(
    "%s/%s exists",
    (locale, slug) => {
      expect(BLOG_LOCALES as readonly string[]).toContain(locale);
      expect(postExistsInLocale(slug, locale)).toBe(true);
    },
  );

  test("every cluster pairs at least two languages", () => {
    for (const cluster of POST_TRANSLATIONS) {
      expect(Object.keys(cluster).length).toBeGreaterThanOrEqual(2);
    }
  });

  test("no post is in two clusters", () => {
    const keys = members.map(({ locale, slug }) => `${locale}/${slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("postLanguages", () => {
  test("every post in a cluster emits the same, self-including cluster", () => {
    for (const cluster of POST_TRANSLATIONS) {
      const emitted = Object.entries(cluster).map(([locale, slug]) =>
        postLanguages(locale, slug as string),
      );
      for (const [i, [locale]] of Object.entries(cluster).entries()) {
        expect(emitted[i]).toEqual(emitted[0]);
        expect(emitted[i]?.[locale]).toBeDefined();
      }
    }
  });

  test("uses each locale's own URL, French unprefixed", () => {
    expect(postLanguages("en", "coffee-shop-loyalty-card")).toEqual({
      "x-default": "/en/blog/coffee-shop-loyalty-card",
      fr: "/blog/carte-fidelite-cafe",
      en: "/en/blog/coffee-shop-loyalty-card",
    });
  });

  test("x-default falls back to the French post when there is no English one", () => {
    const cluster = postLanguages("es", "google-wallet-tarjeta-fidelidad");
    expect(cluster?.["x-default"]).toBe("/blog/google-wallet-carte-fidelite");
  });

  test("absolute URLs for the sitemap", () => {
    const cluster = postLanguages("fr", "carte-fidelite-cafe", { baseUrl: "https://stampeo.app" });
    expect(cluster?.en).toBe("https://stampeo.app/en/blog/coffee-shop-loyalty-card");
  });

  test("a post with no translation emits no cluster", () => {
    const paired = new Set(members.map(({ locale, slug }) => `${locale}/${slug}`));
    for (const locale of BLOG_LOCALES) {
      for (const slug of getAllSlugs(locale)) {
        if (!paired.has(`${locale}/${slug}`)) expect(postLanguages(locale, slug)).toBeUndefined();
      }
    }
  });
});
