"use client";

import { useEffect } from "react";
import { trackLandingViewed, trackLandingSectionViewed } from "@/lib/analytics";

export function LandingTracker({ locale }: Readonly<{ locale: string }>) {
  useEffect(() => {
    trackLandingViewed({ locale });

    const sections = document.querySelectorAll<HTMLElement>(
      "[data-landing-section]"
    );
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = entry.target.getAttribute("data-landing-section");
          if (!name || seen.has(name)) continue;
          seen.add(name);
          trackLandingSectionViewed({ locale, section: name });
        }
      },
      { threshold: 0.35 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
