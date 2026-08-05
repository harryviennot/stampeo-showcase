"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { InkArrow, InkNote } from "@/components/ui/InkAnnotation";
import { CTAButton } from "@/components/ui/CTAButton";
import {
  CameraIcon,
  CheckIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  BellIcon,
  WifiOffIcon,
  ClockIcon,
  QRCodeIcon,
  LockIcon,
  FingerprintIcon,
  ArrowRightIcon,
  GlobeIcon,
} from "@/components/icons";
import { ScanDemo } from "./ScanDemo";
import { OfflineToggleDemo } from "./OfflineToggleDemo";
import { StoreBadges } from "./StoreBadges";
import { GetTheAppBand } from "./GetTheAppBand";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";

const securityIcons = [QRCodeIcon, ClockIcon, FingerprintIcon, LockIcon];

export function ScannerMobilePage() {
  const tb = useTranslations("common.buttons");
  const ts = useTranslations("features.scanner-mobile");
  const tc = useTranslations("features.scanner-mobile.custom");

  const howItWorksApp = tc.raw("howItWorks.app.steps") as string[];
  const howItWorksWeb = tc.raw("howItWorks.web.steps") as string[];
  const offlineSituations = tc.raw("offline.situations") as string[];
  const employeeFeatures = tc.raw("employee.features") as {
    title: string;
    description: string;
  }[];
  const securityFeatures = tc.raw("security.features") as {
    title: string;
    description: string;
  }[];
  const related = ts.raw("related") as string[];

  return (
    <>
      {/* ============ 1. Hero (download-forward) ============ */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] h-48 w-48 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left */}
            <ScrollReveal
              id="scanner-hero-title"
              className="order-2 flex flex-col gap-7 lg:order-1"
            >
              <div>
                <span className="mb-6 inline-block rounded-full bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
                  {tc("heroBadge")}
                </span>

                <h1 className="mb-6 text-h1 text-[var(--foreground)]">
                  {ts("hero.title")}
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)] lg:text-xl">
                  {ts("hero.subtitle")}
                </p>
              </div>

              {/* Primary action — real, clickable store badges */}
              <div className="flex flex-col gap-3">
                <StoreBadges size="lg" />
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  {tc("heroPlatforms")}
                </p>
              </div>

              {/* Secondary actions */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <CTAButton
                  label={tb("startFree")}
                  size="sm"
                  variant="outline"
                  showArrow={false}
                />
                <a
                  href="#two-ways"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition-opacity hover:opacity-80"
                >
                  {tc("webScannerLink")}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </ScrollReveal>

            {/* Right — Scan Demo */}
            <ScrollReveal
              delay={200}
              className="order-1 flex justify-center lg:order-2"
            >
              <div className="relative">
                <ScanDemo />
                {/* Margin note labelling this phone as the team's side of the
                    product; the wallet card everywhere else is the customer's. */}
                <div className="hidden lg:flex absolute -top-4 -right-28 flex-col items-start pointer-events-none">
                  <InkNote rotate={3}>{ts("hero.annotation")}</InkNote>
                  <InkArrow variant="downLeft" className="w-9 mt-1 ml-2" delay={0.5} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 2. Problem ============ */}
      <section className="bg-[var(--blog-bg)] py-20 sm:py-28">
        <Container>
          <ScrollReveal className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 blog-card-3d sm:p-12">
              <CameraIcon className="pointer-events-none absolute -top-4 -right-4 h-28 w-28 text-[var(--accent)]/[0.06]" />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h2 className="mb-5 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                {ts("problem.title")}
              </h2>
              <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">
                {ts("problem.description")}
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 3. How It Works ============ */}
      <section id="two-ways" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-h2 text-[var(--foreground)]">
              {tc("howItWorks.title")}
            </h2>
            <p className="text-lead text-[var(--muted-foreground)]">
              {tc("howItWorks.subtitle")}
            </p>
          </ScrollReveal>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* App card — recommended, accent-framed */}
            <ScrollReveal>
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-[var(--accent)]/30 bg-white p-8 blog-card-3d transition-transform duration-300 hover:-translate-y-1">
                <span className="absolute top-4 right-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
                  {tc("howItWorks.app.badge")}
                </span>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <DevicePhoneMobileIcon className="h-6 w-6" />
                </div>
                <h3 className="mb-5 text-xl font-bold text-[var(--foreground)]">
                  {tc("howItWorks.app.title")}
                </h3>
                <ol className="space-y-4">
                  {howItWorksApp.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 border-t border-[var(--border)] pt-5">
                  <StoreBadges size="md" />
                </div>
              </div>
            </ScrollReveal>

            {/* Web card */}
            <ScrollReveal delay={100}>
              <div className="h-full rounded-2xl bg-white p-8 blog-card-3d transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <GlobeIcon className="h-6 w-6" />
                </div>
                <h3 className="mb-5 text-xl font-bold text-[var(--foreground)]">
                  {tc("howItWorks.web.title")}
                </h3>
                <ol className="space-y-4">
                  {howItWorksWeb.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-[var(--muted-foreground)]">
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
      <section className="bg-[var(--blog-bg)] py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left - Situations */}
            <ScrollReveal>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <WifiOffIcon className="h-7 w-7" />
              </div>
              <h2 className="mb-4 text-h2 text-[var(--foreground)]">
                {tc("offline.title")}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[var(--muted-foreground)]">
                {tc("offline.subtitle")}
              </p>
              <ul className="space-y-3">
                {offlineSituations.map((situation, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]/10">
                      <CheckIcon className="h-3 w-3 text-[var(--accent)]" />
                    </div>
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
          <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-h2 text-[var(--foreground)]">
              {tc("employee.title")}
            </h2>
            <p className="text-lead text-[var(--muted-foreground)]">
              {tc("employee.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {employeeFeatures.map((feature, i) => {
              const icons = [DevicePhoneMobileIcon, BellIcon, ClockIcon];
              const Icon = icons[i] || SparklesIcon;
              return (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="h-full rounded-2xl bg-white p-8 blog-card-3d transition-transform duration-300 hover:-translate-y-2">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-[var(--foreground)]">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ 6. Security ============ */}
      <section className="bg-[var(--blog-bg)] py-20 sm:py-28">
        <Container>
          <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--muted-foreground)]">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>{tc("security.title")}</span>
            </div>
            <h2 className="text-h2 text-[var(--foreground)]">
              {tc("security.subtitle")}
            </h2>
          </ScrollReveal>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {securityFeatures.map((feature, i) => {
              const Icon = securityIcons[i] || ShieldCheckIcon;
              return (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-[var(--accent)]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-base font-bold text-[var(--foreground)]">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ 7. Get the app (download closer) ============ */}
      <GetTheAppBand />

      <RelatedFeatures related={related} />
    </>
  );
}
