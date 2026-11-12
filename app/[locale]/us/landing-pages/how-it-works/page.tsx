import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CreateStep } from "@/components/landing-pages/how-it-works/CreateStep";
import { FirstDayTimeline } from "@/components/landing-pages/how-it-works/FirstDayTimeline";
import { SeeItWork } from "@/components/landing-pages/how-it-works/SeeItWork";
import { ShareStep } from "@/components/landing-pages/how-it-works/ShareStep";
import { StampStep } from "@/components/landing-pages/how-it-works/StampStep";
import { StepsOverview } from "@/components/landing-pages/how-it-works/StepsOverview";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { LpFinalCta } from "@/components/landing-pages/shared/LpFinalCta";
import { LpHero } from "@/components/landing-pages/shared/LpHero";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { LpSectors } from "@/components/landing-pages/shared/LpSectors";
import { PricingSection } from "@/components/sections/PricingSection";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The US how-to landing page: English only, noindex, rewritten from /us/landing-pages/how-it-works.
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
      <LpHero slug="how-it-works" />
      <StepsOverview />
      <CreateStep />
      <ShareStep />
      <StampStep />
      <LpDemo />
      <SeeItWork />
      <LpSectors />
      <FirstDayTimeline />
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpFaq />
      <LpFinalCta slug="how-it-works" />
    </LandingPageShell>
  );
}
