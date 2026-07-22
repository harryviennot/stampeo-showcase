import { describe, expect, it } from "bun:test";
import {
  recommendEngine,
  PICKER_QUESTIONS,
  QUESTION_WEIGHTS,
  type Answer,
} from "./loyalty-picker";

describe("recommendEngine", () => {
  it("recommends stamps when every answer points to stamps", () => {
    const r = recommendEngine(["stamps", "stamps", "stamps"]);
    expect(r.engine).toBe("stamps");
    expect(r.stampScore).toBe(4); // 2 + 1 + 1
    expect(r.pointsScore).toBe(0);
  });

  it("recommends points when every answer points to points", () => {
    const r = recommendEngine(["points", "points", "points"]);
    expect(r.engine).toBe("points");
    expect(r.pointsScore).toBe(4);
    expect(r.stampScore).toBe(0);
  });

  it("returns 'either' on an exact tie", () => {
    // Q1 (weight 2) stamps vs Q2+Q3 (weight 1 each) points => 2 vs 2.
    const r = recommendEngine(["stamps", "points", "points"]);
    expect(r.stampScore).toBe(2);
    expect(r.pointsScore).toBe(2);
    expect(r.engine).toBe("either");
  });

  it("returns 'either' when every answer is neutral", () => {
    const r = recommendEngine(["neutral", "neutral", "neutral"]);
    expect(r).toEqual({ engine: "either", stampScore: 0, pointsScore: 0 });
  });

  it("lets the weighted price question tip a mixed set", () => {
    // price=points(2), freq=stamps(1), reward=stamps(1) => 2 vs 2 => either
    expect(recommendEngine(["points", "stamps", "stamps"]).engine).toBe("either");
    // price=points(2), freq=points(1), reward=stamps(1) => points 3, stamp 1
    expect(recommendEngine(["points", "points", "stamps"]).engine).toBe("points");
  });

  it("ignores neutral answers in scoring", () => {
    const r = recommendEngine(["points", "neutral", "neutral"]);
    expect(r).toEqual({ engine: "points", stampScore: 0, pointsScore: 2 });
  });
});

describe("picker config integrity", () => {
  it("has a weight for every question", () => {
    expect(QUESTION_WEIGHTS.length).toBe(PICKER_QUESTIONS.length);
  });

  it("only uses valid answers in every option", () => {
    const valid: Answer[] = ["stamps", "points", "neutral"];
    for (const q of PICKER_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const o of q.options) {
        expect(valid).toContain(o.answer);
      }
    }
  });
});
