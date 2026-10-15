import { describe, expect, it } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  HALLOWEEN_POINTS_SAMPLES,
  HALLOWEEN_STAMP_SAMPLES,
} from "./halloween-samples";
import { POINTS_SAMPLES, STAMP_SAMPLES } from "./loyalty-samples";
import type { CardDesign } from "./types/design";

const ALL = [...HALLOWEEN_STAMP_SAMPLES, ...HALLOWEEN_POINTS_SAMPLES];
const PUBLIC = join(import.meta.dir, "..", "public");

/** Every image a design points at: logo, strip, each custom icon and its grey copy. */
function assetUrls(design: Partial<CardDesign>): string[] {
  const urls = [design.logo_url, design.strip_background_url];
  const config = design.custom_stamp_config;
  for (const icon of [...(config?.icons ?? []), config?.reward_icon, config?.empty_icon]) {
    if (icon) urls.push(icon.processed_url, icon.greyscale_url);
  }
  return urls.filter((u): u is string => typeof u === "string");
}

describe("Halloween sample cards", () => {
  it("have unique ids that no year-round sample uses", () => {
    const ids = ALL.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const yearRound = new Set([...STAMP_SAMPLES, ...POINTS_SAMPLES].map((s) => s.id));
    for (const id of ids) {
      expect(id.startsWith("halloween-")).toBe(true);
      expect(yearRound.has(id)).toBe(false);
    }
  });

  it("point at images that exist under public/, each 60KB at most", () => {
    for (const sample of ALL) {
      for (const url of assetUrls(sample.design)) {
        const file = join(PUBLIC, url);
        expect(existsSync(file)).toBe(true);
        if (url.startsWith("/themes/halloween/")) {
          expect(statSync(file).size).toBeLessThanOrEqual(60_000);
        }
      }
    }
  });

  it("set every colour, since an unset one falls back to the default look", () => {
    for (const sample of ALL) {
      for (const key of ["background_color", "foreground_color", "label_color"] as const) {
        expect(sample.design[key]).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it("show stamp cards part way, with icons for custom stamps", () => {
    for (const sample of HALLOWEEN_STAMP_SAMPLES) {
      const total = sample.design.total_stamps ?? 10;
      expect(sample.stamps).toBeGreaterThan(0);
      expect(sample.stamps).toBeLessThan(total);
      const config = sample.design.custom_stamp_config;
      if (sample.design.stamp_icon_mode === "custom") {
        expect(config?.icons.length).toBeGreaterThan(0);
        if (config?.empty_mode === "custom") expect(config.empty_icon).toBeTruthy();
      }
    }
  });

  it("show points cards on an ascending ladder they have started", () => {
    for (const sample of HALLOWEEN_POINTS_SAMPLES) {
      const thresholds = sample.pointsRewards.map((r) => r.threshold);
      expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b));
      expect(sample.pointsBalance).toBeGreaterThan(0);
      expect(sample.design.points_strip_style).toBeTruthy();
    }
  });
});
