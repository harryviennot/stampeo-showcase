import { describe, expect, it } from "bun:test";
import { previewPointsBalance, previewStampCount } from "./signup-preview";
import type { RewardTier } from "@/lib/types/design";

const REWARDS: RewardTier[] = [
  { id: "r1", threshold: 150, name: "Bookmark" },
  { id: "r2", threshold: 300, name: "Paperback" },
];

describe("previewStampCount", () => {
  it("shows the configured head start", () => {
    expect(previewStampCount(2)).toBe(2);
  });

  it("falls back to demo stamps when no head start is set", () => {
    expect(previewStampCount(0)).toBe(3);
    expect(previewStampCount(undefined)).toBe(3);
  });
});

describe("previewPointsBalance", () => {
  it("shows the configured head start", () => {
    expect(previewPointsBalance(100, REWARDS)).toBe(100);
  });

  it("shows a head start above the first reward as-is (instant welcome gift)", () => {
    expect(previewPointsBalance(200, REWARDS)).toBe(200);
  });

  it("falls back to 60% of the first reward when no head start is set", () => {
    expect(previewPointsBalance(0, REWARDS)).toBe(90);
    expect(previewPointsBalance(undefined, REWARDS)).toBe(90);
  });

  it("is zero with neither head start nor rewards", () => {
    expect(previewPointsBalance(undefined, [])).toBe(0);
  });
});
