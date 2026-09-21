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
import type { RegionCurrency } from "@/lib/region-pricing";
import { marketCopy } from "@/lib/market-copy";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { RegionText } from "@/components/market/RegionText";

export async function VariantLanding({
  locale,
  market = "int",
}: Readonly<{ locale: string; market?: Market }>) {
  setRequestLocale(locale);
  // Namespaced at `variant` so the market override at `variant.us.*` is
  // reachable from the same translator as the base copy.
  const t = await getTranslations("variant");
  // Both ladders are fetched here, at render time, so the page stays fully
  // cacheable — but since STA-330 the market no longer fixes what a VISITOR
  // sees. The RegionPricingProvider below picks the ladder for the browser's
  // detected region after hydration (US → usd/14, elsewhere → eur/30); the
  // market currency is only the default for a visitor we cannot place, and the
  // ladder JSON-LD asserts to crawlers for THIS url.
  const marketCurrency: RegionCurrency =
    MARKETS[market].currency.code.toLowerCase() === "usd" ? "usd" : "eur";
  const [eur, usd] = await Promise.all([getPlanCatalog("eur"), getPlanCatalog("usd")]);
  const pricing = marketCurrency === "usd" ? usd : eur;
  const trialDays = MARKETS[market].trialDays;
  const copy = marketCopy(t, market);
  // The US FAQ replaces the array wholesale rather than merging by index: the
  // two lists are different lengths and answer different objections, and
  // index-merging them is how you ship a half-European FAQ.
  const rawFaqItems = copy.raw("faq.items") as Array<{ question: string; answer: string }>;
  // Interpolated with the MARKET ladder, for JSON-LD only: structured data is
  // machine-read per-URL and must not vary by visitor. Passing raw strings
  // through once shipped the literal token "{starterPrice}" to Google.
  const jsonLdFaqItems = rawFaqItems.map((faq) => ({
    question: faq.question,
    answer: interpolatePricing(faq.answer, pricing, locale, trialDays),
  }));
  // The visible FAQ resolves per-visitor instead: raw strings through the
  // client leaf, which chips the tokens until the region is known.
  const visibleFaqItems = rawFaqItems.map((faq) => ({
    question: faq.question,
    answer: <RegionText raw={faq.answer} />,
  }));

  return (
    <div className="paper-grain min-h-screen bg-[var(--cream)] overflow-x-hidden relative">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd(pricing)} />
      <JsonLd data={faqPageJsonLd(jsonLdFaqItems)} />
      <LandingTracker locale={locale} variant="wallet" />
      {/* Inside the page, around the sections only: wrapping the layout's
          tracker siblings would remount them (duplicate page_view), and the
          provider must never gate or delay LandingTracker — AttributionCapture
          snapshots the variant it stamps, in the same commit. */}
      <RegionPricingProvider
        ladders={{ eur, usd }}
        defaultCurrency={marketCurrency}
        defaultTrialDays={trialDays}
      >
        <Header market={market} />
        <main className="relative">
          <div data-landing-section="hero"><VariantHero market={market} /></div>
          {/* "Made in Europe · GDPR" trust strip — hidden outside Europe (US). */}
          {MARKETS[market].europeTrust && (
            <div data-landing-section="trust_strip"><VariantTrustStrip /></div>
          )}
          <div data-landing-section="benefits"><VariantBenefits /></div>
          <div data-landing-section="differentiator"><VariantDifferentiator market={market} /></div>
          <div data-landing-section="dashboard_preview"><DashboardPreview /></div>
          <div data-landing-section="how_it_works"><VariantHowItWorks /></div>
          {/* Tear line: the pitch is above, the thing you can actually touch is
              below. The one place on the page it earns its keep. */}
          <Container><div className="perforation" aria-hidden /></Container>
          <div data-landing-section="try_it"><VariantTryIt /></div>
          <div data-landing-section="sectors"><VariantSectorCards /></div>
          <div data-landing-section="metrics"><VariantMetricStrip /></div>
          <div data-landing-section="feature_grid"><FeatureGrid /></div>
          <div data-landing-section="pricing">
            <PricingSection market={market} />
          </div>
          <div data-landing-section="faq"><VariantFAQ faqs={visibleFaqItems} /></div>
          <div data-landing-section="changelog"><VariantChangelogTeaser /></div>
          <div data-landing-section="final_cta"><VariantFinalCTA market={market} /></div>
        </main>
        <Footer market={market} />
      </RegionPricingProvider>
      <VariantDevToggle />
    </div>
  );
}
