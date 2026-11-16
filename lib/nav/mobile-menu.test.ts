import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "@/lib/features";
import { isCurrentPath, menuMotion } from "./mobile-menu";

const ROOT = join(import.meta.dir, "..", "..");
const catalog = (locale: string) => JSON.parse(readFileSync(join(ROOT, "messages", locale, "common.json"), "utf8")).common;

describe("how the phone menu moves", () => {
  test("it fades in over 180ms with a 6px rise, group by group 25ms apart, and fades out faster", () => {
    expect(menuMotion(false)).toEqual({ rise: 6, enter: 0.18, exit: 0.12, stagger: 0.025 });
  });

  test("for a reader who wants less motion it is a plain fade: no rise, no stagger, still a complete menu", () => {
    const calm = menuMotion(true);

    expect(calm.rise).toBe(0);
    expect(calm.stagger).toBe(0);
    expect(calm.enter).toBeGreaterThan(0);
    expect(calm.exit).toBeGreaterThan(0);
  });
});

describe("which menu entry is the page you are on", () => {
  test("the entry whose address is the page, or a page inside it, is current", () => {
    expect(isCurrentPath("/us/landing-pages/platform/analytics", "/us/landing-pages/platform/analytics")).toBe(true);
    expect(isCurrentPath("/features/analytiques/detail", "/features/analytiques")).toBe(true);
  });

  test("a sibling that only shares a prefix is not", () => {
    expect(isCurrentPath("/us/landing-pages/platform/analytics-2", "/us/landing-pages/platform/analytics")).toBe(false);
    expect(isCurrentPath("/pricing", "/features/analytiques")).toBe(false);
  });

  test("an anchor is never current", () => {
    expect(isCurrentPath("/", "#demo")).toBe(false);
  });
});

describe("the six one-line descriptions under each feature in the phone menu", () => {
  test.each(routing.locales)("%s: every feature has one, short enough for two lines in a half-width tile", (locale) => {
    const items = catalog(locale).nav.featuresItems as Record<string, { label: string; description: string }>;

    for (const { key } of FEATURE_ITEMS) {
      expect(typeof items[key]?.description).toBe("string");
      expect(items[key].description.length).toBeGreaterThan(8);
      expect(items[key].description.length).toBeLessThanOrEqual(42);
    }
  });

  test.each(routing.locales)("%s: house style, no em dash, no minute count, no reminder, no ellipsis", (locale) => {
    const items = Object.values(catalog(locale).nav.featuresItems as Record<string, { description: string }>);

    for (const { description } of items) expect(description).not.toMatch(/—|\bminut|remind|rappel|recuerd|przypom|…/i);
  });

  test.each(routing.locales)("%s: the Soon label the Geolocation tile wears exists", (locale) => {
    expect(catalog(locale).wallet.soon.length).toBeGreaterThan(2);
  });

  test("the English lines say what each feature does for the shop, in the locked words (card, stamps, message)", () => {
    const items = catalog("en").nav.featuresItems as Record<string, { description: string }>;

    expect(Object.fromEntries(Object.entries(items).map(([key, value]) => [key, value.description]))).toEqual({
      designDeCarte: "Your logo, colors and stamps",
      scannerMobile: "Stamp from any phone",
      notificationsPush: "A message on every stamp",
      campagnesPromotionnelles: "One message to every card",
      analytiques: "See who comes back",
      geolocalisation: "Your card when they're nearby",
    });
  });
});
