import { describe, expect, test } from "bun:test";
import { MOBILE_SCANNER_PREVIEW } from "../copy/previews/mobile-scanner";
import { AUTO_ADVANCE_MS, COUNTER_KEYS, autoplays, crossfadeMs, stepCounter } from "./scanner-counter";
import { TEAM_CODE, TYPE_STEP_MS, codeBoxes, typesIn } from "./team-code";

/** The characters a team code can hold: the Scanner app's `JOIN_CODE_ALPHABET`, with no 0, O, 1, I, L or U to misread. */
const TEAM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

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
});

describe("when the counter turns its own pages", () => {
  const base = { reducedMotion: false, inView: true, touched: false };

  test("every 4 seconds while it is on screen and nobody has tapped", () => {
    expect(AUTO_ADVANCE_MS).toBe(4000);
    expect(autoplays(base)).toBe(true);
  });

  test.each([
    ["it is off screen", { inView: false }],
    ["the visitor has tapped a button", { touched: true }],
    ["the visitor asks for less motion", { reducedMotion: true }],
  ])("it stays put when %s", (_why, change) => {
    expect(autoplays({ ...base, ...change })).toBe(false);
  });

  test("the screens cross-fade in 250ms, and swap at once for a reader who asks for less motion", () => {
    expect(crossfadeMs(false)).toBe(250);
    expect(crossfadeMs(true)).toBe(0);
  });
});

describe("the team code the staff phone fills in", () => {
  test("it is six characters the app's alphabet allows, so no reader tries to type a 0 or an O", () => {
    expect(TEAM_CODE).toHaveLength(6);
    for (const char of TEAM_CODE) expect(TEAM_CODE_ALPHABET).toContain(char);
  });

  test("a box is typed once its character has been, left to right", () => {
    expect(codeBoxes(TEAM_CODE, 0).map(({ typed }) => typed)).toEqual([false, false, false, false, false, false]);
    expect(codeBoxes(TEAM_CODE, 2).map(({ typed }) => typed)).toEqual([true, true, false, false, false, false]);
    expect(codeBoxes(TEAM_CODE, 6).map(({ char }) => char).join("")).toBe(TEAM_CODE);
  });

  test("one more character every 120ms, and none of it for a reader who asks for less motion: the code is just there", () => {
    expect(TYPE_STEP_MS).toBe(120);
    expect(typesIn(false)).toBe(true);
    expect(typesIn(true)).toBe(false);
  });
});
