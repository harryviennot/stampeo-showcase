/**
 * Sign-up, login, password reset, email preferences and the demo wallet page
 * must never show up in search results, in any locale.
 *
 * Driven off the private tables in `consent-routes.ts`, which
 * `consent-routes.test.ts` pins to the real route folders, so a new private
 * page fails here until it declares NOINDEX.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PRIVATE_SEGMENTS, PRIVATE_SUBPATHS } from "./consent-routes";
import { NOINDEX } from "./page-robots";

const APP = join(import.meta.dir, "..", "app", "[locale]");

function pagesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? pagesUnder(join(dir, entry.name))
      : entry.name === "page.tsx"
        ? [join(dir, entry.name)]
        : [],
  );
}

/** Does the page, or a layout between it and the private segment, set `robots: NOINDEX`? */
function declaresNoindex(page: string, segmentRoot: string): boolean {
  for (let dir = dirname(page); dir.startsWith(segmentRoot); dir = dirname(dir)) {
    for (const file of ["page.tsx", "layout.tsx"]) {
      const path = join(dir, file);
      if (existsSync(path) && /robots:\s*NOINDEX\b/.test(readFileSync(path, "utf-8"))) return true;
    }
  }
  return false;
}

const PRIVATE_ROOTS = [
  ...PRIVATE_SEGMENTS,
  ...PRIVATE_SUBPATHS.map(([segment, child]) => `${segment}/${child}`),
];

describe("private routes", () => {
  test("are kept out of the index and their links are not followed", () => {
    expect(NOINDEX).toEqual({ index: false, follow: false });
  });

  test.each(PRIVATE_ROOTS)("every page under /%s declares NOINDEX", (root) => {
    const segmentRoot = join(APP, root);
    const pages = pagesUnder(segmentRoot);

    expect(pages.length).toBeGreaterThan(0);
    expect(pages.filter((page) => !declaresNoindex(page, segmentRoot))).toEqual([]);
  });
});
