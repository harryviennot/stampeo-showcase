"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import type { CTALocation } from "@/lib/analytics";
import { trackThen } from "@/lib/cta/events";
import { useCtaTracking } from "@/hooks/use-cta-tracking";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  href: string;
  /** Where the link sits; sent with the click to PostHog, GA4 and Meta. */
  trackAs: CTALocation;
};

/**
 * A `Link` to the signup or contact page that reports its click. Renders
 * exactly the `Link` it replaces; the caller's own `onClick` still runs.
 */
export function TrackedLink({ trackAs, href, onClick, ...props }: TrackedLinkProps) {
  const track = useCtaTracking(trackAs, href);

  return <Link {...props} href={href} onClick={trackThen(track, onClick)} />;
}
