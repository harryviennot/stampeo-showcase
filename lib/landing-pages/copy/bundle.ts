import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import * as platform from "./platform";
import * as analytics from "./previews/analytics";
import * as cardDesign from "./previews/card-design";
import * as geolocation from "./previews/geolocation";
import * as loyaltyPrograms from "./previews/loyalty-programs";
import * as mobileScanner from "./previews/mobile-scanner";
import * as promotionalCampaigns from "./previews/promotional-campaigns";
import * as pushNotifications from "./previews/push-notifications";
import * as previewShared from "./previews/shared";
import * as programTypes from "./program-types";
import * as shared from "./shared";
import type { Widen } from "./widen";

/**
 * Every word of the Platform page and its previews in English, grouped as the modules are: a component takes
 * the names it used to import, `const { PLATFORM } = useLandingCopy().platform`.
 */
export const EN = {
  platform,
  programTypes,
  shared,
  previews: {
    shared: previewShared,
    analytics,
    cardDesign,
    geolocation,
    loyaltyPrograms,
    mobileScanner,
    promotionalCampaigns,
    pushNotifications,
  },
} as const;

/** The same words in another language: the English shape, every word a string of its own. */
export type LandingCopy = Widen<typeof EN>;

const BUNDLES: Record<Locale, LandingCopy> = { en: EN, fr: EN, es: EN, pl: EN };

/** The copy of a locale; a locale the site does not serve reads English. */
export function landingCopy(locale: string): LandingCopy {
  return BUNDLES[locale as Locale] ?? EN;
}

/** The copy of the locale being rendered. */
export function useLandingCopy(): LandingCopy {
  return landingCopy(useLocale());
}
