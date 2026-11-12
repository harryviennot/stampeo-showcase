/**
 * The Scanner loop: the 8-second video of the Scanner app adding a stamp, on
 * the scanner feature page and the landing pages. A locale plays its own render
 * once it is listed and the English one until then; the video ships in two
 * formats with a first-frame poster, and a reader who asks for less motion gets
 * the finished-stamp still instead.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { LoopVideo, ScannerLoop, ScannerLoopPhone } from "@/components/ui/ScannerLoop";
import { routing } from "@/i18n/routing";
import { loadCatalog } from "../testing/catalogs";
import { ROOT, code, findTag, read } from "../testing/jsx-source";
import { renderEn, renderIn } from "../testing/render-en";
import { SCANNER_LOOP, SCANNER_LOOP_LOCALES, scannerLoopFiles } from "./scanner-loop";

const PUBLIC = join(ROOT, "public");
const COMPONENT = join(ROOT, "components/ui/ScannerLoop.tsx");
const EN = scannerLoopFiles("en");
const EN_LABEL = "The Stampeo Scanner app adding a stamp to Sophie's card";

/** The loop's description in a locale's catalog, escaped as React prints it in an attribute. */
const label = (locale: string): string => loadCatalog(locale).common.scannerLoop.label;
const attr = (text: string) => text.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");

