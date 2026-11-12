import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { LpFinalCta } from "@/components/landing-pages/shared/LpFinalCta";
import { LpHero } from "@/components/landing-pages/shared/LpHero";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The US features landing, served at /us/landing-pages/features by the
// proxy's rewrite of /us/* to this route. English only, noindex.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("features");
}

export default function FeaturesPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="features">
      {/* TODO(STA-546 stage B): the hero visual, then demo, spotlight_messages,
          spotlight_design and spotlight_analytics, in the registry's order. */}
      <LpHero slug="features" />
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpFaq />
      <LpFinalCta slug="features" />
    </LandingPageShell>
  );
}
