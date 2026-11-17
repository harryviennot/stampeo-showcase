import { describe, expect, test } from "bun:test";
import { MOBILE_SCANNER_PREVIEW } from "../copy/previews/mobile-scanner";
import { COUNTER_KEYS, autoplays, counterKeyTarget, crossfadeMs, stepCounter } from "./scanner-counter";

describe("the counter's four screens", () => {
  test("they are the copy's four buttons, in the copy's order, Stamps first", () => {
    expect([...COUNTER_KEYS]).toEqual(MOBILE_SCANNER_PREVIEW.counter.options.map((option) => option.key));
    expect(COUNTER_KEYS[0]).toBe("stamps");
  });

  test("an arrow key moves to the next screen or the one before, and wraps at both ends", () => {
    expect(stepCounter("stamps", 1)).toBe("points");
    expect(stepCounter("levels", 1)).toBe("stamps");
    expect(stepCounter("stamps", -1)).toBe("levels");
    expect(stepCounter("rewards", -1)).toBe("points");
  });

  test.each([
    ["ArrowRight", "points"],
    ["ArrowDown", "points"],
    ["ArrowLeft", "levels"],
    ["ArrowUp", "levels"],
  ] as const)("on Stamps, %s goes to %s: the key that selects it is the one that takes the focus", (key, to) => {
    expect(counterKeyTarget("stamps", key)).toBe(to);
  });

  test.each(["Tab", "Enter", " ", "Home", "constructor"])("%s is left to the browser: no screen is picked and the page is not stopped from using it", (key) => {
    expect(counterKeyTarget("stamps", key)).toBeNull();
  });
});

describe("when the counter turns its own pages", () => {
  const base = { reducedMotion: false, inView: true, touched: false };

  test("while it is on screen and nobody has tapped", () => {
    expect(autoplays(base)).toBe(true);
  });

  test.each([
    ["it is off screen", { inView: false }],
    ["the visitor has tapped a button", { touched: true }],
    ["the visitor asks for less motion", { reducedMotion: true }],
  ])("it stays put when %s", (_why, change) => {
    expect(autoplays({ ...base, ...change })).toBe(false);
  });

  test("the screens cross-fade, and swap at once for a reader who asks for less motion", () => {
    expect(crossfadeMs(false)).toBeGreaterThan(0);
    expect(crossfadeMs(true)).toBe(0);
  });
});
