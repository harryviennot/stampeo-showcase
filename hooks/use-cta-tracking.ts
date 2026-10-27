"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  trackLandingCTAClicked,
  trackLandingDemoCTAClicked,
  type CTALocation,
} from "@/lib/analytics";
import { ctaClick } from "@/lib/cta/events";
import { trackGaEvent } from "@/lib/google-analytics";
import { trackMetaEvent } from "@/lib/meta-pixel";

/**
 * The click handler for a signup or contact CTA: sends what `ctaClick`
 * decides to PostHog, GA4 and Meta.
 *
 * Each tag sends only when it loaded (which needs consent) AND the current
 * page allows its kind: the same click on a private route reaches neither GA4
 * nor Meta, and on the help center reaches GA4 only. `usePathname` from
 * `next/navigation` gives the browser path the route predicates expect, not
 * the locale-stripped one.
 */
export function useCtaTracking(trackAs: CTALocation, href: string): () => void {
  const locale = useLocale();
  const pathname = usePathname();

  return () => {
    const click = ctaClick({ ctaLocation: trackAs, href, pathname, locale });

    if (click.posthog.event === "landing_demo_cta_clicked") {
      trackLandingDemoCTAClicked(click.posthog.props);
    } else {
      trackLandingCTAClicked(click.posthog.props);
    }

    if (click.meta) {
      trackMetaEvent({
        event: click.meta.event,
        trackable: click.allowed.advertising,
        params: click.meta.params,
      });
    }

    if (click.ga) {
      trackGaEvent({
        event: click.ga.event,
        trackable: click.allowed.analytics,
        params: click.ga.params,
      });
    }
  };
}
