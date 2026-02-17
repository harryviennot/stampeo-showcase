"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { NumberStamp } from "@/components/stamps/StampIcons";
import {
  BellIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  ChartIcon,
  ClockIcon,
  StarIcon,
  CameraIcon,
  MapPinIcon,
  PaletteIcon,
} from "@/components/icons";
import { NotificationPhoneDemo } from "./NotificationPhoneDemo";
import { ChannelComparisonBars } from "./ChannelComparisonBars";
import { NotificationSequenceDemo } from "./NotificationSequenceDemo";
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
  analytiques: ChartIcon,
  geolocalisation: MapPinIcon,
  "programme-fondateur": StarIcon,
};

const stepColors = ["#f97316", "#ec4899", "#8b5cf6", "#3b82f6"];

const advancedIcons = [SparklesIcon, ChartIcon, ClockIcon];

export function NotificationsPushPage() {
  const t = useTranslations("features");
  const tp = useTranslations("features.notifications-push");

  const howItWorksSteps = tp.raw("howItWorks.steps") as {
    title: string;
    description: string;
  }[];

  const advancedFeatures = tp.raw("advanced.features") as {
    title: string;
    description: string;
    badge?: string;
  }[];

  const privacyPoints = tp.raw("privacy.points") as string[];

  const related = tp.raw("related") as string[];

  return (
    <>
      {/* ============ 1. Hero ============ */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <ScrollReveal className="flex flex-col gap-6 order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--accent)]/10 shadow-sm mb-6">
                  <BellIcon className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-bold tracking-wide">
                    {tp("heroBadge")}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
                  {tp("hero.title")}
                </h1>

                <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                  {tp("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="group flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
                >
                  <span>{t("ctaButton")}</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              {/* Wallet badges */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span>Apple Wallet</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Google Wallet</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Right - Phone */}
            <ScrollReveal
              delay={200}
              className="flex justify-center order-1 lg:order-2"
            >
              <NotificationPhoneDemo />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 2. Problem — Channel Comparison ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {tp("problem.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {tp("channels.statement")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <ChannelComparisonBars />
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 3. How It Works ============ */}
      <section className="py-20 sm:py-28 relative bg-[var(--blog-bg-alt)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
              {tp("howItWorks.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
              {tp("howItWorks.title")}
            </h2>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            {howItWorksSteps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 100} className="relative">
                <div className="flex gap-6 sm:gap-8 pb-12 last:pb-0">
                  <div className="flex flex-col items-center">
                    <NumberStamp
                      color={stepColors[index]}
                      size={48}
                      number={index + 1}
                    />
                    {index < howItWorksSteps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[var(--border)] mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ 4. Notification Types ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("notificationTypes.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("notificationTypes.subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <NotificationSequenceDemo />
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 5. Advanced Features ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("advanced.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("advanced.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = advancedIcons[index] || SparklesIcon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <div className="relative p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2 h-full">
                    {feature.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {feature.badge}
                      </span>
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ 6. Privacy ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[var(--accent)]/10 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {tp("privacy.title")}
                </h2>
              </div>
              <ul className="space-y-4">
                {privacyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)] leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 7. CTA ============ */}
      <section className="relative stamp-pattern flex flex-col items-center justify-center px-6 py-24 md:py-32 text-center overflow-hidden">
        <ScrollReveal className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05]">
            {tp("cta.title")}
          </h2>
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/onboarding"
              className="group flex min-w-[280px] md:min-w-[340px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 md:h-20 px-10 bg-[var(--accent)] text-white text-lg md:text-xl font-extrabold leading-normal tracking-wide shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <span>{t("ctaButton")}</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <p className="text-[var(--muted-foreground)] text-sm md:text-base font-medium">
              {tp("cta.subtitle")}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ============ 8. Related Features ============ */}
      <section className="py-16 sm:py-24">
        <Container>
          <ScrollReveal className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              {t("relatedTitle")}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((relSlug, index) => {
              const Icon =
                featureNavIcons[relSlug as FeatureSlug] || SparklesIcon;
              return (
                <ScrollReveal key={relSlug} delay={index * 100}>
                  <Link
                    href={
                      `/features/${relSlug}` as "/features/design-de-carte"
                    }
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
