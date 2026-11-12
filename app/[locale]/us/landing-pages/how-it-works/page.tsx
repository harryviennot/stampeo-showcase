import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HowHeroVisual } from "@/components/landing-pages/how-it-works/HowHeroVisual";
import { HowSteps } from "@/components/landing-pages/how-it-works/HowSteps";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { LpFinalCta } from "@/components/landing-pages/shared/LpFinalCta";
import { LpHero } from "@/components/landing-pages/shared/LpHero";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The US how-to landing, served at /us/landing-pages/how-it-works by the
// proxy's rewrite of /us/* to this route. English only, noindex.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("how-it-works");
}

export default function HowItWorksPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="how-it-works">
      <LpHero slug="how-it-works" visual={<HowHeroVisual />} crop />
      <HowSteps />
      <LpDemo />
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpFaq />
      <LpFinalCta slug="how-it-works" />
    </LandingPageShell>
  );
}
