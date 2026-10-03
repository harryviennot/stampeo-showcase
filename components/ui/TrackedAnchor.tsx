"use client";

import type { ComponentProps } from "react";
import type { CTALocation } from "@/lib/analytics";
import { trackThen } from "@/lib/cta/events";
import { useCtaTracking } from "@/hooks/use-cta-tracking";

type TrackedAnchorProps = ComponentProps<"a"> & {
  href: string;
  /** Where the link sits; sent with the click to PostHog, GA4 and Meta. */
  trackAs: CTALocation;
};

/**
 * A plain `<a>` to the signup or contact page that reports its click, for an
 * href that already carries its locale (a markdown link in a blog post), which
 * the locale-prefixing `Link` would prefix twice. Renders exactly the `<a>` it
 * replaces; the caller's own `onClick` still runs.
 */
export function TrackedAnchor({ trackAs, href, onClick, ...props }: TrackedAnchorProps) {
  const track = useCtaTracking(trackAs, href);

  return <a {...props} href={href} onClick={trackThen(track, onClick)} />;
}
