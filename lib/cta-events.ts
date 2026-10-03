import { isContactHref } from "./cta-taxonomy";
import { gaEventForCTA, type GaEvent } from "./google-analytics";
import { metaEventForCTA, type MetaStandardEvent } from "./meta-pixel";

export interface CtaClickEvents {
  /** PostHog's product event, picked by destination. */
  posthog: "landing_cta_clicked" | "landing_demo_cta_clicked";
  /** GA4's event, or null when the location is unmapped. */
  ga: GaEvent | null;
  /** Meta's standard event, or null when the location is unmapped. */
  meta: MetaStandardEvent | null;
}

/**
 * The events one CTA click sends, one per vendor.
 *
 * The destination decides the funnel for all three: a link to the contact
 * page is a sales touch, anything else a signup. `useCtaTracking` sends them.
 */
export function ctaClickEvents(input: {
  ctaLocation: string;
  href: string;
}): CtaClickEvents {
  return {
    posthog: isContactHref(input.href)
      ? "landing_demo_cta_clicked"
      : "landing_cta_clicked",
    ga: gaEventForCTA(input),
    meta: metaEventForCTA(input),
  };
}
