import type { Locale } from "@/i18n/routing";
import { IPHONE } from "@/lib/devices/iphone";

/**
 * The Scanner loop: an 8-second recording of the Scanner app adding a stamp to
 * Sophie's Aurevo card, rendered per locale. This module has no `"use client"`
 * so server components can read it (a value imported from a client module is a
 * reference there, not the value).
 */

/** The locales the loop has been rendered in; every other locale plays the English render. */
export const SCANNER_LOOP_LOCALES: readonly Locale[] = ["en", "fr", "es", "pl"];

const FALLBACK: Locale = "en";
const FOLDER = "/videos/scanner-loop";

/**
 * The loop's files in `public/` for `locale`: its own render when `rendered`
 * lists it, the English render otherwise.
 */
export function scannerLoopFiles(locale: string, rendered: readonly string[] = SCANNER_LOOP_LOCALES) {
  const name = rendered.includes(locale) ? locale : FALLBACK;
  return {
    webm: `${FOLDER}/${name}.webm`,
    mp4: `${FOLDER}/${name}.mp4`,
    /** The poster while the video loads: its first frame. */
    first: `${FOLDER}/${name}-first.webp`,
    /** What a reader who asks for less motion sees: the success frame the loop ends on. */
    still: `${FOLDER}/${name}-poster.webp`,
  };
}

export type ScannerLoopFiles = ReturnType<typeof scannerLoopFiles>;

export const SCANNER_LOOP = {
  /** The screen's 402×874 pt at 2×. */
  width: IPHONE.screen.width * 2,
  height: IPHONE.screen.height * 2,
  /** The stamp count on the success frame, of 8. */
  stamps: 5,
} as const;
