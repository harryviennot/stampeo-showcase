import type { CTALocation } from "../analytics";
import { isTrackablePath } from "../consent-routes";
import { gaEventForCTA, type GaEvent } from "../google-analytics";
import { metaEventForCTA, type MetaStandardEvent } from "../meta-pixel";
import { isContactHref } from "./taxonomy";

/** The context every vendor receives with a CTA click. */
type CtaContext = {
  locale: string;
  cta_location: CTALocation;
  href: string;
};

export interface CtaClick {
  /** PostHog's product event, picked by destination. */
  posthog: {
    event: "landing_cta_clicked" | "landing_demo_cta_clicked";
    props: CtaContext;
  };
  /** GA4's event, or null when the location is unmapped. */
  ga: { event: GaEvent; params: CtaContext } | null;
  /** Meta's standard event, or null when the location is unmapped. */
  meta: MetaStandardEvent | null;
  /** May the ad platforms hear about a click on this page at all? */
  trackable: boolean;
}

/**
 * What one CTA click sends, one entry per vendor.
 *
 * The destination decides the funnel for all three: a link to the contact
 * page is a sales touch, anything else a signup. `pathname` is the browser
 * path the click happened on; on a private route the ad platforms hear
 * nothing, while PostHog, which stores nothing on the device, still does.
 * `useCtaTracking` sends the result.
 */
export function ctaClick(input: {
  ctaLocation: CTALocation;
  href: string;
  pathname: string;
  locale: string;
}): CtaClick {
  const context: CtaContext = {
    locale: input.locale,
    cta_location: input.ctaLocation,
    href: input.href,
  };
  const ga = gaEventForCTA(input);

  return {
    posthog: {
      event: isContactHref(input.href) ? "landing_demo_cta_clicked" : "landing_cta_clicked",
      props: context,
    },
    // GA4 reports on custom dimensions rather than the event name alone, so
    // the CTA context travels as parameters.
    ga: ga ? { event: ga, params: context } : null,
    meta: metaEventForCTA(input),
    trackable: isTrackablePath(input.pathname),
  };
}

/**
 * A tracked link's click handler: report the click, then run the link's own
 * `onClick` (the mobile header closes its menu with it).
 *
 * A tracking failure is swallowed so it can never cost the visitor the click.
 */
export function trackThen<E>(
  track: () => void,
  onClick?: (event: E) => void,
): (event: E) => void {
  return (event) => {
    try {
      track();
    } catch {
      // Losing the measurement is the acceptable failure; losing the click is not.
    }
    onClick?.(event);
  };
}
