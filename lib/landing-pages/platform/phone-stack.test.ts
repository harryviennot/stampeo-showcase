/**
 * The cards of Platform's phone stack: the one in front and the three whose tops show behind it. Pure data;
 * what the stack looks like is in `platform-hero.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { LEVEL_LOOKS } from "@/lib/levels/looks";
import { PHONE_STACK, type StackCard } from "./phone-stack";

const behind = PHONE_STACK.behind;
const all = (): StackCard[] => [PHONE_STACK.front, ...behind];
const brandOf = (card: StackCard) => card.design.logo_url ?? "";

describe("the four cards of the phone stack", () => {
  test("are four different shops, none of them a real one and none of them the bubble tea shop", () => {
    expect(all()).toHaveLength(4);
    expect(new Set(all().map(brandOf)).size).toBe(4);
    for (const card of all()) expect(brandOf(card)).not.toMatch(/\/themes\/(oba|barber)\//);
  });

  test("put the sample café's stamp card in front at 5 of 8, the card the rest of the pages follow", () => {
    expect(PHONE_STACK.front.id).toBe("aurevo");
    expect(PHONE_STACK.front.program).toBe("stamps");
    expect(PHONE_STACK.front.stamps).toBe(5);
  });

  test("show a points card, a level card and a stamp card behind it, so the tops tell the three programs apart", () => {
    const programs = behind.map((card) => (card.headerLabel ? "levels" : card.program));

    expect([...programs].sort()).toEqual(["levels", "points", "stamps"]);
  });

  test("a level card prints its level over the count, in a look from the catalog", () => {
    const level = behind.find((card) => card.headerLabel);
    const catalog = Object.values(LEVEL_LOOKS).map((look) => look.background_color);

    expect(level?.headerLabel).toBe("Silver");
    expect(catalog).toContain(level?.design.background_color ?? "");
  });
});
