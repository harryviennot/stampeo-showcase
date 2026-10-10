import { describe, expect, test } from "bun:test";
import { statSync } from "node:fs";
import { join } from "node:path";

/** The landing page's theme images ship to every visitor of those sections, so each stays light. */
const KB = 1024;
const IMAGES: Array<[path: string, maxKb: number]> = [
  ["themes/restaurant/strip.jpg", 80],
  ["themes/gelo/cone.png", 60],
  ["themes/gelo/cone-grey.png", 60],
];

describe("theme images", () => {
  test.each(IMAGES)("%s is at most %i KB", (path, maxKb) => {
    const bytes = statSync(join(import.meta.dir, "..", "..", "public", path)).size;

    expect({ path, kb: Math.ceil(bytes / KB), withinLimit: bytes <= maxKb * KB }).toEqual({
      path,
      kb: Math.ceil(bytes / KB),
      withinLimit: true,
    });
  });
});
