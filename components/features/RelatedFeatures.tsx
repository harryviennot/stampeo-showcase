"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import {
  ArrowRightIcon,
  PaletteIcon,
  CameraIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
  StarIcon,
  SparklesIcon,
} from "../icons";
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

interface RelatedFeaturesProps {
  related: string[];
  className?: string;
}

export function RelatedFeatures({ related, className = "" }: RelatedFeaturesProps) {
  const t = useTranslations("features");

  return (
    <section className={`py-16 sm:py-24 ${className}`}>
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
              <ScrollReveal key={relSlug} delay={index * 100} className="h-full">
                <Link
                  href={(relSlug === "programme-fondateur" ? "/programme-fondateur" : `/features/${relSlug}`) as "/features/design-de-carte"}
                  className="group flex flex-col gap-4 p-6 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground)] flex-1 min-w-0">
                      {t.has(`${relSlug}.hero.navTitle`) ? t(`${relSlug}.hero.navTitle`) : t(`${relSlug}.hero.title`)}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
                    {t("discoverLink")}
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
