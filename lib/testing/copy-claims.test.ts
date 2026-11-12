import { describe, expect, test } from "bun:test";
import { DIGIT_DAYS, WORDED_TRIAL } from "./copy-claims";

/**
 * The trial-length guards read a number and "day" joined by a space, a hyphen
 * or a Unicode hyphen: the pages write "{trialDays}‑day" with U+2011 so it
 * never breaks across a line, and a worded "14‑day free trial" typed the same
 * way has to be caught too.
 */
const JOINERS = [
  ["a space", " "],
  ["a hyphen", "-"],
  ["U+2010 (hyphen)", "‐"],
  ["U+2011 (non-breaking hyphen)", "‑"],
] as const;

describe("the worded trial guard", () => {
  test.each(JOINERS)("flags a trial length joined by %s", (_name, joiner) => {
    for (const phrase of [
      `Your 14${joiner}day free trial starts today.`,
      `Try it free for 14${joiner}days.`,
      `14${joiner}days for free`,
      `Start a 14${joiner}day trial`,
    ]) {
      expect({ phrase, flagged: WORDED_TRIAL.test(phrase) }).toEqual({ phrase, flagged: true });
    }
  });

  test.each(JOINERS)("accepts the {trialDays} token joined by %s", (_name, joiner) => {
    expect(WORDED_TRIAL.test(`Your {trialDays}${joiner}day free trial starts today.`)).toBe(false);
    expect(WORDED_TRIAL.test(`Try it free for {trialDays}${joiner}days.`)).toBe(false);
  });
});

describe("the digit-day guard", () => {
  test.each(JOINERS)("flags a count of days joined by %s", (_name, joiner) => {
    for (const phrase of [`Cancel within 14${joiner}day`, `a 30${joiner}days window`]) {
      expect({ phrase, flagged: DIGIT_DAYS.test(phrase) }).toEqual({ phrase, flagged: true });
    }
  });

  test.each(JOINERS)("accepts the {trialDays} token joined by %s", (_name, joiner) => {
    expect(DIGIT_DAYS.test(`your {trialDays}${joiner}day free trial`)).toBe(false);
  });

  test.each(["Live the same day", "From sign-up to first stamp, same day", "5 of 8 stamps", "Every day counts"])(
    "leaves %p alone",
    (fine) => {
      expect(DIGIT_DAYS.test(fine)).toBe(false);
    },
  );
});
