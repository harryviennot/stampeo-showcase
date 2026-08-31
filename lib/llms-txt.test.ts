import { describe, expect, it } from "bun:test";
import { buildLlmsTxt } from "./llms-txt";
import { getAllPosts } from "./blog";
import { BLOG_LOCALES } from "./blog/locales";
import { FEATURE_SLUGS, getLocalizedSlug } from "./feature-slugs";
import { LOYALTY_SLUGS } from "./loyalty-routes";
import { routing } from "@/i18n/routing";

/**
 * These are rot guards, not snapshot tests. `public/llms.txt` used to be
 * hand-maintained and silently fell behind three times (Spanish shipped, four
 * French articles were added, five English ones). Every assertion here is
 * derived from the same constants the router reads, so a new locale, feature
 * or article fails loudly instead of quietly going unlisted.
 */
describe("llms.txt", () => {
  const body = buildLlmsTxt();

  it("lists a home page for every locale the site routes", () => {
    for (const locale of routing.locales) {
      const home =
        locale === routing.defaultLocale
          ? "https://stampeo.app/"
          : `https://stampeo.app/${locale}`;
      expect(body).toContain(home);
    }
  });

  it("names every locale in the Languages section", () => {
    const section = body.slice(body.indexOf("## Languages"));
    for (const name of ["French (default)", "English", "Spanish", "Polish"]) {
      expect(section).toContain(name);
    }
  });

  it("no longer claims the site is French and English only", () => {
    expect(body).not.toContain("French (default) and English");
  });

  it("lists every feature page in every locale", () => {
    for (const locale of routing.locales) {
      for (const frSlug of FEATURE_SLUGS) {
        const slug = getLocalizedSlug(frSlug, locale);
        const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
        expect(body).toContain(`https://stampeo.app${prefix}/features/${slug}`);
      }
    }
  });

  it("lists the loyalty-programs page under each locale's own slug", () => {
    for (const [locale, slug] of Object.entries(LOYALTY_SLUGS)) {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      expect(body).toContain(`https://stampeo.app${prefix}${slug}`);
    }
  });

  it("lists every published article in every blog locale", () => {
    for (const locale of BLOG_LOCALES) {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      for (const post of getAllPosts(locale)) {
        expect(body).toContain(
          `https://stampeo.app${prefix}/blog/${post.slug}`
        );
      }
    }
  });

  it("does not advertise a blog for locales that have none", () => {
    const missing = routing.locales.filter(
      (l) => !(BLOG_LOCALES as readonly string[]).includes(l)
    );
    for (const locale of missing) {
      expect(body).not.toContain(`https://stampeo.app/${locale}/blog`);
    }
  });

  it("does not link the retired founding-partner routes", () => {
    expect(body).not.toContain("/programme-fondateur");
    expect(body).not.toContain("/founding-partner");
  });
});
