import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { SHOT_SIZES, landingShot, type ShotView } from "./dashboard-shots";

const PUBLIC = join(import.meta.dir, "..", "..", "public");
const VIEWS = Object.keys(SHOT_SIZES) as ShotView[];

/** Pixel size from a PNG's IHDR chunk (big-endian width then height at byte 16). */
function pngSize(file: string) {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString("latin1")).toBe("PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("landing dashboard captures", () => {
  for (const locale of routing.locales) {
    for (const view of VIEWS) {
      const shot = landingShot(locale, view);

      it(`${locale} ${view}: the file the section points at exists`, () => {
        expect(existsSync(join(PUBLIC, shot.src))).toBe(true);
      });

      it(`${locale} ${view}: its real pixel size is the declared one`, () => {
        // A re-shoot at another size would otherwise stretch the image or
        // shift the layout, and a binary diff shows neither in review.
        expect(pngSize(join(PUBLIC, shot.src))).toEqual({ width: shot.width, height: shot.height });
      });
    }
  }

  it.each(routing.locales)("%s: shows its own captures, never another locale's", (locale) => {
    for (const view of VIEWS) {
      expect(landingShot(locale, view).src).toBe(`/images/landing/dashboard/${locale}-${view}.png`);
    }
  });
});
