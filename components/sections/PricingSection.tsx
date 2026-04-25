import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { PRICING, isFoundingProgramOpen } from "@/lib/pricing";
import { FoundingCountdown } from "@/components/pricing/FoundingCountdown";
import { PricingTierCard, type FeatureItem } from "@/components/pricing/PricingTierCard";

export async function PricingSection() {
  const t = await getTranslations("pricing");
  const foundingOpen = isFoundingProgramOpen();

  const starterFeatures = t.raw("starter.features") as FeatureItem[];
  const growthFeatures = t.raw("growth.features") as FeatureItem[];
  const proFeatures = t.raw("pro.features") as FeatureItem[];

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg lg:text-xl font-medium max-w-2xl mx-auto">
            {foundingOpen ? t("subtitle") : t("subtitleStandard")}
          </p>
          {foundingOpen && (
            <div className="mt-5 flex justify-center">
              <FoundingCountdown variant="badge" />
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal
          delay={200}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-md lg:max-w-none mx-auto"
        >
          <PricingTierCard
            name={t("starter.name")}
            tagline={t("starter.tagline")}
            features={starterFeatures}
            featuresLabel={t("starter.featuresLabel")}
            price={PRICING.starter.price}
            discount={foundingOpen ? { targetPrice: PRICING.starter.foundingPrice } : undefined}
            perMonthLabel={t("perMonth")}
            forLifeLabel={t("forLife")}
            cta={t("cta")}
            ctaHref="/onboarding"
            ctaSubtext={t("ctaSubtext")}
            trackAs="pricing_starter"
          />

          <PricingTierCard
            name={t("growth.name")}
            tagline={t("growth.tagline")}
            features={growthFeatures}
            featuresLabel={t("growth.featuresLabel")}
            price={PRICING.growth.price}
            discount={foundingOpen ? { targetPrice: PRICING.growth.foundingPrice } : undefined}
            perMonthLabel={t("perMonth")}
            forLifeLabel={t("forLife")}
            cta={t("cta")}
            ctaHref="/onboarding"
            ctaSubtext={t("ctaSubtext")}
            highlighted
            popularLabel={t("popular")}
            trackAs="pricing_growth"
          />

          <PricingTierCard
            name={t("pro.name")}
            tagline={t("pro.tagline")}
            features={proFeatures}
            featuresLabel={t("pro.featuresLabel")}
            price={PRICING.pro.price}
            perMonthLabel={t("perMonth")}
            cta={t("cta")}
            ctaHref="/onboarding"
            comingSoon
            comingSoonLabel={t("comingSoon")}
            ctaComingSoonLabel={t("ctaComingSoon")}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
