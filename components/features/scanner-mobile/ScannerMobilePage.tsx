"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  CameraIcon,
  CheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  BellIcon,
  ChartIcon,
  StarIcon,
  MapPinIcon,
  PaletteIcon,
  WifiOffIcon,
  ClockIcon,
} from "@/components/icons";
import { ScanDemo } from "./ScanDemo";
import { OfflineToggleDemo } from "./OfflineToggleDemo";
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

const securityIcons = [ShieldCheckIcon, ClockIcon, SparklesIcon, ShieldCheckIcon];

export function ScannerMobilePage() {
  const t = useTranslations("features");
  const ts = useTranslations("features.scanner-mobile");
  const tc = useTranslations("features.scanner-mobile.custom");

  const howItWorksApp = tc.raw("howItWorks.app.steps") as string[];
  const howItWorksWeb = tc.raw("howItWorks.web.steps") as string[];
  const offlineSituations = tc.raw("offline.situations") as string[];
  const employeeFeatures = tc.raw("employee.features") as {
    title: string;
    description: string;
  }[];
  const payFeatures = tc.raw("team.pay.features") as string[];
  const proFeatures = tc.raw("team.pro.features") as string[];
  const securityFeatures = tc.raw("security.features") as {
    title: string;
    description: string;
  }[];
  const related = ts.raw("related") as string[];

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
                  <CameraIcon className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-bold tracking-wide">
                    {tc("heroBadge")}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
                  {ts("hero.title")}
                </h1>

                <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                  {ts("hero.subtitle")}
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

              {/* Platform badges */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span>iOS</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 2.236a.5.5 0 00-.862 0L14.2 6.168l-4.323.628a.5.5 0 00-.277.854l3.128 3.049-.739 4.305a.5.5 0 00.725.527L16 13.347l3.286 1.184a.5.5 0 00.725-.527l-.739-4.305 3.128-3.049a.5.5 0 00-.277-.854l-4.323-.628z" fill="#3DDC84" />
                    <path d="M3 7h4v10H3zM17 7h4v10h-4zM7 3l2 4h6l2-4M9 17l-2 4M15 17l2 4" stroke="#3DDC84" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                  <span>Android</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  <span>Web</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Right - Scan Demo */}
            <ScrollReveal
              delay={200}
              className="flex justify-center order-1 lg:order-2"
            >
              <ScanDemo />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 2. Problem ============ */}
      <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {ts("problem.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {ts("problem.description")}
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 3. How It Works ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tc("howItWorks.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tc("howItWorks.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* App card */}
            <ScrollReveal>
              <div className="relative p-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm h-full">
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                  {tc("howItWorks.app.badge")}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                  <DevicePhoneMobileIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                  {tc("howItWorks.app.title")}
                </h3>
                <ol className="space-y-3">
                  {howItWorksApp.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollReveal>

            {/* Web card */}
            <ScrollReveal delay={100}>
              <div className="relative p-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                  {tc("howItWorks.web.title")}
                </h3>
                <ol className="space-y-3">
                  {howItWorksWeb.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 4. Offline ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Situations */}
            <ScrollReveal>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                <WifiOffIcon className="w-6 h-6" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
                {tc("offline.title")}
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8">
                {tc("offline.subtitle")}
              </p>
              <ul className="space-y-3">
                {offlineSituations.map((situation, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">
                      {situation}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* Right - Demo */}
            <ScrollReveal delay={200} className="flex justify-center">
              <OfflineToggleDemo />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 5. Employee Experience ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tc("employee.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tc("employee.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {employeeFeatures.map((feature, i) => {
              const icons = [DevicePhoneMobileIcon, BellIcon, ClockIcon];
              const Icon = icons[i] || SparklesIcon;
              return (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="relative p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2 h-full">
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

      {/* ============ 6. Team Management ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tc("team.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tc("team.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Pay plan */}
            <ScrollReveal>
              <div className="p-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    {tc("team.pay.title")}
                  </h3>
                </div>
                <p className="text-2xl font-extrabold text-[var(--accent)] mb-1">
                  {tc("team.pay.price")}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  {tc("team.pay.members")}
                </p>
                <ul className="space-y-3">
                  {payFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Pro plan */}
            <ScrollReveal delay={100}>
              <div className="relative p-8 bg-white rounded-2xl border-2 border-[var(--accent)] shadow-lg h-full">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-bold">
                  Pro
                </span>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    {tc("team.pro.title")}
                  </h3>
                </div>
                <p className="text-2xl font-extrabold text-[var(--accent)] mb-1">
                  {tc("team.pro.price")}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  {tc("team.pro.members")}
                </p>
                <ul className="space-y-3">
                  {proFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 7. Security ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tc("security.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tc("security.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {securityFeatures.map((feature, i) => {
              const Icon = securityIcons[i] || ShieldCheckIcon;
              return (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="p-6 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ 8. CTA ============ */}
      <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto py-12 px-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {ts("cta.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              {ts("cta.subtitle")}
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

      {/* ============ 9. Related Features ============ */}
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
