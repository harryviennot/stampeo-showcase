"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  CameraIcon,
  CheckIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  BellIcon,
  WifiOffIcon,
  ClockIcon,
} from "@/components/icons";
import { ScanDemo } from "./ScanDemo";
import { OfflineToggleDemo } from "./OfflineToggleDemo";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";

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
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span>iOS</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[var(--border)] text-xs font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V7H6v11zM3.5 7C2.67 7 2 7.67 2 8.5v7c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-7C5 7.67 4.33 7 3.5 7zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0012 0c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 006 6h12c0-2.21-1.2-4.15-2.97-5.84zM10 4H9V3h1v1zm5 0h-1V3h1v1z" fill="#3DDC84" />
                  </svg>
                  <span>Android</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[var(--border)] text-xs font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
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
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="max-w-3xl mx-auto text-center">
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
              <div className="relative p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-1 h-full">
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                  {tc("howItWorks.app.badge")}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                  <DevicePhoneMobileIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-5">
                  {tc("howItWorks.app.title")}
                </h3>
                <ol className="space-y-4">
                  {howItWorksApp.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs font-bold">
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
              <div className="relative p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-1 h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-5">
                  {tc("howItWorks.web.title")}
                </h3>
                <ol className="space-y-4">
                  {howItWorksWeb.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-bold">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
                <WifiOffIcon className="w-7 h-7" />
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
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]/10">
                      <CheckIcon className="w-3 h-3 text-[var(--accent)]" />
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

      {/* ============ 6. Security ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>{tc("security.title")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tc("security.subtitle")}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {securityFeatures.map((feature, i) => {
              const Icon = securityIcons[i] || ShieldCheckIcon;
              return (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="p-6 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
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

      {/* ============ 7. CTA ============ */}
      <section className="relative stamp-pattern flex flex-col items-center justify-center px-6 py-24 md:py-32 text-center overflow-hidden">
        <ScrollReveal className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05]">
            {ts("cta.title")}
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
              {ts("cta.subtitle")}
            </p>
          </div>
        </ScrollReveal>
      </section>

      <RelatedFeatures related={related} />
    </>
  );
}
