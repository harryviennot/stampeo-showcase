import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpAccentBand } from "@/components/landing-pages/shared/LpAccentBand";
import { LpCtaPair } from "@/components/landing-pages/shared/LpCtaPair";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { LpSectors } from "@/components/landing-pages/shared/LpSectors";
import { PricingSection } from "@/components/sections/PricingSection";
import { splitAccent } from "@/lib/landing-pages/accent";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LANDING_PAGES, landingPageMetadata } from "@/lib/landing-pages/pages";

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
  const { hero } = LANDING_PAGES.platform;
  const { before, accent, after } = splitAccent(hero.h1, hero.accent);

  return (
    <LandingPageShell slug="platform">
      {/* TODO(STA-546 stage G4): the real hero (card fan, then the CTA pair), then marquee, deliver, numbers, how, demo, program_types, platform, share. */}
      <LpSection section="hero" padding="hero" className="text-center">
        <h1 className="text-hero mx-auto max-w-4xl text-balance">
          {before}
          <span className="text-[var(--accent)]">{accent}</span>
          {after}
        </h1>
        <div className="mt-8 flex justify-center">
          <LpCtaPair location="hero" />
        </div>
      </LpSection>
      <LpSection section="pricing" bare>
        <PricingSection market="us" />
      </LpSection>
      <LpAccentBand />
      <LpSectors eyebrow={SHARED.sectorsEyebrow} />
      {/* TODO(STA-546 stage G4): the blog strip closes the page. */}
    </LandingPageShell>
  );
}
