import { describe, expect, test } from "bun:test";
import { smallestLabelPx, smallestLabelPxIn } from "./stacked-rows";

describe("the smallest label a component draws, as a phone shows it", () => {
  test.each([
    ["an arbitrary size", '<p className="text-[11px] leading-4">x</p>', 11],
    ["a named size", '<p className="text-sm">x</p><p className="text-xs">y</p>', 12],
    ["a style", "<p style={{ fontSize: 13 }}>x</p>", 13],
    ["a quoted style", '<p style={{ fontSize: "9.5px" }}>x</p>', 9.5],
    ["the smallest of several", '<b className="text-[68px]">x</b><i className="text-base">y</i><s className="text-[10px]">z</s>', 10],
    ["a size a wider screen sets is not a phone's", '<p className="text-[9px] lg:text-[20px] sm:text-base">x</p>', 9],
    ["a colour is not a size", '<p className="text-[#8a8a8a] text-center text-sm">x</p>', 14],
  ])("%s", (_what, source, px) => {
    expect(smallestLabelPxIn(source)).toBe(px);
  });

  test.each([
    ["nothing sets a size", "<p>plain</p>"],
    ["only a wider screen does", '<p className="lg:text-sm">x</p>'],
  ])("it fails when %s, rather than passing every check", (_what, source) => {
    expect(() => smallestLabelPxIn(source)).toThrow(/no font size/);
  });

  test("it reads a component's source, comments left out", () => {
    expect(smallestLabelPx(`${import.meta.dir}/../../components/landing-pages/feature-previews/analytics/QuestionMinis.tsx`)).toBe(9);
  });
});
