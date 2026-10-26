import type { Locale } from "@/i18n/routing";

/**
 * The real Analytics captures under the landing hero, one pair per locale.
 * They come from promo-videos `tools/screens/landing-shots.ts` (dev fixture
 * Aurevo, Growth); re-shoot them with that command, never by hand. The sizes
 * are the files' real pixel sizes, checked by `landing-shots.test.ts`, so
 * next/image reserves the right box and nothing shifts while they load.
 */
export const SHOT_SIZES = {
  desktop: { width: 2560, height: 1600 },
  phone: { width: 1206, height: 2622 },
} as const;

export type ShotSize = keyof typeof SHOT_SIZES;

export interface LandingShot {
  src: string;
  width: number;
  height: number;
}

export function landingShot(locale: Locale, size: ShotSize): LandingShot {
  return { src: `/images/landing/dashboard/${locale}-${size}.png`, ...SHOT_SIZES[size] };
}
