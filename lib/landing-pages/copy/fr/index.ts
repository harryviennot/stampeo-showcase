import type { LandingCopy } from "../bundle";
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

/** Every word of the Platform page and its previews in French, grouped as `EN` is. */
export const FR = {
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
} satisfies LandingCopy;
