import { describe, expect, it } from "bun:test";
import { buildLlmsTxt } from "./llms-txt";
import { getAllPosts } from "./blog";
import { BLOG_LOCALES } from "./blog/locales";
import { FEATURE_SLUGS, getLocalizedSlug } from "./feature-slugs";
import { LOYALTY_SLUGS } from "./loyalty-routes";
import { routing } from "@/i18n/routing";
import { BENCHMARK, sourceLine } from "./benchmark";
import { MARKETS } from "./markets";
import { PLAN_FACTS, TIERS, planSummary } from "./plan-facts";
import { FALLBACK_PRICING, FOUNDING_PRICING, type Pricing } from "./pricing";

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

describe("llms.txt facts", () => {
  // A USD ladder that differs from the baked one, so a match proves the
  // prices come from the catalog passed in.
  const usd: Pricing = {
    currency: "usd",
    tiers: {
      starter: { month: 51, year: 480 },
      growth: { month: 81, year: 768 },
      pro: { month: 121, year: 1152 },
    },
  };
  const body = buildLlmsTxt({ eur: FALLBACK_PRICING.eur, usd });

  it("states each plan with the plan facts", () => {
    for (const tier of TIERS) expect(body).toContain(planSummary(tier));
  });

  it("offers stamps and points on every plan", () => {
    expect(TIERS.every((tier) => PLAN_FACTS[tier].loyaltyTypes.includes("stamps"))).toBe(true);
    expect(body).not.toMatch(/stamps-only/i);
    expect(body).not.toMatch(/choose one per program on Growth/i);
  });

  it("lists geofencing as coming soon, not as a Pro feature", () => {
    expect(PLAN_FACTS.pro.geofencing).toBe("coming_soon");
    expect(body).not.toMatch(/geofencing[^\n]*\(Pro\)/i);
    expect(body).toMatch(/geofencing[^\n]*coming soon/i);
  });

  it("lists scheduled card designs as coming soon on Pro", () => {
    expect(PLAN_FACTS.pro.scheduledDesigns).toBe("coming_soon");
    const scheduled = body.match(/scheduled card designs[^,.\n]*/gi) ?? [];
    expect(scheduled.length).toBeGreaterThan(0);
    for (const mention of scheduled) expect(mention).toBe("scheduled card designs (coming soon)");
  });


  it("has a European block with euro prices and the international trial", () => {
    const eur = body.slice(body.indexOf("### Europe"));
    expect(eur).toContain("€20 / month");
    expect(eur).toContain(`${MARKETS.int.trialDays}-day free trial`);
    expect(eur).toContain("https://stampeo.app/pricing");
  });

  it("has a US block with the catalog's dollar prices and the US trial", () => {
    const us = body.slice(body.indexOf("### United States"));
    expect(us).toContain("$51 / month");
    expect(us).toContain("$81 / month");
    expect(us).toContain("$121 / month");
    expect(us).toContain(`${MARKETS.us.trialDays}-day free trial`);
    expect(us).toContain("https://stampeo.app/us)");
    expect(us).toContain("https://stampeo.app/us/pricing");
  });

  it("falls back to the baked ladder when no catalog is passed", () => {
    expect(buildLlmsTxt()).toContain(`$${FALLBACK_PRICING.usd.tiers.starter.month} / month`);
  });

  const lines = body.split("\n");

  it("quotes no percentage that is not a sourced Stampeo figure", () => {
    const allowed = new Set([
      ...Object.values(BENCHMARK).map((figure) => figure.value),
      FOUNDING_PRICING.yearlyDiscountPercent,
    ]);
    const quoted = lines.flatMap((line) =>
      [...line.matchAll(/(\d+(?:[.,]\d+)?)\s?%/g)].map((m) => Number(m[1]))
    );
    expect(quoted.length).toBeGreaterThan(0);
    for (const value of quoted) expect({ value, allowed: allowed.has(value) }).toEqual({ value, allowed: true });
  });

  it("cites the sample next to every Stampeo figure", () => {
    const figures = lines.filter((line) => /\d\s?%/.test(line) && !/yearly/i.test(line));
    expect(figures.length).toBeGreaterThan(0);
    for (const line of figures) expect(line).toContain(sourceLine("en"));
  });
});
