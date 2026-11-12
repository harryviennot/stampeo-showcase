import { IPHONE } from "@/lib/devices/iphone";

/**
 * The Scanner loop's files, in `public/`, and what it shows. This module has no
 * `"use client"` so server components can read it (a value imported from a
 * client module is a reference there, not the value).
 */
export const SCANNER_LOOP = {
  webm: "/videos/landing/scanner-loop.webm",
  mp4: "/videos/landing/scanner-loop.mp4",
  /** The poster while the video loads: its first frame. */
  first: "/videos/landing/scanner-loop-first.webp",
  /** What a reader who asks for less motion sees: the success frame the loop ends on. */
  still: "/videos/landing/scanner-loop-poster.webp",
  /** The screen's 402×874 pt at 2×. */
  width: IPHONE.screen.width * 2,
  height: IPHONE.screen.height * 2,
  /** The stamp count on the success frame, of 8. */
  stamps: 5,
  label: "The Stampeo Scanner app adding a stamp to Sophie's card",
} as const;
