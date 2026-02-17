"use client";

import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Link } from "@/i18n/navigation";
import { BellIcon, MapPinIcon, CameraIcon, ChartIcon, PaletteIcon, StarIcon } from "../icons";
import { ArrowRightIcon } from "../icons";
import { ComponentType } from "react";

const featureIcons: ComponentType<{ className?: string }>[] = [
  BellIcon,
  MapPinIcon,
  CameraIcon,
  ChartIcon,
  PaletteIcon,
  StarIcon,
];

export function FeatureGrid() {
  const t = useTranslations("landing.featureGrid");

  const features = t.raw("features") as Array<{
    title: string;
    description: string;
    link: string;
  }>;

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative bg-[var(--blog-bg)]">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <ScrollReveal key={index} delay={index * 100} className="flex">
                <Link
                  href={feature.link as "/features/notifications-push"}
                  className="group flex flex-col w-full bg-white blog-card-3d rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-4 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] group-hover:gap-2 transition-all mt-auto pt-4">
                    {t("learnMore")}
                    <ArrowRightIcon className="w-4 h-4" />
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
