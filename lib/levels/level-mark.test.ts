import { describe, expect, test } from "bun:test";
import { LEVEL_INK, levelMarkColor } from "./level-mark";

describe("levelMarkColor", () => {
  test.each([
    ["a cream", "#FFF7ED"],
    ["white", "#ffffff"],
    ["a pale yellow", "#ffd60a"],
    ["the default orange, just under 3:1", "#f97316"],
    ["a cream written as rgb()", "rgb(255, 247, 237)"],
    ["a short hex", "#fff"],
  ])("takes the ink when the business accent is %s", (_, accent) => {
    expect(levelMarkColor(accent)).toBe(LEVEL_INK);
  });

  test.each([
    ["a blue", "#1d4ed8"],
    ["a teal", "#0f766e"],
    ["an amber just over 3:1", "#d97706"],
    ["a dark slate", "#2d3436"],
    ["a red written as rgb()", "rgb(185, 28, 28)"],
    ["a red", "#b91c1c"],
  ])("keeps the business accent when it is %s", (_, accent) => {
    expect(levelMarkColor(accent)).toBe(accent);
  });

  test.each([[null], [undefined], [""], ["   "], ["not-a-colour"], ["var(--accent)"]])(
    "takes the ink when the accent is %p",
    (accent) => {
      expect(levelMarkColor(accent)).toBe(LEVEL_INK);
    },
  );
});
