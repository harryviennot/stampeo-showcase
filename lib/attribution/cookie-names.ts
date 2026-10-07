/**
 * The names of the attribution carrier cookies. A leaf module, so the consent
 * gate, the privacy route and the carriers can all import them without a cycle.
 */

/** Campaign source and landing, either consent category. */
export const SOURCE_COOKIE = "stampeo_src";
/** GA client and session ids, analytics. */
export const GA_COOKIE = "stampeo_ga";
/** The paid click, marketing. */
export const AD_COOKIE = "stampeo_ad";
/** The version-1 carrier: still read and forwarded, never written. */
export const LEGACY_ATTRIBUTION_COOKIE = "stampeo_attribution";
