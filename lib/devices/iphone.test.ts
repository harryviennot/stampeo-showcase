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
  it("is Apple's file, untouched", () => {
    const file = join(PUBLIC, IPHONE.bezel.src);
    expect(createHash("sha256").update(readFileSync(file)).digest("hex")).toBe(IPHONE.bezel.sha256);
    expect(pngSize(file)).toEqual({ width: IPHONE.bezel.width, height: IPHONE.bezel.height });
  });

  it("is drawn at its own proportions, 3 pixels to the point", () => {
    expect(IPHONE.bezel.width / IPHONE.frame.width).toBe(3);
    expect(IPHONE.bezel.height / IPHONE.frame.height).toBe(3);
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
  it("is the bezel's own geometry at its natural width", () => {
    const layout = iphoneLayout(IPHONE.frame.width);
    expect(layout.height).toBe(IPHONE.frame.height);
    expect(layout.screen).toEqual({ left: 24, top: 23, width: 402, height: 874, radius: 63 });
    expect(layout.safeTop).toBe(IPHONE.safeTop);
    expect(layout.safeBottom).toBe(IPHONE.safeBottom);
  });

  it("scales every measure with the width, never the proportions", () => {
    const layout = iphoneLayout(280);
    const s = 280 / IPHONE.frame.width;
    expect(layout.height).toBeCloseTo(IPHONE.frame.height * s, 6);
    expect(layout.screen.width / layout.screen.height).toBeCloseTo(402 / 874, 9);
    expect(layout.screen.left).toBeCloseTo(24 * s, 6);
    expect(layout.screen.radius).toBeCloseTo(63 * s, 6);
    expect(layout.safeTop).toBeCloseTo(62 * s, 6);
  });

  it("is no taller than the hand-built phone it replaces at the default width", () => {
    // The old frame: 280 wide, a 260-wide 9/19.5 screen plus 10px of bezel each side.
    expect(iphoneLayout(280).height).toBeLessThanOrEqual(260 * (19.5 / 9) + 20);
  });
});

describe("one phone on the site", () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
    });

  it("no hand-built phone frame remains", () => {
    const offenders = [...files(join(ROOT, "components")), ...files(join(ROOT, "app"))]
      .filter((file) => /PhoneMockup|Dynamic Island/.test(readFileSync(file, "utf8")))
      .map((file) => file.slice(ROOT.length + 1));
    expect(offenders).toEqual([]);
  });
});
