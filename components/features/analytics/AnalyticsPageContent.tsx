"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { BlindSpotCards } from "./BlindSpotCards";
import { DashboardSection } from "./DashboardSection";
import { LiveActivityFeed } from "./LiveActivityFeed";
import { ProChartCards } from "./ProChartCards";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";
import { FeatureCTA } from "@/components/features/FeatureCTA";

export function AnalyticsPageContent() {
  const t = useTranslations("features");
  const tb = useTranslations("common.buttons");

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
            <CTAButton label={tb("startFree")} />

          </ScrollReveal>
        </Container>
      </section>

      {/* Blind Spot Cards (problem section) */}
      <BlindSpotCards />

      {/* Dashboard Section (Starter tier) */}
      <DashboardSection />

      {/* Live Activity Feed */}
      <LiveActivityFeed />

      {/* Pro Chart Cards */}
      <ProChartCards />

      {/* CTA */}
      <FeatureCTA title={cta.title} subtitle={cta.subtitle} />

      <RelatedFeatures related={related} />
    </>
  );
}
