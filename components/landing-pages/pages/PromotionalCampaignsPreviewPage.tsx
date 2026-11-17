import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { HeroLockScreen } from "@/components/landing-pages/feature-previews/HeroLockScreen";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { HowSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/HowSection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { TextingSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/TextingSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";
import { faqPageJsonLd } from "@/lib/structured-data";

/** The campaigns preview: one message written once, on every customer's card. */
export async function PromotionalCampaignsPreviewPage({ market }: Readonly<{ market: Market }>) {
  const copy = landingCopy(await getLocale(), market).previews.promotionalCampaigns.PROMOTIONAL_CAMPAIGNS_PREVIEW;

  return (
    <LandingPageShell slug="platform/promotional-campaigns" market={market}>
      <JsonLd data={faqPageJsonLd([...copy.faq.items])} />
      <PreviewHero
        slug="platform/promotional-campaigns"
        market={market}
        secondary={{ label: copy.hero.secondary, href: "#how" }}
        visual={<HeroLockScreen alt={copy.hero.alt} notification={shopBanner(copy.heroBanner)} />}
      />
      <HowSection />
      <TextingSection />
      <IdeasSection />
      <DeliverySection />
      <LpFaq faq={copy.faq} answerLink={{ words: copy.faq.pricingLink, href: "/pricing", market }} />
      <LpAccentBand copy={copy.band} />
      <RelatedPreviews slug="platform/promotional-campaigns" />
    </LandingPageShell>
  );
}
