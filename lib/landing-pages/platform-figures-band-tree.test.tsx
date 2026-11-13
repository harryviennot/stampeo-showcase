/**
 * Three Platform sections a visitor reads by their look: the figures written by
 * hand, the closing card, and the share tree whose branches fill as the page
 * scrolls past it.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { NumberFigures } from "@/components/landing-pages/platform/NumberFigures";
import { ShareTree } from "@/components/landing-pages/platform/ShareTree";
import { ROOT, code, findTag, read } from "../testing/jsx-source";
import { COMPONENTS_DIR } from "../testing/landing-pages-source";
import { renderEn, textOf } from "../testing/render-en";
import { PLATFORM } from "./copy/platform";
import { treeFill } from "./scroll-fill";

const METRICS = (JSON.parse(read(join(ROOT, "messages", "en", "landing.json"))) as {
  variant: { metrics: { items: Array<{ value: string; label: string }> } };
}).variant.metrics.items;

describe("by the numbers: the homepage's handwritten figures", () => {
  test("each figure of the catalog is written in the homepage's hand, over its own label, in order", () => {
    const html = renderEn(<NumberFigures items={METRICS} />);
    const figures = [...html.matchAll(/<[^>]*class="[^"]*\bink-figure\b[^"]*"[^>]*>([^<]*)</g)].map((match) => match[1]);
    const text = textOf(html);
    const order = METRICS.flatMap((item) => [text.indexOf(item.value), text.indexOf(item.label)]);

    expect(figures).toEqual(METRICS.map((item) => item.value));
    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test("the block reads its figures from the catalog, the one source the proof lines share", () => {
    const source = code(join(COMPONENTS_DIR, "platform", "NumbersBlock.tsx"));

    expect(source).toContain('getTranslations("variant.metrics")');
    expect(findTag(source, "NumberFigures")?.attrs).toMatch(/items=\{items\}/);
  });
});

describe("the closing card", () => {
  const html = () => renderEn(<LpAccentBand />, { us: true });

  test("writes the headline in the page's ink with its accent word in orange", () => {
    const words = PLATFORM.band.accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    expect(html()).toMatch(new RegExp(`<h2[^>]*>[^<]*<span class="text-\\[var\\(--accent\\)\\]">${words}</span></h2>`));
  });

  test("keeps orange for the accents: the button is the one orange-filled thing in it", () => {
    const filled = html().match(/class="[^"]*\bbg-\[var\(--accent\)\][^"]*"/g) ?? [];

    expect(filled).toHaveLength(1);
    expect(filled[0]).toContain("rounded-full");
  });
});

describe("the share tree fills as the page scrolls past it", () => {
  const VIEWPORT = 900;
  const HEIGHT = 450;
  const at = (top: number) => treeFill({ top, height: HEIGHT, viewport: VIEWPORT });

  test("empty while the tree is still below the fold, full once its channels are well in view, growing in between", () => {
    const path = [900, 800, 700, 600, 500, 400, 300, 200, 100].map(at);

    expect(at(1600)).toBe(0);
    expect(at(VIEWPORT)).toBe(0);
    expect(at(-400)).toBe(1);
    expect(path).toEqual([...path].sort((a, b) => a - b));
    expect(path.filter((fill) => fill > 0 && fill < 1).length).toBeGreaterThanOrEqual(4);
  });

  test("the branches follow that fill, and the first paint draws them whole: what a reader who asks for less motion keeps", () => {
    const markup = renderEn(<ShareTree />);

    expect(markup).toContain("--fill:1");
    expect(markup).toMatch(/stroke-dashoffset:calc\(1 - var\(--fill/);
  });
});
