/**
 * The Scanner loop: the one video of a stamp being added that the four landing
 * pages show in place of the old scan demo. It is on every page's scanner visual,
 * it ships both formats with a first-frame poster, and a reader who asks for
 * less motion gets the finished-stamp still instead of a video.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { LoopVideo, ScannerLoopPhone } from "@/components/landing-pages/shared/ScannerLoop";
import { SCANNER_LOOP } from "@/components/landing-pages/shared/scanner-loop";
import { ROOT, code, findTag, openingTags, read } from "../testing/jsx-source";
import { lpFiles, pageComponent, pageFile, landingTree, shared } from "../testing/landing-pages-source";
import { renderEn } from "../testing/render-en";
import { STAMP_BANNER } from "./copy/shared";
import type { LandingSlug } from "./pages";

const VIDEOS = join(ROOT, "public");

describe("every landing page's scanner visual is the Scanner loop", () => {
  /** Where each page shows its scanner: how-to step 3, the features spotlight, Platform's "how" and its Scanner tab. */
  const VISUALS: Array<readonly [LandingSlug, folder: string, name: string]> = [
    ["how-it-works", "how-it-works", "StampStepVisual"],
    ["features", "features", "ScannerSpotlight"],
    ["platform", "platform", "HowTable"],
    ["platform", "platform", "PlatformSection"],
  ];

  test.each(VISUALS)("%s: %s/%s draws <ScannerLoop> and is on the page", (slug, folder, name) => {
    const file = pageComponent(folder, name);

    expect(openingTags(read(file)).some((tag) => tag.name === "ScannerLoop")).toBe(true);
    expect(landingTree(pageFile(slug)).has(file)).toBe(true);
  });

  test("no other file of the pages draws one, and none of them still uses the scan demo", () => {
    const users = lpFiles().filter((file) => openingTags(read(file)).some((tag) => tag.name === "ScannerLoop"));

    expect(users.sort()).toEqual(VISUALS.map(([, folder, name]) => pageComponent(folder, name)).sort());
    expect(lpFiles().filter((file) => /\bScanDemo\b/.test(code(file)))).toEqual([]);
  });

  test("Platform's wallet phone beside the scanner shows the stamp count the video ends on", () => {
    const [, stamp, total] = STAMP_BANNER.body.match(/(\d+) of (\d+) stamps/) ?? [];
    const phone = findTag(code(pageComponent("platform", "HowTable")), "WalletPhone");

    expect(SCANNER_LOOP.stamps).toBe(Number(stamp));
    expect(Number(total)).toBe(8);
    expect(phone?.attrs).toMatch(/\bstamps=\{SCANNER_LOOP\.stamps\}/);
  });

  test("the constants the server components read live in a module that is not a client module", () => {
    expect(read(join(ROOT, "components/landing-pages/shared/scanner-loop.ts"))).not.toMatch(/^\s*["']use client["']/);
  });
});

describe("the video", () => {
  const html = () => renderEn(<LoopVideo />);
  const video = () => html().match(/<video\b[^>]*>/)?.[0] ?? "";
  const has = (attr: string) => new RegExp(`\\s${attr}(?:=|\\s|/|>)`, "i").test(video());

  test("plays muted, looping and inline, and fetches only its metadata until it is in view", () => {
    for (const attr of ["muted", "loop", "playsinline"]) expect({ attr, has: has(attr) }).toEqual({ attr, has: true });
    expect(video()).toContain('preload="metadata"');
  });

  test("offers the webm, then the mp4, with the first frame as its poster", () => {
    const sources = [...html().matchAll(/<source\b[^>]*>/g)].map((match) => match[0]);

    expect(sources).toHaveLength(2);
    expect(sources[0]).toContain(`src="${SCANNER_LOOP.webm}"`);
    expect(sources[0]).toContain('type="video/webm"');
    expect(sources[1]).toContain(`src="${SCANNER_LOOP.mp4}"`);
    expect(sources[1]).toContain('type="video/mp4"');
    expect(video()).toContain(`poster="${SCANNER_LOOP.first}"`);
  });

  test("keeps its size so nothing shifts, and says what it shows", () => {
    expect(video()).toContain('width="804"');
    expect(video()).toContain('height="1748"');
    expect(video()).toContain('aria-label="The Stampeo Scanner app adding a stamp to Sophie&#x27;s card"');
  });

  test("starts and stops with the screen: it plays only while it is in view and not in a hidden tab", () => {
    const source = code(shared("ScannerLoop"));

    expect(source).toContain("new IntersectionObserver");
    expect(source).toMatch(/inView\s*&&\s*!video\.closest\("\[inert\]"\)[\s\S]{0,60}\.play\(\)[\s\S]{0,40}\.pause\(\)/);
    expect(source).toMatch(/new MutationObserver\(sync\)[\s\S]*attributeFilter:\s*\["inert"\]/);
    expect(source).toContain(".disconnect()");
  });

  test("the files are there and light: the webm within 600 KB, the mp4 within 900 KB, the posters small", () => {
    const size = (path: string) => (existsSync(join(VIDEOS, path)) ? statSync(join(VIDEOS, path)).size : Infinity);

    expect(size(SCANNER_LOOP.webm)).toBeLessThanOrEqual(600 * 1024);
    expect(size(SCANNER_LOOP.mp4)).toBeLessThanOrEqual(900 * 1024);
    expect(size(SCANNER_LOOP.first)).toBeLessThanOrEqual(60 * 1024);
    expect(size(SCANNER_LOOP.still)).toBeLessThanOrEqual(60 * 1024);
  });
});

describe("the phone before the video is wanted, and for a reader who asks for less motion", () => {
  const html = (still: boolean) => renderEn(<ScannerLoopPhone width={280} still={still} />);
  const ALT = 'alt="The Stampeo Scanner app adding a stamp to Sophie&#x27;s card"';

  test.each([
    ["as the page is served, before the phone is near the screen: the first frame", false, SCANNER_LOOP.first],
    ["for a reader who asks for less motion: the finished stamp", true, SCANNER_LOOP.still],
  ] as const)("%s, as a picture, with no video in the page", (_when, still, src) => {
    expect(html(still)).not.toContain("<video");
    expect(html(still)).not.toContain("<source");
    expect(html(still)).toContain(`src="${src}"`);
    expect(html(still)).toContain(ALT);
  });

  test("the video mounts only as the phone nears the screen, and a reader who asks for less motion gets the still", () => {
    const source = code(shared("ScannerLoop"));

    expect(source).toMatch(/new IntersectionObserver\([\s\S]*?setNear\(true\)[\s\S]*?rootMargin/);
    expect(source).toMatch(/const\s+reduced\s*=\s*usePrefersReducedMotion\(\)/);
    expect(findTag(source, "ScannerLoopPhone")?.attrs).toMatch(/\bstill=\{reduced\}/);
  });
});
