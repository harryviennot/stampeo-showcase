import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import manifest from "@/app/manifest";
import enPricing from "@/messages/en/pricing.json";
import { FALLBACK_PRICING, type Pricing } from "./pricing";
import { MARKETS } from "./markets";
import { PLAN_FACTS, planSummary } from "./plan-facts";
import {
  articleJsonLd,
  organizationJsonLd,
  pricingFaqJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "./structured-data";

const BASE = "https://stampeo.app";
const ORG_ID = `${BASE}/#organization`;
const ROOT = join(import.meta.dir, "..");

const livePricing = (currency: "eur" | "usd"): Pricing => ({
  ...FALLBACK_PRICING[currency],
  isFallback: false,
});

/** Width and height from a PNG's IHDR chunk. */
function pngSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** Every source file under a folder, for the "URL already in the codebase" check. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|json)$/.test(name) ? [readFileSync(path, "utf8")] : [];
  });
}

describe("Organization", () => {
  const org = organizationJsonLd();

  it("is one node the other entities point at, with a logo that exists", () => {
    expect(org["@id"]).toBe(ORG_ID);
    expect(org.logo).toBe(`${BASE}/icon-512.png`);
    expect(pngSize(join(ROOT, "public/icon-512.png"))).toEqual({ width: 512, height: 512 });
  });

  it("names the founder, linked to the About page", () => {
    expect(org.founder).toEqual({ "@type": "Person", name: "Harry Viennot", url: `${BASE}/about` });
  });

  it("lists only profiles the site already links to", () => {
    const code = [...sources(join(ROOT, "components")), ...sources(join(ROOT, "messages"))].join("\n");
    expect(org.sameAs.length).toBeGreaterThan(0);
    for (const url of org.sameAs) expect({ url, linked: code.includes(url) }).toEqual({ url, linked: true });
  });
});

describe("WebSite", () => {
  const site = webSiteJsonLd();

  it("is published by the Organization", () => {
    expect(site["@id"]).toBe(`${BASE}/#website`);
    expect(site.publisher).toEqual({ "@id": ORG_ID });
  });

  it("claims no site search and no speakable sections", () => {
    expect(site).not.toHaveProperty("potentialAction");
    expect(site).not.toHaveProperty("speakable");
  });
});

describe("SoftwareApplication", () => {
  it("identifies the app on every platform it runs on", () => {
    const app = softwareApplicationJsonLd(livePricing("eur"));
    expect(app["@id"]).toBe(`${BASE}/#software`);
    expect(app.url).toBe(BASE);
    expect(app.operatingSystem).toBe("Web, iOS, Android");
  });

  it.each(["eur", "usd"] as const)("offers every plan and cadence in %s", (currency) => {
    const offers = softwareApplicationJsonLd(livePricing(currency)).offers!;
    expect(offers).toHaveLength(6);
    expect(new Set(offers.map((o) => o.priceCurrency))).toEqual(new Set([currency.toUpperCase()]));
    expect(offers.find((o) => o.name === "Starter")!.price).toBe(
      String(FALLBACK_PRICING[currency].tiers.starter.month)
    );
  });

  it("asserts no price when the ladder is the baked fallback", () => {
    const app = softwareApplicationJsonLd({ ...FALLBACK_PRICING.usd, isFallback: true });
    expect(app).not.toHaveProperty("offers");
  });

  it("describes each offer with the plan facts", () => {
    const offers = softwareApplicationJsonLd(livePricing("eur")).offers!;
    for (const tier of ["starter", "growth", "pro"] as const) {
      const name = tier[0].toUpperCase() + tier.slice(1);
      expect(offers.find((o) => o.name === name)!.description).toContain(planSummary(tier));
    }
    const growth = offers.find((o) => o.name === "Growth")!.description;
    expect(PLAN_FACTS.growth.analytics).toBe("basic");
    expect(growth).not.toMatch(/advanced analytics|schedul|multi-location|multiple locations/i);
  });
});

describe("Article", () => {
  const post = {
    title: "T",
    description: "D",
    publishedAt: "2026-01-01",
    author: "Harry from Stampeo",
    slug: "coffee-shop-loyalty-card",
  };

  it.each([
    ["fr", `${BASE}/blog/coffee-shop-loyalty-card/opengraph-image`],
    ["en", `${BASE}/en/blog/coffee-shop-loyalty-card/opengraph-image`],
    ["es", `${BASE}/es/blog/coffee-shop-loyalty-card/opengraph-image`],
  ])("uses the post's own share image (%s)", (locale, image) => {
    expect(articleJsonLd({ ...post, locale }).image).toBe(image);
  });

  it("is written by the founder and published by the Organization", () => {
    const article = articleJsonLd({ ...post, locale: "en" });
    expect(article.author).toEqual({ "@type": "Person", name: "Harry Viennot", url: `${BASE}/about` });
    expect(article.publisher).toEqual({ "@id": ORG_ID });
    expect(article).not.toHaveProperty("speakable");
  });
});

describe("pricing page FAQ", () => {
  const items = enPricing.pricingPage.faq.items;

  it.each([
    ["int", "eur"],
    ["us", "usd"],
  ] as const)("resolves every price and trial token for the %s market", (market, currency) => {
    const faq = pricingFaqJsonLd(items, livePricing(currency), "en", MARKETS[market].trialDays);
    const text = JSON.stringify(faq);
    expect(faq["@type"]).toBe("FAQPage");
    expect(text).not.toMatch(/\{\w+\}/);
    expect(text).toContain(`${MARKETS[market].trialDays}-day free trial`);
    expect(text).toContain(currency === "usd" ? "$49" : "€20");
  });

  it.each(["fr", "en", "es", "pl"])("the %s FAQ does not advertise the closed founding programme", (locale) => {
    const catalog = JSON.parse(readFileSync(join(ROOT, "messages", locale, "pricing.json"), "utf8"));
    const faq = catalog.pricingPage.faq.items as Array<{ foundingOnly?: boolean }>;
    expect(faq.filter((item) => item.foundingOnly)).toEqual([]);
  });
});

describe("referenced images", () => {
  it("every manifest icon exists at the size it declares", () => {
    for (const icon of manifest().icons ?? []) {
      const path = join(ROOT, "public", icon.src);
      expect({ src: icon.src, exists: existsSync(path) }).toEqual({ src: icon.src, exists: true });
      if (icon.type === "image/png") {
        const [width, height] = icon.sizes!.split("x").map(Number);
        expect(pngSize(path)).toEqual({ width, height });
      }
    }
  });
});
