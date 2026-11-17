import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { LevelsSection } from "@/components/landing-pages/feature-previews/loyalty-programs/LevelsSection";
import { MomentsSection } from "@/components/landing-pages/feature-previews/loyalty-programs/MomentsSection";
import { MoveUpSection } from "@/components/landing-pages/feature-previews/loyalty-programs/MoveUpSection";
import { PickerSection } from "@/components/landing-pages/feature-previews/loyalty-programs/PickerSection";
import { ProgramFan } from "@/components/landing-pages/feature-previews/loyalty-programs/ProgramFan";
import { ProgramsSection } from "@/components/landing-pages/feature-previews/loyalty-programs/ProgramsSection";
import { SectorsSection } from "@/components/landing-pages/feature-previews/loyalty-programs/SectorsSection";
import { SettingsSection } from "@/components/landing-pages/feature-previews/loyalty-programs/SettingsSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";
import { faqPageJsonLd } from "@/lib/structured-data";

/** The loyalty programs preview: stamps or points, with levels on top. */
export async function LoyaltyProgramsPreviewPage({ market }: Readonly<{ market: Market }>) {
  const { hero, faq, band } = landingCopy(await getLocale(), market).previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW;

  return (
    <LandingPageShell slug="platform/loyalty-programs" market={market}>
      <JsonLd data={faqPageJsonLd([...faq.items])} />
      <PreviewHero
        slug="platform/loyalty-programs"
        market={market}
        secondary={{ label: hero.secondary, href: "#levels" }}
        visual={<ProgramFan />}
      />
      <ProgramsSection />
      <LevelsSection />
      <MoveUpSection />
      <MomentsSection />
      <SettingsSection />
      <PickerSection />
      <SectorsSection />
      <LpFaq faq={faq} />
      <LpAccentBand copy={band} />
      <RelatedPreviews slug="platform/loyalty-programs" />
    </LandingPageShell>
  );
}
