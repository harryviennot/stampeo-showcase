"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { FounderProgramPage } from "./programme-fondateur/FounderProgramPage";
import {
  SparklesIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
  StarIcon,
  CameraIcon,
  ShieldCheckIcon,
  ClockIcon,
  PaletteIcon,
  UserGroupIcon,
} from "../icons";
import { RelatedFeatures } from "./RelatedFeatures";
import type { ComponentType } from "react";

type FeatureSlug =
  | "design-de-carte"
  | "scanner-mobile"
  | "notifications-push"
  | "analytiques"
  | "geolocalisation"
  | "programme-fondateur";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  sparkles: SparklesIcon,
  cpu: SparklesIcon,
  palette: PaletteIcon,
  smartphone: DevicePhoneMobileIcon,
  globe: CameraIcon,
  "wifi-off": ClockIcon,
  stamp: StarIcon,
  target: BellIcon,
  gift: SparklesIcon,
  "layout-dashboard": ChartIcon,
  "trending-up": ChartIcon,
  users: UserGroupIcon,
  "map-pin": MapPinIcon,
  building: ChartIcon,
  shield: ShieldCheckIcon,
  calendar: ClockIcon,
  tag: StarIcon,
  crown: SparklesIcon,
};

interface FeaturePageLayoutProps {
  slug: FeatureSlug;
}

export function FeaturePageLayout({ slug }: FeaturePageLayoutProps) {
  const t = useTranslations("features");

  if (slug === "programme-fondateur") {
    return <FounderProgramPage />;
  }

  const hero = {
    title: t(`${slug}.hero.title`),
    subtitle: t(`${slug}.hero.subtitle`),
  };

  const problem = {
    title: t(`${slug}.problem.title`),
    description: t(`${slug}.problem.description`),
  };

  const sections = t.raw(`${slug}.sections`) as Array<{
    title: string;
    description: string;
    icon: string;
    badge?: string;
  }>;

  const cta = {
    title: t(`${slug}.cta.title`),
    subtitle: t(`${slug}.cta.subtitle`),
  };

  const related = t.raw(`${slug}.related`) as string[];

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

      {/* Problem */}
      <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {problem.title}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {problem.description}
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* Feature sections */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sections.map((section, index) => {
              const Icon = iconMap[section.icon] || SparklesIcon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <div className="relative p-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm hover:shadow-md transition-shadow h-full">
                    {section.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {section.badge}
                      </span>
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                      {section.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

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

      <RelatedFeatures related={related} />
    </>
  );
}
