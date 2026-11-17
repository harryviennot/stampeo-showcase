import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { AnatomySection } from "@/components/landing-pages/feature-previews/card-design/AnatomySection";
import { IconsSection } from "@/components/landing-pages/feature-previews/card-design/IconsSection";
import { ReskinHero } from "@/components/landing-pages/feature-previews/card-design/ReskinHero";
import { TypesSection } from "@/components/landing-pages/feature-previews/card-design/TypesSection";
import { WalletsSection } from "@/components/landing-pages/feature-previews/card-design/WalletsSection";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";
import { faqPageJsonLd } from "@/lib/structured-data";

/** The card design preview: can the card look like my shop, and what can I change on it. */
export async function CardDesignPreviewPage({ market }: Readonly<{ market: Market }>) {
  const { CARD_DESIGN_PREVIEW: copy } = landingCopy(await getLocale(), market).previews.cardDesign;

  return (
    <LandingPageShell slug="platform/card-design" market={market}>
      <JsonLd data={faqPageJsonLd([...copy.faq.items])} />
      <ReskinHero market={market} />
      <AnatomySection />
      <TypesSection />
      <IconsSection />
      <WalletsSection />
      <LpFaq faq={copy.faq} />
      <LpAccentBand copy={copy.band} />
      <RelatedPreviews slug="platform/card-design" />
    </LandingPageShell>
  );
}
