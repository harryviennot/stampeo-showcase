import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { loadCatalog } from "../testing/catalogs";

type Tile = { title: string; description: string; link: string; badge?: string };

describe("landing feature grid", () => {
  it.each(routing.locales)("%s: only the geolocation tile is marked, in the pricing table's word", (locale) => {
    const tiles: Tile[] = loadCatalog(locale, "landing.json").landing.featureGrid.features;
    const soon: string = loadCatalog(locale, "pricing.json").pricingPage.comparison.soon;
    const geo = tiles.find((tile) => /^\/features\/geolo/.test(tile.link));

    expect(geo).toBeDefined();
    expect(tiles.filter((tile) => tile.badge !== undefined)).toEqual([geo!]);
    expect(geo!.badge).toBe(soon);
  });
});
