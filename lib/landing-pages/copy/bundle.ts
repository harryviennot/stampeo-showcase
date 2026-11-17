import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { Market } from "@/lib/markets";
import { ES } from "./es";
import { FR } from "./fr";
import { PL } from "./pl";
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
import { US_WORDS } from "./us";
import { overlaid, type Widen } from "./widen";

/**
 * Every word of the Platform page and its previews in English, grouped as the modules are:
 * `const { PLATFORM } = useLandingCopy().platform`.
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

const BUNDLES: Record<Locale, LandingCopy> = { en: EN, fr: FR, es: ES, pl: PL };

/** The English of the US market: the international English with `US_WORDS` laid over it. */
const EN_US = overlaid<LandingCopy>(EN, US_WORDS);

/**
 * The copy of a locale; a locale the site does not serve reads English. The US market's English is the only
 * copy that depends on the market: pass the page's `market` wherever a word it overrides is rendered.
 */
export function landingCopy(locale: string, market: Market = "int"): LandingCopy {
  if (locale === "en" && market === "us") return EN_US;
  return BUNDLES[locale as Locale] ?? EN;
}

/** The copy of the locale being rendered, in the page's market. */
export function useLandingCopy(market: Market = "int"): LandingCopy {
  return landingCopy(useLocale(), market);
}
