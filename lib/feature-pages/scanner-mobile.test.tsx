/**
 * The scanner feature page (/features/scanner-mobile and its English, Spanish
 * and Polish slugs): its hero shows the Scanner loop, the video of the real
 * Scanner app adding a stamp, in the page's language. The animated scan demo
 * it replaced is gone from the site.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ScannerMobilePage } from "@/components/features/scanner-mobile/ScannerMobilePage";
import { routing } from "@/i18n/routing";
import { scannerLoopFiles } from "../videos/scanner-loop";
import { loadCatalog } from "../testing/catalogs";
import { ROOT, filesWith, sourceFiles } from "../testing/jsx-source";
import { renderIn } from "../testing/render-en";

/** The page's first section, the hero, as the locale's page serves it. */
const hero = (locale: string) => {
  const html = renderIn(locale, <ScannerMobilePage />);
  return html.slice(0, html.indexOf("</section>"));
};

describe("the scanner page's hero shows the Scanner loop", () => {
  test.each(routing.locales)("%s: the loop's first frame, fetched first, described in the page's language", (locale) => {
    const frame = hero(locale).match(/<img\b[^>]*\bsrc="\/videos\/scanner-loop\/[^"]*"[^>]*>/)?.[0] ?? "";
    const label: string = loadCatalog(locale).common.scannerLoop.label;

    expect(frame).toContain(`src="${scannerLoopFiles(locale).first}"`);
    expect(frame).toContain('fetchPriority="high"');
    expect(frame).toContain(`alt="${label.replaceAll("'", "&#x27;")}"`);
  });

  test("the margin note beside the phone still says it is the team's app", () => {
    expect(hero("en")).toContain("your team&#x27;s app");
  });
});

describe("the scan demo is gone", () => {
  test("its file is deleted and no source file names it", () => {
    const files = ["components", "app", "lib", "hooks"].flatMap((dir) => sourceFiles(join(ROOT, dir)));

    expect(existsSync(join(ROOT, "components/features/scanner-mobile/ScanDemo.tsx"))).toBe(false);
    expect(filesWith(files, /\bScanDemo\b/)).toEqual([]);
  });
});
