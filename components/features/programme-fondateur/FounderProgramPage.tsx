"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "../../ui/Container";
import { ScrollReveal } from "../../ui/ScrollReveal";
import { ROICalculator } from "./ROICalculator";
import { PriceReveal } from "./PriceReveal";
import { FounderTimeline } from "./FounderTimeline";
import {
  ClockIcon,
  StarIcon,
  SparklesIcon,
  SignalIcon,
  PaletteIcon,
  CheckIcon,
} from "../../icons";
import { RelatedFeatures } from "../RelatedFeatures";
import type { ComponentType } from "react";

const benefitIconMap: Record<string, ComponentType<{ className?: string }>> = {
  calendar: ClockIcon,
  tag: StarIcon,
  crown: SparklesIcon,
  signal: SignalIcon,
  palette: PaletteIcon,
  sparkles: SparklesIcon,
};

export function FounderProgramPage() {
  const t = useTranslations("features");
  const c = useTranslations("features.programme-fondateur.custom");

  const benefits = c.raw("benefits.items") as Array<{
    title: string;
    description: string;
    icon: string;
  }>;

  const worksNow = c.raw("transparency.worksNow.items") as string[];
  const comingSoon = c.raw("transparency.comingSoon.items") as string[];
  const expectFromYou = c.raw("transparency.expectFromYou.items") as string[];

  const faqItems = c.raw("faq.items") as Array<{
    question: string;
    answer: string;
  }>;

  const related = t.raw("programme-fondateur.related") as string[];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-56 h-56 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>
        <Container className="relative z-10">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--accent)]/10 shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] pulse-dot" />
              <span className="text-sm font-bold tracking-wide">
                {t("programme-fondateur.hero.badge")}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-6 leading-[1.1]">
              {t.rich("programme-fondateur.hero.title", {
                accent: (chunks) => (
                  <span className="text-[var(--accent)]">{chunks}</span>
                ),
              })}
            </h1>

            <p className="text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-2xl mx-auto">
              {t("programme-fondateur.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="group flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
              >
                <span>{t("ctaButton")}</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {t("programme-fondateur.hero.secondaryCta")}
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 lg:py-32">
        <Container>
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
              {c("benefits.title")}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefitIconMap[benefit.icon] || SparklesIcon;
              return (
                <ScrollReveal key={index} delay={index * 80}>
                  <div className="group relative flex flex-col gap-5 p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2 h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-bold leading-tight text-[var(--foreground)]">
                        {benefit.title}
                      </h3>
                      <p className="text-[var(--muted-foreground)] text-base font-medium leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Transparency Section */}
      <section className="py-24 lg:py-32 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {c("transparency.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {c("transparency.description")}
            </p>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* What works now */}
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-2xl blog-card-3d p-8 h-full">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  {c("transparency.worksNow.title")}
                </h3>
                <ul className="space-y-3">
                  {worksNow.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[var(--muted-foreground)]"
                    >
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Coming soon */}
            <ScrollReveal delay={200}>
              <div className="bg-white rounded-2xl blog-card-3d p-8 h-full">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-[var(--accent)]" />
                  {c("transparency.comingSoon.title")}
                </h3>
                <ul className="space-y-3">
                  {comingSoon.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[var(--muted-foreground)]"
                    >
                      <span className="text-[var(--accent)] mt-0.5 shrink-0">◦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>

          {/* What we expect */}
          <ScrollReveal delay={300} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl blog-card-3d p-8">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
                {c("transparency.expectFromYou.title")}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expectFromYou.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[var(--muted-foreground)]"
                  >
                    <span className="text-[var(--accent)] mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[var(--muted-foreground)] italic">
                {c("transparency.disclaimer")}
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Price Reveal */}
      <PriceReveal />

      {/* Founder Timeline */}
      <FounderTimeline />

      {/* FAQ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[840px] mx-auto px-6">
          <ScrollReveal className="mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              {c("faq.title")}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={200} className="flex flex-col gap-5">
            {faqItems.map((faq, index) => (
              <details
                key={index}
                className="group flex flex-col rounded-xl bg-white blog-card-3d px-6 py-4"
                open={index === 0}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                  <p className="text-lg font-bold leading-normal group-hover:text-[var(--accent)] transition-colors">
                    {faq.question}
                  </p>
                  <div className="text-[var(--muted-foreground)] transition-transform duration-300 group-open:rotate-180 group-open:text-[var(--accent)]">
                    <span className="text-xl font-bold">↓</span>
                  </div>
                </summary>
                <div className="pt-2 pb-4">
                  <p className="text-[var(--muted-foreground)] text-base font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[840px] mx-auto px-6">
          <ScrollReveal>
            <div className="p-10 sm:p-14 bg-[var(--foreground)] rounded-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />

              <h2 className="text-white text-3xl sm:text-4xl font-extrabold mb-4">
                {c("finalCta.title")}
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                {c("finalCta.subtitle")}
              </p>

              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 bg-[var(--accent)] hover:brightness-110 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-[var(--accent)]/25"
              >
                {t("ctaButton")}
                <span>→</span>
              </Link>

              <p className="mt-6 text-sm text-gray-500 font-medium">
                {c("finalCta.urgency")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <RelatedFeatures related={related} className="bg-[var(--blog-bg)]" />
    </>
  );
}
