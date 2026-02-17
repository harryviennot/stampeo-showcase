"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BlindSpotCards } from "./BlindSpotCards";
import { DashboardSection } from "./DashboardSection";
import { ProChartCards } from "./ProChartCards";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";
import { FeatureCTA } from "@/components/features/FeatureCTA";

export function AnalyticsPageContent() {
  const t = useTranslations("features");

  const hero = {
    title: t("analytiques.hero.title"),
    subtitle: t("analytiques.hero.subtitle"),
  };

  const cta = {
    title: t("analytiques.cta.title"),
    subtitle: t("analytiques.cta.subtitle"),
  };

  const related = t.raw("analytiques.related") as string[];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>
        <Container className="relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-6">
              {hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-2xl mx-auto">
              {hero.subtitle}
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-14 px-8 bg-[var(--accent)] text-white text-base font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
            >
              {t("ctaButton")}
            </Link>
          </ScrollReveal>
        </Container>
      </section>

      {/* Blind Spot Cards (problem section) */}
      <BlindSpotCards />

      {/* Dashboard Section (Pay tier) */}
      <DashboardSection />

      {/* Pro Chart Cards */}
      <ProChartCards />

      {/* CTA */}
      <FeatureCTA title={cta.title} subtitle={cta.subtitle} />

      <RelatedFeatures related={related} />
    </>
  );
}
