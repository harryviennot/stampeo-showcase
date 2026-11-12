/**
 * The Platform hero's wheel of sample cards: which cards ride it, what the
 * first paint carries, and that it only turns for readers who don't ask for
 * less motion.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { CardWheel } from "@/components/landing-pages/platform/CardWheel";
import { STAMP_SAMPLES } from "../loyalty-samples";
import { ROOT, read } from "../testing/jsx-source";
import { renderEn } from "../testing/render-en";
import { WHEEL_CARDS, inFirstPaint } from "./card-wheel";

const BARBER = STAMP_SAMPLES.find((sample) => sample.id === "barber");
/** The sector brands made for the carousel, each a fictional shop of its own trade. */
const SECTOR_BRANDS = ["rolling-slice", "fournee", "lashwell", "harvest-row", "saltmoss", "smash-club"];

describe("the cards on the wheel", () => {
  test("are 14 to 16 different fictional shops, the sector brands among them, on stamps and on points", () => {
    const ids = WHEEL_CARDS.map((card) => card.id);

    expect(ids.length).toBeGreaterThanOrEqual(14);
    expect(ids.length).toBeLessThanOrEqual(16);
    expect(new Set(ids).size).toBe(ids.length);
    for (const brand of SECTOR_BRANDS) expect(ids).toContain(brand);
    expect(WHEEL_CARDS.some((card) => card.design.card_type === "points")).toBe(true);
    expect(WHEEL_CARDS.some((card) => card.design.card_type !== "points")).toBe(true);
  });

  test("never show the barbershop, whose name and logo belong to a real shop", () => {
    expect(BARBER?.design.logo_url).toBeDefined();
    for (const card of WHEEL_CARDS) {
      expect(card.id).not.toBe("barber");
      expect(card.design.logo_url).not.toBe(BARBER?.design.logo_url);
    }
  });

  test("each carries its shop's own logo", () => {
    for (const card of WHEEL_CARDS) expect(card.design.logo_url).toMatch(/^\/themes\//);
  });
});

/** The `<div …>…</div>` that opens at `start`, by counting the divs nested in it. */
function divAt(html: string, start: number): string {
  let depth = 0;
  for (const match of html.slice(start).matchAll(/<div\b|<\/div>/g)) {
    depth += match[0] === "</div>" ? -1 : 1;
    if (depth === 0) return html.slice(start, start + match.index + match[0].length);
  }
  return html.slice(start);
}

describe("the wheel on the page", () => {
  const ACTION = '<button type="button">Start my free trial</button>';
  const html = () =>
    renderEn(
      <CardWheel>
        <button type="button">Start my free trial</button>
      </CardWheel>,
    );
  const logos = (cards: typeof WHEEL_CARDS) => cards.map((card) => card.design.logo_url ?? "");

  test("is decoration behind the actions: every card on the rim is hidden from screen readers, the actions are not", () => {
    const hidden = divAt(html(), html().search(/<div[^>]*aria-hidden="true"/));
    const slots = [...hidden.matchAll(/data-wheel-card="([^"]+)"/g)].map((match) => match[1]);

    expect(slots).toEqual(WHEEL_CARDS.map((card) => card.id));
    expect(html()).toContain(ACTION);
    expect(hidden).not.toContain(ACTION);
  });

  test("the first paint draws the cards on the upper half, the rest come once the page has loaded", () => {
    const first = WHEEL_CARDS.filter((_, index) => inFirstPaint(index));
    const later = WHEEL_CARDS.filter((_, index) => !inFirstPaint(index));

    expect(first.length).toBeGreaterThanOrEqual(5);
    expect(later.length).toBeGreaterThan(0);
    for (const logo of logos(first)) expect(html()).toContain(`src="${logo}"`);
    for (const logo of logos(later)) expect(html()).not.toContain(`src="${logo}"`);
  });

  test("turns only for readers who don't ask for less motion, and stops while it is off-screen", () => {
    const css = read(join(ROOT, "components", "landing-pages", "platform", "card-wheel.css"));
    const motion = /@media \(prefers-reduced-motion: no-preference\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";

    expect(motion).toMatch(/animation:\s*card-wheel-turn/);
    expect(css.replace(motion, "")).not.toMatch(/animation:\s*card-wheel-turn/);
    expect(css).toMatch(/\[data-paused\][^{]*\{\s*animation-play-state:\s*paused/);
  });
});
