"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  trackLandingCTAClicked,
  trackLandingDemoCTAClicked,
  type CTALocation,
} from "@/lib/analytics";
import { isTrackablePath } from "@/lib/consent-routes";
import { ctaClickEvents } from "@/lib/cta-events";
import { trackGaEvent } from "@/lib/google-analytics";
import { trackMetaEvent } from "@/lib/meta-pixel";

/**
 * The click handler for a signup or contact CTA: PostHog, GA4 and Meta, each
 * carrying the CTA's location.
 *
 * The ad platforms send only when their tag loaded (which needs consent) AND
 * the current page is trackable, so the same click on a private route reaches
 * neither. `usePathname` from `next/navigation` gives the browser path that
 * `isTrackablePath` expects, not the locale-stripped one.
 */
export function useCtaTracking(trackAs: CTALocation, href: string): () => void {
  const locale = useLocale();
  const pathname = usePathname();

  return () => {
    const events = ctaClickEvents({ ctaLocation: trackAs, href });

    const props = { locale, cta_location: trackAs, href };
    if (events.posthog === "landing_demo_cta_clicked") {
      trackLandingDemoCTAClicked(props);
    } else {
      trackLandingCTAClicked(props);
    }

    const trackable = isTrackablePath(pathname);

    if (events.meta) {
      trackMetaEvent({ event: events.meta, trackable });
    }

    // GA4 reports on custom dimensions rather than the event name alone, so
    // the CTA context travels as parameters.
    if (events.ga) {
      trackGaEvent({
        event: events.ga,
        trackable,
        params: { cta_location: trackAs, locale, href },
      });
    }
  };
}
