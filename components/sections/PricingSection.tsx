"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InfoIcon } from "@/components/icons";

type FeatureItem = string | { text: string; tooltip: string };

function FeatureListItem({ feature }: { feature: FeatureItem }) {
  if (typeof feature === "string") {
    return (
      <li className="flex items-start gap-3 text-[15px] font-medium">
        <span className="text-[var(--accent)] text-lg">&#10003;</span>
        <span>{feature}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 text-[15px] font-medium">
      <span className="text-[var(--accent)] text-lg">&#10003;</span>
      <span className="flex items-center gap-1.5">
        {feature.text}
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Info" className="inline-flex text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <InfoIcon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm leading-relaxed">
            {feature.tooltip}
          </TooltipContent>
        </Tooltip>
      </span>
    </li>
  );
}

export function PricingSection() {
  const t = useTranslations("pricing");

  const payFeatures = t.raw("pay.features") as FeatureItem[];
  const proFeatures = t.raw("pro.features") as FeatureItem[];

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="max-w-[1000px] mx-auto px-6">
        {/* Header Section */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-widest">
            {t("badge")}
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg lg:text-xl font-medium max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Pricing Cards */}
        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Starter Tier Card */}
          <div className="group flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--cream)] p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col gap-4 mb-8">
              <h3 className="text-2xl font-bold">{t("pay.name")}</h3>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">
                {t("pay.tagline")}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tight">&euro;{t("pay.price")}</span>
                <span className="text-[var(--muted-foreground)] text-lg font-bold">{t("perMonth")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 mb-8">
              <p className="text-xs font-extrabold text-[var(--muted-foreground)] uppercase tracking-widest">
                {t("pay.featuresLabel")}
              </p>
              <ul className="flex flex-col gap-4">
                {payFeatures.map((feature, i) => (
                  <FeatureListItem key={i} feature={feature} />
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <Link
                href="/onboarding"
                className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 border-2 border-[var(--foreground)] text-[var(--foreground)] text-base font-extrabold transition-all hover:bg-[var(--foreground)] hover:text-white"
              >
                <span>{t("cta")}</span>
              </Link>
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                {t("ctaSubtext")}
              </p>
            </div>
          </div>

          {/* Growth Tier Card (Highlighted - Founding Partner) */}
          <div className="relative flex flex-col rounded-3xl border-[3px] border-[var(--accent)] bg-[var(--cream)] p-8 lg:p-10 shadow-2xl scale-[1.02] z-10">
            {/* Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap text-center">
                {t("foundingPartner")}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <h3 className="text-2xl font-bold">{t("pro.name")}</h3>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">
                {t("pro.tagline")}
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--muted-foreground)] line-through">&euro;{t("pro.originalPrice")}</span>
                  <span className="text-sm font-semibold text-[var(--accent)]">{t("pro.freeMonths")}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight">&euro;{t("pro.foundingPrice")}</span>
                  <span className="text-[var(--muted-foreground)] text-lg font-bold">{t("pro.forLife")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 mb-8">
              <p className="text-xs font-extrabold text-[var(--muted-foreground)] uppercase tracking-widest">
                {t("pro.featuresLabel")}
              </p>
              <ul className="flex flex-col gap-4">
                {proFeatures.map((feature, i) => (
                  <FeatureListItem key={i} feature={feature} />
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <Link
                href="/onboarding"
                className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 bg-[var(--accent)] text-white text-base font-extrabold shadow-lg shadow-[var(--accent)]/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>{t("cta")}</span>
              </Link>
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                {t("ctaSubtext")}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
