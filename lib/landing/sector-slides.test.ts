import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  fillSectorMoney,
  orderSectorSlides,
  sectorWalletDesign,
  type SectorCopy,
  type SectorTheme,
} from "./sector-slides";
import {
  SECTOR_DISPLAY_ORDER,
  SECTOR_THEMES,
} from "../../components/landing-variant/sector-themes";

const ROOT = join(import.meta.dir, "../..");
const LOCALES = ["en", "fr", "es", "pl"] as const;

const sectorsFor = (locale: string): SectorCopy[] =>
  JSON.parse(readFileSync(join(ROOT, "messages", locale, "landing.json"), "utf-8"))
    .landing.sectorCards.sectors;

// The five slides that shipped before the niche brands; their catalog
// indices (0-4) must keep pairing with the same themes.
const ORIGINAL_IDS = ["barber", "aurevo", "xenika", "vanity", "marginalia"];
const NEW_IDS = ["fournee", "lashwell", "harvest-row", "rolling-slice", "saltmoss", "smash-club"];

const themeById = (id: string): SectorTheme => {
  const theme = SECTOR_THEMES.find((t) => t.id === id);
  if (!theme) throw new Error(`missing theme ${id}`);
  return theme;
};

const luminance = (hex: string) => {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const assetUrls = (theme: SectorTheme): string[] => {
  const urls = [theme.walletLogoUrl, theme.stripImageUrl];
  for (const icon of theme.customStampConfig?.icons ?? []) {
    urls.push(icon.processed_url, icon.greyscale_url, icon.outline_url);
  }
  return urls.filter((u): u is string => Boolean(u));
};

describe("sector themes and catalog stay paired", () => {
  test.each(LOCALES)("%s has one catalog entry per theme", (locale) => {
    expect(sectorsFor(locale)).toHaveLength(SECTOR_THEMES.length);
  });

  test("the display order shows every slide exactly once", () => {
    const sorted = [...SECTOR_DISPLAY_ORDER].sort((a, b) => a - b);
    expect(sorted).toEqual(SECTOR_THEMES.map((_, i) => i));
  });

  test("the original five keep their catalog indices", () => {
    expect(SECTOR_THEMES.slice(0, 5).map((t) => t.id)).toEqual(ORIGINAL_IDS);
    expect(SECTOR_THEMES.slice(5).map((t) => t.id)).toEqual(NEW_IDS);
  });

  test("ordering returns every sector with its own theme, in display order", () => {
    const sectors = sectorsFor("en");
    const slides = orderSectorSlides(sectors, SECTOR_THEMES, SECTOR_DISPLAY_ORDER);
    expect(slides).toHaveLength(SECTOR_THEMES.length);
    slides.forEach((slide, slot) => {
      const index = SECTOR_DISPLAY_ORDER[slot];
      expect(slide.name).toBe(sectors[index].name);
      expect(slide.theme).toBe(SECTOR_THEMES[index]);
    });
  });

  test("a theme with no catalog entry is dropped, never paired with the wrong copy", () => {
    const sectors = sectorsFor("en").slice(0, 3);
    const slides = orderSectorSlides(sectors, SECTOR_THEMES, SECTOR_DISPLAY_ORDER);
    expect(slides.map((s) => s.theme.id)).toEqual(["barber", "aurevo", "xenika"]);
  });
});

describe("display order", () => {
  test("the subtitle's four examples come first and the bookstore closes the loop", () => {
    const ids = SECTOR_DISPLAY_ORDER.map((i) => SECTOR_THEMES[i].id);
    expect(ids.slice(0, 4)).toEqual(["barber", "aurevo", "xenika", "vanity"]);
    expect(ids.at(-1)).toBe("marginalia");
  });

  test("never three dark frames in a row, including across the loop", () => {
    const dark = SECTOR_DISPLAY_ORDER.map((i) => luminance(SECTOR_THEMES[i].cardBg) < 0.5);
    const n = dark.length;
    for (let i = 0; i < n; i++) {
      const run = [dark[i], dark[(i + 1) % n], dark[(i + 2) % n]];
      expect(run.every(Boolean)).toBe(false);
    }
  });
});

describe("catalog copy", () => {
  test.each(LOCALES)("%s sector names are unique (they key the slides)", (locale) => {
    const names = sectorsFor(locale).map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test.each(LOCALES)("%s new quotes fit the existing slide height and pills fit one line", (locale) => {
    const sectors = sectorsFor(locale);
    const longest = Math.max(...sectors.slice(0, 5).map((s) => s.quote.length));
    for (const sector of sectors.slice(5)) {
      expect(sector.quote.length).toBeLessThanOrEqual(longest);
      expect(sector.reward.length).toBeLessThanOrEqual(38);
    }
  });
});

describe("sector money follows the page's market currency", () => {
  const bookstore = (locale: string) =>
    sectorsFor(locale)[SECTOR_THEMES.findIndex((t) => t.id === "marginalia")];

  const strings = (sector: SectorCopy): string[] => [
    sector.name,
    sector.quote,
    sector.reward,
    sector.advantage,
    sector.linkLabel,
    ...(sector.fields ?? []).flatMap((f) => [f.label, f.value]),
  ];

  test.each([
    ["USD", "$1 spent = 1 point, $10 off at 150 pts", "$10 off"],
    ["EUR", "€1 spent = 1 point, €10 off at 150 pts", "€10 off"],
  ])("the English bookstore card quotes its reward in %s", (currency, reward, field) => {
    const filled = fillSectorMoney(bookstore("en"), currency, "en");
    expect(filled.reward).toBe(reward);
    expect(filled.fields?.at(-1)?.value).toBe(field);
  });

  test("French places the euro after the amount", () => {
    expect(fillSectorMoney(bookstore("fr"), "EUR", "fr").fields?.at(-1)?.value).toMatch(/^-10\s€$/u);
  });

  const cases = LOCALES.flatMap((locale) =>
    (["EUR", "USD"] as const).map((currency) => [locale, currency] as const),
  );

  test.each(cases)("%s in %s: every token is filled and only that currency shows", (locale, currency) => {
    const text = sectorsFor(locale)
      .flatMap((sector) => strings(fillSectorMoney(sector, currency, locale)))
      .join("\n");
    expect(text).not.toMatch(/[{}]/);
    expect(text).toContain(currency === "USD" ? "$" : "€");
    expect(text).not.toContain(currency === "USD" ? "€" : "$");
  });
});

describe("theme assets", () => {
  test.each(SECTOR_THEMES.map((t) => [t.id, t] as const))("%s assets exist", (_, theme) => {
    for (const url of assetUrls(theme)) {
      expect(existsSync(join(ROOT, "public", url))).toBe(true);
    }
  });

  test.each(NEW_IDS)("%s assets stay light for the landing page", (id) => {
    for (const url of assetUrls(themeById(id))) {
      expect(statSync(join(ROOT, "public", url)).size).toBeLessThanOrEqual(60 * 1024);
    }
  });
});

describe("wallet design", () => {
  test("Harvest Row draws its own icon on each points milestone", () => {
    const design = sectorWalletDesign(themeById("harvest-row"), []);
    expect(design.points_reward_icons).toEqual({
      r1: { type: "preset", ref: "basket" },
      r2: { type: "preset", ref: "percent" },
      r3: { type: "preset", ref: "gift" },
    });
  });

  test.each(ORIGINAL_IDS)("%s builds the same design as before (no reward icons)", (id) => {
    expect("points_reward_icons" in sectorWalletDesign(themeById(id), [])).toBe(false);
  });

  test("a stamp theme maps to the stamp design fields", () => {
    const fields = [{ label: "Reward", value: "Free cut" }];
    expect(sectorWalletDesign(themeById("barber"), fields)).toEqual({
      background_color: "#FFFFFF",
      foreground_color: "#343434",
      label_color: "#040404",
      stamp_filled_color: "#040404",
      icon_color: "#FFFFFF",
      stamp_icon: "scissors",
      reward_icon: "gift",
      stamp_icon_mode: "preset",
      custom_stamp_config: undefined,
      total_stamps: 6,
      organization_name: undefined,
      logo_url: "/themes/barber/logo.avif",
      secondary_fields: [{ key: "f0", label: "Reward", value: "Free cut" }],
    });
  });

  test("a points theme maps to the points design fields", () => {
    expect(sectorWalletDesign(themeById("xenika"), [])).toEqual({
      card_type: "points",
      points_strip_style: "image_only",
      background_color: "#FFFFFF",
      foreground_color: "#0C64A4",
      label_color: "#0C64A4",
      progress_accent_color: "#0C64A4",
      icon_color: "#FFFFFF",
      organization_name: undefined,
      logo_url: "/themes/restaurant/logo.png",
      strip_background_color: "#FFFFFF",
      strip_background_url: "/themes/restaurant/strip.jpg",
      strip_background_opacity: 100,
      secondary_fields: [],
    });
  });
});
