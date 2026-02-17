import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialProofBar } from "@/components/sections/SocialProofBar";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { SectorCards } from "@/components/sections/SectorCards";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { FoundingPartnerSection } from "@/components/sections/FoundingPartnerSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationJsonLd,
  webSiteJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
} from "@/lib/structured-data";

export default async function Home() {
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
      <Header />
      <main className="relative">
        <HeroSection />
        <SocialProofBar />
        <ProblemSection />
        <HowItWorks />
        <BenefitsSection />
        <ComparisonTable />
        <DashboardPreview />
        <SectorCards />
        <FeatureGrid />
        <FoundingPartnerSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
