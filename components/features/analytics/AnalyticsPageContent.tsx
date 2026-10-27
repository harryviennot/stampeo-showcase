"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { Container } from "@/components/ui/Container";
import { CTAButton } from "@/components/ui/CTAButton";
import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { BlindSpotCards } from "./BlindSpotCards";
import { BusiestTimesSection } from "./BusiestTimesSection";
import { LiveActivityFeed } from "./LiveActivityFeed";
import { AnalyticsChartCards } from "./AnalyticsChartCards";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";
import { FeatureCTA } from "@/components/features/FeatureCTA";

export function AnalyticsPageContent() {
  const t = useTranslations("features");
  const tb = useTranslations("common.buttons");
  const habits = landingShot(useLocale() as Locale, "phone-habits");

  const cta = {
    title: t("analytiques.cta.title"),
    subtitle: t("analytiques.cta.subtitle"),
  };

  const related = t.raw("analytiques.related") as string[];

  return (
    <>
      {/* Hero: text first on a phone, the real Analytics page beside it from lg.
          No ScrollReveal here: it would hold the headline and the picture at
          opacity 0 until hydration. */}
      <section className="relative pt-24 pb-16 lg:min-h-[85vh] lg:flex lg:items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>

        <Container className="relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="flex flex-col gap-6 max-w-xl">
              <h1 className="text-h1 text-[var(--foreground)] leading-[1.1]">
                {t("analytiques.hero.title")}
              </h1>
              <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed">
                {t("analytiques.hero.subtitle")}
              </p>
              <div>
                <CTAButton label={tb("startFree")} trackAs="feature_hero" />
              </div>
            </div>

            <figure className="flex flex-col items-center">
              <PhoneScreenshot src={habits.src} alt={t("analytiques.hero.alt")} eager />
              <figcaption className="mt-5 max-w-xs text-sm text-center text-[var(--muted-foreground)]">
                {t("analytiques.hero.planLine")}
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      <BlindSpotCards />

      <BusiestTimesSection />

      <LiveActivityFeed />

      <AnalyticsChartCards />

      <FeatureCTA title={cta.title} subtitle={cta.subtitle} />

      <RelatedFeatures related={related} />
    </>
  );
}
