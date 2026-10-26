import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { IPHONE, STATUS_BARS, iphoneLayout } from "./iphone";

const ROOT = join(import.meta.dir, "..", "..");
const PUBLIC = join(ROOT, "public");

function pngSize(file: string) {
  const bytes = readFileSync(file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("the iPhone bezel", () => {
  it("is Apple's file, untouched, at 3 pixels to the point", () => {
    const file = join(PUBLIC, IPHONE.bezel.src);
    expect(createHash("sha256").update(readFileSync(file)).digest("hex")).toBe(IPHONE.bezel.sha256);
    expect(pngSize(file)).toEqual({ width: IPHONE.frame.width * 3, height: IPHONE.frame.height * 3 });
  });
});

describe("the status bars", () => {
  it.each(Object.entries(STATUS_BARS))("%s is a full-width strip of the screen's top safe area", (_, src) => {
    const file = join(PUBLIC, src);
    expect(existsSync(file)).toBe(true);
    expect(pngSize(file)).toEqual({ width: IPHONE.screen.width * 3, height: IPHONE.safeTop * 3 });
  });
});

describe("iphoneLayout", () => {
  it("keeps iOS's safe areas at the bezel's natural width", () => {
    const layout = iphoneLayout(450);
    expect(layout.height).toBe(920);
    expect(layout.screen).toEqual({ left: 24, top: 23, width: 402, height: 874, radius: 63 });
    expect([layout.safeTop, layout.safeBottom]).toEqual([62, 34]);
  });

  // 280 px: the width every phone on the site is drawn at before any CSS scale.
  it.each([
    ["height", (l: ReturnType<typeof iphoneLayout>) => l.height, 572.44],
    ["screen left", (l) => l.screen.left, 14.93],
    ["screen top", (l) => l.screen.top, 14.31],
    ["screen width", (l) => l.screen.width, 250.13],
    ["screen height", (l) => l.screen.height, 543.82],
    ["screen radius", (l) => l.screen.radius, 39.2],
    ["body left", (l) => l.body.left, 4.98],
    ["body top", (l) => l.body.top, 4.36],
    ["body width", (l) => l.body.width, 270.04],
    ["body height", (l) => l.body.height, 563.73],
    ["body radius", (l) => l.body.radius, 49.78],
    ["safe top", (l) => l.safeTop, 38.58],
    ["safe bottom", (l) => l.safeBottom, 21.16],
  ] as [string, (l: ReturnType<typeof iphoneLayout>) => number, number][])("%s at 280 px wide", (_, pick, expected) => {
    expect(pick(iphoneLayout(280))).toBeCloseTo(expected, 1);
  });
});

describe("one phone on the site", () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
    });

  // The hand-built frames were PhoneMockup components drawing a 9/19.5 screen.
  it("no hand-built phone frame remains", () => {
    const offenders = [...files(join(ROOT, "components")), ...files(join(ROOT, "app"))]
      .filter((file) => /PhoneMockup|aspect-\[9\/19\.5\]|9 ?\/ ?19\.5/.test(readFileSync(file, "utf8")))
      .map((file) => file.slice(ROOT.length + 1));
    expect(offenders).toEqual([]);
  });
});
