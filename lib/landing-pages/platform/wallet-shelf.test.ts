/** The straight shelf behind `?hero=shelf`: its nine cards, and the five a phone keeps. */

import { describe, expect, test } from "bun:test";
import { LEVEL_LOOKS } from "@/lib/levels/looks";
import { SHELF_CARDS, SHELF_ON_PHONE } from "./wallet-shelf";
import type { StackCard } from "./wallet-stack";

const isLevel = (card: StackCard) => card.headerLabel !== undefined;
const brandOf = (card: StackCard) => card.design.logo_url ?? "";
/** What a visitor takes a card for: its level's name, else its program. */
const kindOf = (card: StackCard) => card.headerLabel ?? card.program;

describe("the shelf", () => {
  test("is nine cards: three stamp cards, three points cards, then one shop's card at Bronze, Silver and Gold", () => {
    const [stamps, points, levels] = [SHELF_CARDS.slice(0, 3), SHELF_CARDS.slice(3, 6), SHELF_CARDS.slice(6)];

    expect(SHELF_CARDS).toHaveLength(9);
    expect(stamps.every((card) => card.program === "stamps" && !isLevel(card))).toBe(true);
    expect(points.every((card) => card.program === "points" && !isLevel(card))).toBe(true);
    expect(levels.map((card) => card.headerLabel)).toEqual(["Bronze", "Silver", "Gold"]);
    expect(new Set(levels.map(brandOf)).size).toBe(1);
    expect(levels.map((card) => card.design.background_color)).toEqual([
      LEVEL_LOOKS.bronze.background_color,
      LEVEL_LOOKS.silver.background_color,
      LEVEL_LOOKS.gold.background_color,
    ]);
  });

  test("the six cards that are not levels are six different shops", () => {
    const plain = SHELF_CARDS.filter((card) => !isLevel(card));

    expect(new Set(plain.map(brandOf)).size).toBe(6);
    for (const card of SHELF_CARDS) expect(brandOf(card)).not.toMatch(/\/themes\/(oba|barber)\//);
  });

  test("on a phone it keeps five of them, interleaved: stamps, points, Silver, stamps, Gold", () => {
    const kept = SHELF_ON_PHONE.map((index) => SHELF_CARDS[index]);

    expect(new Set(SHELF_ON_PHONE).size).toBe(5);
    expect(kept.map(kindOf)).toEqual(["stamps", "points", "Silver", "stamps", "Gold"]);
  });
});
