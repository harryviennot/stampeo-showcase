import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { landingPageMetadata } from "@/lib/landing-pages/pages";
import { faqPageJsonLd } from "@/lib/structured-data";

// The loyalty programs preview of /en/loyalty-programs: English only, noindex, in Platform's style.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/loyalty-programs");
}

export default function LoyaltyProgramsPreviewPage() {
  setRequestLocale("en");

  const { hero, faq, band } = LOYALTY_PROGRAMS_PREVIEW;

  return (
    <LandingPageShell slug="platform/loyalty-programs">
      <JsonLd data={faqPageJsonLd([...faq.items])} />
      <PreviewHero
        slug="platform/loyalty-programs"
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
