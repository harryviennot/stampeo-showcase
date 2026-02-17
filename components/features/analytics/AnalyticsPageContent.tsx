"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  ArrowRightIcon,
  PaletteIcon,
  CameraIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
  StarIcon,
  SparklesIcon,
} from "@/components/icons";
import { BlindSpotCards } from "./BlindSpotCards";
import { DashboardSection } from "./DashboardSection";
import { ProChartCards } from "./ProChartCards";
import type { ComponentType } from "react";

type FeatureSlug =
  | "design-de-carte"
  | "scanner-mobile"
  | "notifications-push"
  | "analytiques"
  | "geolocalisation"
  | "programme-fondateur";

const featureNavIcons: Record<FeatureSlug, ComponentType<{ className?: string }>> = {
  "design-de-carte": PaletteIcon,
  "scanner-mobile": CameraIcon,
  "notifications-push": BellIcon,
  "analytiques": ChartIcon,
  "geolocalisation": MapPinIcon,
  "programme-fondateur": StarIcon,
};

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
      <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto py-12 px-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {cta.title}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              {cta.subtitle}
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

      {/* Related features */}
      <section className="py-16 sm:py-24">
        <Container>
          <ScrollReveal className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              {t("relatedTitle")}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((relSlug, index) => {
              const Icon = featureNavIcons[relSlug as FeatureSlug] || SparklesIcon;
              return (
                <ScrollReveal key={relSlug} delay={index * 100}>
                  <Link
                    href={`/features/${relSlug}` as "/features/design-de-carte"}
                    className="group flex items-start gap-4 p-6 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                        {t(`${relSlug}.hero.title`)}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] group-hover:gap-2 transition-all">
                        <ArrowRightIcon className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
