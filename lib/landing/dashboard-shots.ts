import type { Locale } from "@/i18n/routing";
import type { TierId } from "@/lib/pricing";

/**
 * Real captures of the dashboard's Analytics page, per locale: the top of
 * the page (the landing's desktop and phone) and two phone views scrolled to
 * a card pair (the Analytics feature page's hero and busiest row).
 * They come from promo-videos `tools/screens/landing-shots.ts` (dev fixture
 * Aurevo, Growth); re-shoot them with that command, never by hand. The sizes
 * are the files' real pixel sizes, checked by `dashboard-shots.test.ts`.
 */
/** The plan the captured business is on; the section's plan line names it first. */
export const CAPTURE_PLAN: TierId = "growth";

const PHONE = { width: 1206, height: 2622 };

export const SHOT_SIZES = {
  desktop: { width: 2560, height: 1600 },
  phone: PHONE,
  "phone-habits": PHONE,
  "phone-busiest": PHONE,
} as const;

export type ShotView = keyof typeof SHOT_SIZES;

export interface LandingShot {
  src: string;
  width: number;
  height: number;
}

export function landingShot(locale: Locale, view: ShotView): LandingShot {
  return { src: `/images/landing/dashboard/${locale}-${view}.png`, ...SHOT_SIZES[view] };
}
