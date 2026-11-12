import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DeliverComposition } from "@/components/landing-pages/platform/DeliverComposition";
import { Hairline } from "@/components/landing-pages/platform/Hairline";
import { HowTable } from "@/components/landing-pages/platform/HowTable";
import { LpBlogPosts } from "@/components/landing-pages/platform/LpBlogPosts";
import { NumbersBlock } from "@/components/landing-pages/platform/NumbersBlock";
import { PlatformHero } from "@/components/landing-pages/platform/PlatformHero";
import { PlatformSection } from "@/components/landing-pages/platform/PlatformSection";
import { ProgramTypesSection } from "@/components/landing-pages/platform/ProgramTypesSection";
import { ShareTree } from "@/components/landing-pages/platform/ShareTree";
import { TypeMarquee } from "@/components/landing-pages/platform/TypeMarquee";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpAccentBand } from "@/components/landing-pages/shared/LpAccentBand";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { LpSectors } from "@/components/landing-pages/shared/LpSectors";
import { PricingSection } from "@/components/sections/PricingSection";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The US platform landing (a tour of the product, after passentry.com's
// homepage), served at /us/landing-pages/platform by the proxy's rewrite of
// /us/* to this route. English only, noindex.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform");
}

export default function PlatformPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="platform">
      <PlatformHero />
      <TypeMarquee />
      <DeliverComposition />
      <Hairline />
      <NumbersBlock />
      <Hairline />
      <HowTable />
      <LpDemo eyebrow={PLATFORM.demo.eyebrow} align="center" />
      <ProgramTypesSection />
      <PlatformSection />
      <ShareTree />
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpAccentBand />
      <LpSectors eyebrow={SHARED.sectorsEyebrow} />
      <LpBlogPosts />
    </LandingPageShell>
  );
}
