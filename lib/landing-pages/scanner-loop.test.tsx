/**
 * The Scanner loop on Platform and its previews: every page's scanner visual is the
 * video of the Scanner app adding a stamp, and the cards beside it count the
 * stamps it ends on. The loop itself is pinned in `lib/videos/scanner-loop.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { SCANNER_LOOP } from "@/lib/videos/scanner-loop";
import { code, findTag, openingTags, read } from "../testing/jsx-source";
import { lpFiles, pageComponent, pageFile, landingTree } from "../testing/landing-pages-source";
import { STAMP_BANNER } from "./copy/shared";
import type { LandingSlug } from "./pages";

describe("every landing page's scanner visual is the Scanner loop", () => {
  /** Where Platform shows its scanner: its "how" and its Scanner tab. */
  const VISUALS: Array<readonly [LandingSlug, folder: string, name: string]> = [
    ["platform", "platform", "HowTable"],
    ["platform", "platform", "PlatformSection"],
  ];

  test.each(VISUALS)("%s: %s/%s draws <ScannerLoop> and is on the page", (slug, folder, name) => {
    const file = pageComponent(folder, name);

    expect(openingTags(read(file)).some((tag) => tag.name === "ScannerLoop")).toBe(true);
    expect(landingTree(pageFile(slug)).has(file)).toBe(true);
  });

  /** The preview that draws the loop: the scanner's hero. */
  const PREVIEW_USERS = [
    pageFile("platform/mobile-scanner"),
  ];

  test("no other file of the pages draws one", () => {
    const users = lpFiles().filter((file) => openingTags(read(file)).some((tag) => tag.name === "ScannerLoop"));

    expect(users.sort()).toEqual([...VISUALS.map(([, folder, name]) => pageComponent(folder, name)), ...PREVIEW_USERS].sort());
  });

  test("Platform's wallet phone beside the scanner shows the stamp count the video ends on", () => {
    const [, stamp, total] = STAMP_BANNER.body.match(/(\d+) of (\d+) stamps/) ?? [];
    const phone = findTag(code(pageComponent("platform", "HowTable")), "WalletPhone");

    expect(SCANNER_LOOP.stamps).toBe(Number(stamp));
    expect(Number(total)).toBe(8);
    expect(phone?.attrs).toMatch(/\bstamps=\{SCANNER_LOOP\.stamps\}/);
  });
});
