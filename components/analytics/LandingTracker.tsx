"use client";

import { useEffect } from "react";
import {
  trackLandingViewed,
  trackLandingSectionViewed,
  registerLandingVariant,
  unregisterLandingVariant,
} from "@/lib/analytics";

export function LandingTracker({
  locale,
  variant,
}: Readonly<{ locale: string; variant: string }>) {
  useEffect(() => {
    registerLandingVariant(variant);
    trackLandingViewed({ locale });

    // Publish the variant on <body> for consumers mounted in the LAYOUT, which
    // cannot receive it as a prop — `AttributionCapture` (STA-323) reads it so
    // ad spend can be attributed to the landing it actually bought. PostHog
    // gets it as a super-property above; this is the same fact, reachable from
    // outside the page tree.
    document.body.dataset.landingVariant = variant;

    const sections = document.querySelectorAll<HTMLElement>(
      "[data-landing-section]"
    );
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = (entry.target as HTMLElement).dataset.landingSection;
          if (!name || seen.has(name)) continue;
          seen.add(name);
          trackLandingSectionViewed({ locale, section: name });
        }
      },
      { threshold: 0.35 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      unregisterLandingVariant();
      delete document.body.dataset.landingVariant;
    };
  }, [locale, variant]);

  return null;
}
