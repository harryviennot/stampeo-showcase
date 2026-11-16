/**
 * The two switches Harry compares the Platform hero and the phone menu with: `?hero=` and `?menu=`. A visitor who
 * types nothing, or something that is not a variant, always gets the default one.
 */

import { describe, expect, test } from "bun:test";
import { HERO_VARIANTS, MENU_VARIANTS, heroVariant, menuVariant } from "./variants";

const query = (search: string) => new URLSearchParams(search);

describe("?hero=: the Wallet stack unless the shelf is asked for", () => {
  test.each([
    ["no query", "", "stack"],
    ["stack", "hero=stack", "stack"],
    ["shelf", "hero=shelf", "shelf"],
    ["a capital letter", "hero=Shelf", "shelf"],
    ["a variant that does not exist", "hero=fan", "stack"],
    ["an empty value", "hero=", "stack"],
    ["the menu's switch alone", "menu=drill", "stack"],
    ["both switches", "hero=shelf&menu=drill", "shelf"],
    ["the same switch twice: the first one wins", "hero=shelf&hero=stack", "shelf"],
  ])("%s", (_what, search, expected) => {
    expect(heroVariant(query(search))).toBe(expected);
  });

  test("with no query object at all (a render with no URL) it is the default", () => {
    expect(heroVariant(null)).toBe("stack");
    expect(heroVariant(undefined)).toBe("stack");
  });
});

describe("?menu=: the index sheet unless the drill-down is asked for", () => {
  test.each([
    ["no query", "", "sheet"],
    ["sheet", "menu=sheet", "sheet"],
    ["drill", "menu=drill", "drill"],
    ["a capital letter", "menu=DRILL", "drill"],
    ["a variant that does not exist", "menu=tabs", "sheet"],
    ["the hero's switch alone", "hero=shelf", "sheet"],
    ["both switches", "hero=shelf&menu=drill", "drill"],
  ])("%s", (_what, search, expected) => {
    expect(menuVariant(query(search))).toBe(expected);
  });

  test("with no query object at all it is the default", () => {
    expect(menuVariant(null)).toBe("sheet");
  });
});

describe("what the helper reads", () => {
  test("anything with a get(name) works, as Next's read-only search params do", () => {
    const params = { get: (name: string) => (name === "hero" ? "shelf" : null) };

    expect(heroVariant(params)).toBe("shelf");
    expect(menuVariant(params)).toBe("sheet");
  });

  test("the default is the first variant of each list", () => {
    expect(HERO_VARIANTS[0]).toBe("stack");
    expect(MENU_VARIANTS[0]).toBe("sheet");
    expect([...HERO_VARIANTS]).toEqual(["stack", "shelf"]);
    expect([...MENU_VARIANTS]).toEqual(["sheet", "drill"]);
  });
});
