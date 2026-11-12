import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OutcomesHeroVisual } from "@/components/landing-pages/outcomes/OutcomesHeroVisual";
import { RegularsFigure } from "@/components/landing-pages/outcomes/RegularsFigure";
import { RegularsSpotlight } from "@/components/landing-pages/outcomes/RegularsSpotlight";
import { ReturnSpotlight } from "@/components/landing-pages/outcomes/ReturnSpotlight";
import { SlowDaysSpotlight } from "@/components/landing-pages/outcomes/SlowDaysSpotlight";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { LpFinalCta } from "@/components/landing-pages/shared/LpFinalCta";
import { LpHero } from "@/components/landing-pages/shared/LpHero";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The US outcomes landing, served at /us/landing-pages/outcomes by the
// proxy's rewrite of /us/* to this route. English only, noindex.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("outcomes");
}

export default function OutcomesPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="outcomes">
      <LpHero slug="outcomes" visual={<OutcomesHeroVisual />} crop />
      <RegularsFigure />
      <ReturnSpotlight />
      <SlowDaysSpotlight />
      <RegularsSpotlight />
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpFaq />
      <LpFinalCta slug="outcomes" />
    </LandingPageShell>
  );
}