describe("which render a locale plays", () => {
  test("English plays its own files, from public/videos/scanner-loop/", () => {
    expect(EN).toEqual({
      webm: "/videos/scanner-loop/en.webm",
      mp4: "/videos/scanner-loop/en.mp4",
      first: "/videos/scanner-loop/en-first.webp",
      still: "/videos/scanner-loop/en-poster.webp",
    });
  });

  test("a locale plays its own render once it is listed", () => {
    expect(scannerLoopFiles("fr", ["en", "fr"])).toEqual({
      webm: "/videos/scanner-loop/fr.webm",
      mp4: "/videos/scanner-loop/fr.mp4",
      first: "/videos/scanner-loop/fr-first.webp",
      still: "/videos/scanner-loop/fr-poster.webp",
    });
  });

  test.each(["fr", "es", "pl", "de"])("%s, with no render of its own, plays the English one", (locale) => {
    expect(scannerLoopFiles(locale, ["en"])).toEqual(EN);
  });

  test("English is listed, as the render every other locale falls back to, and every listed locale is one the site serves", () => {
    expect(SCANNER_LOOP_LOCALES).toContain("en");
    for (const locale of SCANNER_LOOP_LOCALES) expect(routing.locales as readonly string[]).toContain(locale);
  });

  test.each(SCANNER_LOOP_LOCALES)(
    "%s: its four files are there and light: the webm within 600 KB, the mp4 within 900 KB, the frames within 60 KB",
    (locale) => {
      const files = scannerLoopFiles(locale);
      const size = (path: string) => (existsSync(join(PUBLIC, path)) ? statSync(join(PUBLIC, path)).size : Infinity);

      expect(size(files.webm)).toBeLessThanOrEqual(600 * 1024);
      expect(size(files.mp4)).toBeLessThanOrEqual(900 * 1024);
      expect(size(files.first)).toBeLessThanOrEqual(60 * 1024);
      expect(size(files.still)).toBeLessThanOrEqual(60 * 1024);
    },
  );

  test("the constants live in a module that is not a client module, so server components read the values", () => {
    expect(read(join(ROOT, "lib/videos/scanner-loop.ts"))).not.toMatch(/^\s*["']use client["']/);
  });
});

describe("the loop on a page, in the page's locale", () => {
  test("in English it says what it shows", () => {
    expect(label("en")).toBe(EN_LABEL);
  });

  test.each(routing.locales)("%s: the first frame of the locale's render, described in the page's language", (locale) => {
    const html = renderIn(locale, <ScannerLoop />);

    expect(html).toContain(`src="${scannerLoopFiles(locale).first}"`);
    expect(html).toContain(`alt="${attr(label(locale))}"`);
    if (locale !== "en") expect(label(locale)).not.toBe(EN_LABEL);
  });

  test("in a page's hero the first frame is fetched first; anywhere else it waits its turn", () => {
    const frame = (html: string) => html.match(/<img\b[^>]*\bsrc="\/videos\/scanner-loop\/[^"]*"[^>]*>/)?.[0] ?? "";

    expect(frame(renderEn(<ScannerLoop eager />))).toContain('fetchPriority="high"');
    expect(frame(renderEn(<ScannerLoop eager />))).toContain('loading="eager"');
    expect(frame(renderEn(<ScannerLoop />))).not.toContain('fetchPriority="high"');
    expect(frame(renderEn(<ScannerLoop />))).toContain('loading="lazy"');
  });
});

describe("the video", () => {
  const html = () => renderEn(<LoopVideo files={EN} label={EN_LABEL} />);
  const video = () => html().match(/<video\b[^>]*>/)?.[0] ?? "";
  const has = (name: string) => new RegExp(`\\s${name}(?:=|\\s|/|>)`, "i").test(video());

  test("plays muted, looping and inline, and fetches only its metadata until it is in view", () => {
    for (const name of ["muted", "loop", "playsinline"]) expect({ name, has: has(name) }).toEqual({ name, has: true });
    expect(video()).toContain('preload="metadata"');
  });

  test("offers the webm, then the mp4, with the first frame as its poster", () => {
    const sources = [...html().matchAll(/<source\b[^>]*>/g)].map((match) => match[0]);

    expect(sources).toHaveLength(2);
    expect(sources[0]).toContain(`src="${EN.webm}"`);
    expect(sources[0]).toContain('type="video/webm"');
    expect(sources[1]).toContain(`src="${EN.mp4}"`);
    expect(sources[1]).toContain('type="video/mp4"');
    expect(video()).toContain(`poster="${EN.first}"`);
  });

  test("keeps its size so nothing shifts, and says what it shows", () => {
    expect(video()).toContain(`width="${SCANNER_LOOP.width}"`);
    expect(video()).toContain(`height="${SCANNER_LOOP.height}"`);
    expect(video()).toContain(`aria-label="${attr(EN_LABEL)}"`);
  });

  test("starts and stops with the screen: it plays only while it is in view and not in a hidden tab", () => {
    const source = code(COMPONENT);

    expect(source).toContain("new IntersectionObserver");
    expect(source).toMatch(/inView\s*&&\s*!video\.closest\("\[inert\]"\)[\s\S]{0,60}\.play\(\)[\s\S]{0,40}\.pause\(\)/);
    expect(source).toMatch(/new MutationObserver\(sync\)[\s\S]*attributeFilter:\s*\["inert"\]/);
    expect(source).toContain(".disconnect()");
  });
});

describe("the phone before the video is wanted, and for a reader who asks for less motion", () => {
  const html = (still: boolean) => renderEn(<ScannerLoopPhone width={280} still={still} files={EN} label={EN_LABEL} />);

  test.each([
    ["as the page is served, before the phone is near the screen: the first frame", false, EN.first],
    ["for a reader who asks for less motion: the finished stamp", true, EN.still],
  ] as const)("%s, as a picture, with no video in the page", (_when, still, src) => {
    expect(html(still)).not.toContain("<video");
    expect(html(still)).not.toContain("<source");
    expect(html(still)).toContain(`src="${src}"`);
    expect(html(still)).toContain(`alt="${attr(EN_LABEL)}"`);
  });

  test("the video mounts only as the phone nears the screen, and a reader who asks for less motion gets the still", () => {
    const source = code(COMPONENT);

    expect(source).toMatch(/new IntersectionObserver\([\s\S]*?setNear\(true\)[\s\S]*?rootMargin/);
    expect(source).toMatch(/const\s+reduced\s*=\s*usePrefersReducedMotion\(\)/);
    expect(findTag(source, "ScannerLoopPhone")?.attrs).toMatch(/\bstill=\{reduced\}/);
  });
});
