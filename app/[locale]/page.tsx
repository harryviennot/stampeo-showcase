import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import dynamic from "next/dynamic";

const BenefitsSection = dynamic(() =>
  import("@/components/sections/BenefitsSection").then((m) => m.BenefitsSection)
);
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { SectorCards } from "@/components/sections/SectorCards";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
// Removed from landing page — founding offer now embedded in PricingSection
// import { FoundingPartnerSection } from "@/components/sections/FoundingPartnerSection";
// import { ROICalculator } from "@/components/features/programme-fondateur/ROICalculator";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { Footer } from "@/components/sections/Footer";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { VariantDevToggle } from "@/components/landing-variant/VariantDevToggle";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationJsonLd,
  webSiteJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
} from "@/lib/structured-data";

export default async function Home({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ variant?: string }>;
}>) {
  const { locale } = await params;
  const { variant } = await searchParams;
  setRequestLocale(locale);

  // FR DEFAULT (since 2026-04-25 cutover): VariantLanding is the live FR page.
  // Escape hatch: `/?variant=control` renders the legacy control page (kept for
  // before/after comparison + emergency rollback without redeploying).
  // EN always renders the legacy control, regardless of variant param.
  if (locale === "fr" && variant !== "control") {
    return <VariantLanding locale={locale} />;
  }

  const t = await getTranslations("landing.faq");
  const faqItems = t.raw("items") as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={faqPageJsonLd(faqItems)} />
      <LandingTracker locale={locale} variant="control" />
      <Header />
      <main className="relative">
        <div data-landing-section="hero"><HeroSection /></div>
        <div data-landing-section="problem"><ProblemSection /></div>
        <div data-landing-section="how_it_works"><HowItWorks /></div>
        <div data-landing-section="benefits"><BenefitsSection /></div>
        <div data-landing-section="comparison"><ComparisonTable /></div>
        <div data-landing-section="dashboard_preview"><DashboardPreview /></div>
        <div data-landing-section="sectors"><SectorCards /></div>
        <div data-landing-section="feature_grid"><FeatureGrid /></div>
        {/* Removed: FoundingPartnerSection — founding offer now in PricingSection */}
        {/* Removed: ROICalculator — available on /programme-fondateur page */}
        <div data-landing-section="pricing"><PricingSection /></div>
        <div data-landing-section="faq"><FAQSection /></div>
        <div data-landing-section="final_cta"><FinalCTASection /></div>
      </main>
      <Footer />
      <VariantDevToggle />
    </div>
  );
}
