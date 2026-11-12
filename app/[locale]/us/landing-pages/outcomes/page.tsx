import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { LpFinalCta } from "@/components/landing-pages/shared/LpFinalCta";
import { AlwaysSpotlight } from "@/components/landing-pages/outcomes/AlwaysSpotlight";
import { HeadStartSpotlight } from "@/components/landing-pages/outcomes/HeadStartSpotlight";
import { LevelsSpotlight } from "@/components/landing-pages/outcomes/LevelsSpotlight";
import { QuietHoursSpotlight } from "@/components/landing-pages/outcomes/QuietHoursSpotlight";
import { RegularsFigure } from "@/components/landing-pages/outcomes/RegularsFigure";
import { RegularsSpotlight } from "@/components/landing-pages/outcomes/RegularsSpotlight";
import { LpHero } from "@/components/landing-pages/shared/LpHero";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { LpSectors } from "@/components/landing-pages/shared/LpSectors";
import { PricingSection } from "@/components/sections/PricingSection";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The US outcomes landing page: English only, noindex, rewritten from /us/landing-pages/outcomes.
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
      <LpHero slug="outcomes" />
      <RegularsFigure />
      <AlwaysSpotlight />
      <HeadStartSpotlight />
      <QuietHoursSpotlight />
      <LevelsSpotlight />
      <RegularsSpotlight />
      <LpSectors />
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpFaq />
      <LpFinalCta slug="outcomes" />
    </LandingPageShell>
  );
}
