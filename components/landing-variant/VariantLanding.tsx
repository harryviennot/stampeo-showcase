import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { SectorCards } from "@/components/sections/SectorCards";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footer } from "@/components/sections/Footer";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationJsonLd,
  webSiteJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
} from "@/lib/structured-data";
import { VariantHero } from "./VariantHero";
import { VariantTrustStrip } from "./VariantTrustStrip";
import { VariantBenefits } from "./VariantBenefits";
import { VariantDifferentiator } from "./VariantDifferentiator";
import { VariantHowItWorks } from "./VariantHowItWorks";
import { VariantTestimonials } from "./VariantTestimonials";
import { VariantFAQ } from "./VariantFAQ";
import { VariantFinalCTA } from "./VariantFinalCTA";
import { VariantDevToggle } from "./VariantDevToggle";

export async function VariantLanding({ locale }: Readonly<{ locale: string }>) {
  setRequestLocale(locale);
  const t = await getTranslations("variant.faq");
  const faqItems = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={faqPageJsonLd(faqItems)} />
      <LandingTracker locale={locale} variant="fidelatoo" />
      <Header />
      <main className="relative">
        <div data-landing-section="hero"><VariantHero /></div>
        <div data-landing-section="trust_strip"><VariantTrustStrip /></div>
        <div data-landing-section="benefits"><VariantBenefits /></div>
        <div data-landing-section="differentiator"><VariantDifferentiator /></div>
        <div data-landing-section="how_it_works"><VariantHowItWorks /></div>
        <div data-landing-section="sectors"><SectorCards /></div>
        <div data-landing-section="testimonials"><VariantTestimonials /></div>
        <div data-landing-section="feature_grid"><FeatureGrid /></div>
        <div data-landing-section="pricing"><PricingSection /></div>
        <div data-landing-section="faq"><VariantFAQ /></div>
        <div data-landing-section="final_cta"><VariantFinalCTA /></div>
      </main>
      <Footer />
      <VariantDevToggle />
    </div>
  );
}
