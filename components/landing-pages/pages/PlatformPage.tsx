import { getLocale } from "next-intl/server";
import { BlogPostsSection } from "@/components/landing-pages/platform/BlogPostsSection";
import { DeliverComposition } from "@/components/landing-pages/platform/DeliverComposition";
import { Hairline } from "@/components/landing-pages/platform/Hairline";
import { HowTable } from "@/components/landing-pages/platform/HowTable";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { NumbersBlock } from "@/components/landing-pages/platform/NumbersBlock";
import { PlatformHero } from "@/components/landing-pages/platform/hero/PlatformHero";
import { PlatformSection } from "@/components/landing-pages/platform/PlatformSection";
import { ProgramTypeRowsSection } from "@/components/landing-pages/platform/ProgramTypeRowsSection";
import { ShareTree } from "@/components/landing-pages/platform/ShareTree";
import { TypeMarquee } from "@/components/landing-pages/platform/TypeMarquee";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { LpSectors } from "@/components/landing-pages/shared/LpSectors";
import { PricingSection } from "@/components/sections/PricingSection";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";

/** The Platform landing page, a tour of the product: served in every language (`int`) and in US English (`us`). */
export async function PlatformPage({ market }: Readonly<{ market: Market }>) {
  const { platform, shared } = landingCopy(await getLocale(), market);

  return (
    <LandingPageShell slug="platform" market={market}>
      <PlatformHero market={market} />
      <TypeMarquee />
      <DeliverComposition />
      <Hairline />
      <NumbersBlock />
      <Hairline />
      <HowTable />
      <LpDemo eyebrow={platform.PLATFORM.demo.eyebrow} align="center" />
      <ProgramTypeRowsSection market={market} />
      <PlatformSection />
      <ShareTree />
      <LpSection section="pricing" bare>
        <PricingSection market={market} />
      </LpSection>
      <LpAccentBand />
      <LpSectors eyebrow={shared.SHARED.sectorsEyebrow} market={market} />
      <BlogPostsSection />
    </LandingPageShell>
  );
}
