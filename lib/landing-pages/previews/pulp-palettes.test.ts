/**
 * The five colour palettes of the card design page's "colors from your logo" section: what the designer
 * itself generates from a logo, shown on the juice bar's card, and the order they play in.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { fakeScheduler } from "../../testing/fake-scheduler";
import { ROOT, read } from "../../testing/jsx-source";
import { PLAY_STEP_MS, PULP_CARD, PULP_PALETTES, createTour, palettePlayback, paletteDesign } from "./pulp-palettes";

const HEX = /^#[0-9a-f]{6}$/i;

/** The hue of a `#rrggbb` in degrees, and its saturation (0 to 1). */
function hueOf(hex: string): { hue: number; saturation: number } {
  const [r, g, b] = [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255);
  const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
  const delta = max - min;
  const hue = delta === 0 ? 0 : max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;

  return { hue: hue * 60, saturation: max === 0 ? 0 : delta / max };
}

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

  test("are built on the logo's own orange: every palette's card or stamp colour has the hue of the orange in the logo file", () => {
    const logo = read(join(ROOT, "public", "themes", "pulp", "logo.svg"));
    const orange = [...logo.matchAll(/fill="(#[0-9a-f]{6})"/gi)].map((match) => hueOf(match[1])).find(({ saturation, hue }) => saturation > 0.8 && hue < 40);

    expect(orange).toBeDefined();
    for (const palette of PULP_PALETTES) {
      const hues = [palette.background, palette.stampFilled].map(hueOf).filter(({ saturation }) => saturation > 0.3);

      expect({ id: palette.id, near: hues.some(({ hue }) => Math.abs(hue - (orange?.hue ?? 0)) <= 12) }).toEqual({ id: palette.id, near: true });
    }
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

describe("the tour of the palettes, and a tap in the middle of it", () => {
  const setup = (reducedMotion: boolean) => {
    const scheduler = fakeScheduler();
    const shown: number[] = [];
    const tour = createTour({ reducedMotion, scheduler, onSelect: (index) => shown.push(index) });

    return { scheduler, shown, tour, last: () => shown[shown.length - 1] };
  };

  test("the card tries the other four one step apart and comes back to the first", () => {
    const { scheduler, shown, tour } = setup(false);

    tour.start();
    scheduler.advance(PLAY_STEP_MS * 5);
    expect(shown).toEqual([1, 2, 3, 4, 0]);
  });

  test("tapping a swatch stops the tour on the palette tapped: the card never changes under the visitor's finger", () => {
    const { scheduler, shown, tour, last } = setup(false);

    tour.start();
    scheduler.advance(PLAY_STEP_MS * 2 + 100);
    tour.pick(4);
    expect(last()).toBe(4);
    scheduler.advance(PLAY_STEP_MS * 10);
    expect(last()).toBe(4);
    expect(shown).toEqual([1, 2, 4]);
    expect(scheduler.pending).toBe(0);
  });

  test("a tap before the section is seen stops the tour from ever starting", () => {
    const { scheduler, shown, tour } = setup(false);

    tour.pick(3);
    tour.start();
    scheduler.advance(PLAY_STEP_MS * 10);
    expect(shown).toEqual([3]);
  });

  test("the tour plays once: scrolling away and back does not start it again", () => {
    const { scheduler, shown, tour } = setup(false);

    tour.start();
    scheduler.advance(PLAY_STEP_MS * 5);
    tour.start();
    scheduler.advance(PLAY_STEP_MS * 5);
    expect(shown).toHaveLength(5);
  });

  test("a reader who asks for less motion gets no tour, and a tap still picks", () => {
    const { scheduler, shown, tour } = setup(true);

    tour.start();
    expect(scheduler.pending).toBe(0);
    tour.pick(2);
    expect(shown).toEqual([2]);
  });

  test("leaving the page cancels what is waiting", () => {
    const { scheduler, shown, tour } = setup(false);

    tour.start();
    scheduler.advance(PLAY_STEP_MS);
    tour.stop();
    scheduler.advance(PLAY_STEP_MS * 10);
    expect(shown).toEqual([1]);
  });
});
