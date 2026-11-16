/**
 * The five colour palettes of the card design page's "colors from your logo" section: what the designer
 * itself generates from a logo, shown on the juice bar's card, and the order they play in.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { read } from "../testing/jsx-source";
import { ROOT } from "../testing/jsx-source";
import { PULP_CARD, PULP_PALETTES, palettePlayback, paletteDesign } from "./pulp-palettes";

const HEX = /^#[0-9a-f]{6}$/i;

/** WCAG relative luminance of a `#rrggbb`. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((at) => {
    const channel = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("the five palettes", () => {
  test("are the designer's five, in its order: light, dark, bold, mono, soft, each a full set of card colours", () => {
    expect(PULP_PALETTES.map((palette) => palette.id)).toEqual(["light", "dark", "bold", "mono", "soft"]);
    for (const palette of PULP_PALETTES) {
      for (const colour of [palette.background, palette.foreground, palette.label, palette.stampFilled, palette.stampEmpty, palette.stampBorder, palette.iconColor]) {
        expect(colour).toMatch(HEX);
      }
    }
  });

  test("look like five different cards, and none prints text a reader cannot read on its background", () => {
    expect(new Set(PULP_PALETTES.map((palette) => palette.background.toLowerCase())).size).toBe(5);
    for (const palette of PULP_PALETTES) expect(contrast(palette.foreground, palette.background)).toBeGreaterThanOrEqual(4.5);
  });

  test("come from the designer's own generator run on the juice bar's logo, not from a hand-picked list", () => {
    const source = read(join(ROOT, "lib", "landing-pages", "pulp-palettes.ts"));

    expect(source).toContain("generateThemeVariants");
    expect(source).toContain("/themes/pulp/logo.svg");
  });
});

describe("the card they dress", () => {
  test("is the juice bar's, with its logo and a preset icon, so the palette's stamp colour shows on the stamps", () => {
    expect(PULP_CARD.design.logo_url).toBe("/themes/pulp/logo.svg");
    expect(PULP_CARD.design.stamp_icon_mode ?? "preset").toBe("preset");
    expect(PULP_CARD.design.stamp_icon).toBeDefined();
    expect(PULP_CARD.stamps).toBeGreaterThan(0);
    expect(PULP_CARD.stamps).toBeLessThan(PULP_CARD.design.total_stamps ?? 0);
  });

  test("a palette recolours the card's background, text, stamps and icons and nothing else", () => {
    const [light, bold] = [paletteDesign(PULP_PALETTES[0]), paletteDesign(PULP_PALETTES[2])];

    expect(light.background_color).toBe(PULP_PALETTES[0].background);
    expect(bold.stamp_filled_color).toBe(PULP_PALETTES[2].stampFilled);
    expect(Object.keys(light).sort()).toEqual(Object.keys(bold).sort());
    expect(light).not.toHaveProperty("logo_url");
  });
});

describe("playing through them", () => {
  test("once the section is in view the card tries the other four in turn, then settles on the first, and never loops", () => {
    expect(palettePlayback(false)).toEqual([1, 2, 3, 4, 0]);
  });

  test("a reader who asks for less motion gets the first palette and no playback", () => {
    expect(palettePlayback(true)).toEqual([]);
  });
});
