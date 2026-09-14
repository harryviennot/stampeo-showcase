import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { VariantSectorCards } from "./VariantSectorCards";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationJsonLd,
  webSiteJsonLd,
  softwareApplicationJsonLd,
  faqPageJsonLd,
} from "@/lib/structured-data";
import { VariantHero } from "./VariantHero";
import { VariantTryIt } from "./VariantTryIt";
import { VariantTrustStrip } from "./VariantTrustStrip";
import { VariantBenefits } from "./VariantBenefits";
import { VariantDifferentiator } from "./VariantDifferentiator";
import { VariantHowItWorks } from "./VariantHowItWorks";
import { VariantMetricStrip } from "./VariantMetricStrip";
import { VariantChangelogTeaser } from "./VariantChangelogTeaser";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { VariantFAQ } from "./VariantFAQ";
import { VariantFinalCTA } from "./VariantFinalCTA";
import { VariantDevToggle } from "./VariantDevToggle";
import { MARKETS, type Market } from "@/lib/markets";
import { getPlanCatalog } from "@/lib/plan-catalog";
import { interpolatePricing } from "@/lib/pricing";

export async function VariantLanding({
  locale,
  market = "int",
}: Readonly<{ locale: string; market?: Market }>) {
  setRequestLocale(locale);
  const t = await getTranslations("variant.faq");
  // Fetched once here and passed down: the market fixes the currency at render
  // time, so the page stays fully cacheable and every block on it quotes the
  // same ladder.
  const pricing = await getPlanCatalog(MARKETS[market].currency.code.toLowerCase());
  // The trial length is a promise, and it differs by market. Read from the
  // market rather than written into copy, which is how /us came to offer 30
  // days one click before Stripe granted 14.
  const trialDays = MARKETS[market].trialDays;
  const faqItems = (t.raw("items") as Array<{ question: string; answer: string }>).map(
    // Interpolate BEFORE the JSON-LD is built. Passing the raw strings through
    // shipped the literal token "{starterPrice}" to Google.
    (faq) => ({
      question: faq.question,
      answer: interpolatePricing(faq.answer, pricing, locale, trialDays),
    }),
  );

  return (
    <div className="paper-grain min-h-screen bg-[var(--cream)] overflow-x-hidden relative">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd(pricing)} />
      <JsonLd data={faqPageJsonLd(faqItems)} />
      <LandingTracker locale={locale} variant="wallet" />
      <Header market={market} />
      <main className="relative">
        <div data-landing-section="hero"><VariantHero /></div>
        {/* "Made in Europe · GDPR" trust strip — hidden outside Europe (US). */}
        {MARKETS[market].europeTrust && (
          <div data-landing-section="trust_strip"><VariantTrustStrip /></div>
        )}
        <div data-landing-section="benefits"><VariantBenefits /></div>
        <div data-landing-section="differentiator"><VariantDifferentiator trialDays={trialDays} /></div>
        <div data-landing-section="dashboard_preview"><DashboardPreview /></div>
        <div data-landing-section="how_it_works"><VariantHowItWorks /></div>
        {/* Tear line: the pitch is above, the thing you can actually touch is
            below. The one place on the page it earns its keep. */}
        <Container><div className="perforation" aria-hidden /></Container>
        <div data-landing-section="try_it"><VariantTryIt /></div>
        <div data-landing-section="sectors"><VariantSectorCards /></div>
        <div data-landing-section="metrics"><VariantMetricStrip /></div>
        <div data-landing-section="feature_grid"><FeatureGrid /></div>
        <div data-landing-section="pricing"><PricingSection pricing={pricing} trialDays={trialDays} /></div>
        <div data-landing-section="faq"><VariantFAQ faqs={faqItems} /></div>
        <div data-landing-section="changelog"><VariantChangelogTeaser /></div>
        <div data-landing-section="final_cta"><VariantFinalCTA pricing={pricing} locale={locale} trialDays={trialDays} /></div>
      </main>
      <Footer market={market} />
      <VariantDevToggle />
    </div>
  );
}
