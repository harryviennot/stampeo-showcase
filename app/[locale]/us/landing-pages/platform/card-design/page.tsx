import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AnatomySection } from "@/components/landing-pages/feature-previews/card-design/AnatomySection";
import { DesignFigures } from "@/components/landing-pages/feature-previews/card-design/DesignFigures";
import { DesignerSection } from "@/components/landing-pages/feature-previews/card-design/DesignerSection";
import { IconsStrip } from "@/components/landing-pages/feature-previews/card-design/IconsStrip";
import { StampStyleRows } from "@/components/landing-pages/feature-previews/card-design/StampStyleRows";
import { WalletsSection } from "@/components/landing-pages/feature-previews/card-design/WalletsSection";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { Hairline } from "@/components/landing-pages/platform/Hairline";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { PlatformHero } from "@/components/landing-pages/platform/PlatformHero";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
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
      <IconsStrip />
      <DesignerSection />
      <AnatomySection />
      <Hairline />
      <DesignFigures />
      <Hairline />
      <StampStyleRows />
      <WalletsSection />
      <LpFaq faq={CARD_DESIGN_PREVIEW.faq} />
      <LpAccentBand copy={CARD_DESIGN_PREVIEW.band} />
      <RelatedPreviews slug="platform/card-design" />
    </LandingPageShell>
  );
}
