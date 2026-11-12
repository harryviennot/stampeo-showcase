import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { PlatformHero } from "@/components/landing-pages/platform/PlatformHero";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { CARD_DESIGN_FAN_SLOTS } from "@/lib/hero-fan";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The card design preview of /en/features/card-design: English only, noindex, in Platform's style.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/card-design");
}

export default function CardDesignPreviewPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="platform/card-design">
      <PlatformHero
        slug="platform/card-design"
        slots={CARD_DESIGN_FAN_SLOTS}
        secondary={{ label: CARD_DESIGN_PREVIEW.designerLink, href: "#playground" }}
      />
      {/* TODO(STA-552 builder): icons, playground, anatomy, numbers, stamps, wallets, faq (ux-brief, page A). */}
      <LpAccentBand copy={CARD_DESIGN_PREVIEW.band} />
      <RelatedPreviews slug="platform/card-design" />
    </LandingPageShell>
  );
}
