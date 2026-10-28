import type { BrowserContextOptions } from "playwright-core";

export type Device = "phone" | "desktop";

/** Phone 402x874 (an iPhone 17 Pro screen) and desktop 1280x900, both at 2x. */
export const DEVICES: Record<Device, BrowserContextOptions> = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "en-US" },
  desktop: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, locale: "en-US" },
};
