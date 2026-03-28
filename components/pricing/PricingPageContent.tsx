"use client";

import { Fragment, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, CaretDown } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PRICING } from "@/lib/pricing";
import { FEATURE_CATEGORIES, type CellType } from "@/lib/pricing-features";

function PricingCard({
  tier,
  price,
  highlighted,
  comingSoon,
}: {
  tier: "starter" | "growth" | "pro";
  price: number;
  highlighted?: boolean;
  comingSoon?: boolean;
}) {
  const t = useTranslations("pricingPage");
  const features = t.raw(`${tier}.features`) as string[];

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 lg:p-10 transition-all duration-300 ${
        comingSoon
          ? "border border-[var(--border)] bg-[var(--cream)] opacity-60"
          : highlighted
            ? "border-[3px] border-[var(--accent)] bg-[var(--cream)] shadow-2xl lg:scale-[1.03] z-10"
            : "border border-[var(--border)] bg-[var(--cream)] shadow-sm hover:shadow-xl"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-[var(--accent)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            {t("popular")}
          </div>
        </div>
      )}

      {comingSoon && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] whitespace-nowrap">
            {t("comingSoon")}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-8">
        <h3
          className={`text-2xl font-bold ${comingSoon ? "text-[var(--muted-foreground)]" : ""}`}
        >
          {t(`${tier}.name`)}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] font-medium">
          {t(`${tier}.tagline`)}
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-5xl font-black tracking-tight ${comingSoon ? "text-[var(--muted-foreground)]" : ""}`}
          >
            &euro;{price}
          </span>
          <span className="text-[var(--muted-foreground)] text-lg font-bold">
            {t("perMonth")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 mb-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3 text-[15px] font-medium">
            <span
              className={`text-lg mt-0.5 ${comingSoon ? "text-[var(--muted-foreground)]" : "text-[var(--accent)]"}`}
            >
              &#10003;
            </span>
            <span className={comingSoon ? "text-[var(--muted-foreground)]" : ""}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {comingSoon ? (
          <div className="w-full flex items-center justify-center rounded-full h-14 px-6 border-2 border-[var(--border)] text-[var(--muted-foreground)] text-base font-extrabold cursor-not-allowed">
            {t("ctaComingSoon")}
          </div>
        ) : highlighted ? (
          <Link
            href="/onboarding"
            className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 bg-[var(--accent)] text-white text-base font-extrabold shadow-lg shadow-[var(--accent)]/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            {t("cta")}
          </Link>
        ) : (
          <Link
            href="/onboarding"
            className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 border-2 border-[var(--foreground)] text-[var(--foreground)] text-base font-extrabold transition-all hover:bg-[var(--foreground)] hover:text-white"
          >
            {t("cta")}
          </Link>
        )}
        {!comingSoon && (
          <p className="text-xs text-center text-[var(--muted-foreground)] mt-2">
            {t("ctaSubtext")}
          </p>
        )}
      </div>
    </div>
  );
}

function CellValue({
  type,
  text,
  muted,
}: {
  type: CellType;
  text?: string;
  muted?: boolean;
}) {
  if (type === "check") {
    return (
      <Check
        className={`w-5 h-5 ${muted ? "text-[var(--muted-foreground)]" : "text-green-500"}`}
        weight="bold"
      />
    );
  }
  if (type === "cross") {
    return <X className="w-5 h-5 text-[var(--border)]" weight="bold" />;
  }
  return (
    <span
      className={`text-sm font-medium ${muted ? "text-[var(--muted-foreground)]" : ""}`}
    >
      {text}
    </span>
  );
}

const TIERS = ["starter", "growth", "pro"] as const;
type Tier = (typeof TIERS)[number];

const TIER_PRICES: Record<Tier, number> = {
  starter: PRICING.starter.price,
  growth: PRICING.growth.price,
  pro: PRICING.pro.price,
};

function FeatureComparisonTable() {
  const t = useTranslations("pricingPage");
  const [mobileTier, setMobileTier] = useState<Tier>("growth");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Build a flat row index for alternating colors (skip category headers)
  let globalRowIndex = 0;

  return (
    <div className="mt-24 lg:mt-32">
      <ScrollReveal className="text-center mb-12">
        <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
          {t("comparison.title")}
        </h2>
        <p className="text-[var(--muted-foreground)] text-lg mt-4 max-w-2xl mx-auto">
          {t("comparison.subtitle")}
        </p>
      </ScrollReveal>

      {/* Desktop Table */}
      <ScrollReveal delay={200} className="hidden md:block">
        <div className="bg-white blog-card-3d rounded-3xl overflow-hidden hover:!transform-none hover:!shadow-[0_3px_0_var(--near-black)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-6 w-[34%]" />
                <th className="p-6 text-center w-[22%]">
                  <div className="text-sm font-bold">{t("starter.name")}</div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-1">
                    &euro;{PRICING.starter.price}{t("perMonth")}
                  </div>
                </th>
                <th className="p-6 text-center w-[22%] bg-[var(--accent)]/5">
                  <div className="text-sm font-bold text-[var(--accent)]">
                    {t("growth.name")}
                  </div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-1">
                    &euro;{PRICING.growth.price}{t("perMonth")}
                  </div>
                </th>
                <th className="p-6 text-center w-[22%] opacity-50">
                  <div className="text-sm font-bold text-[var(--muted-foreground)]">
                    {t("pro.name")}
                  </div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-1">
                    &euro;{PRICING.pro.price}{t("perMonth")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_CATEGORIES.map((category) => (
                <Fragment key={category.key}>
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 pt-8 pb-2 text-sm font-bold text-[var(--foreground)]"
                    >
                      {t(`comparison.categories.${category.key}`)}
                    </td>
                  </tr>
                  {category.rows.map((row) => {
                    const rowData = t.raw(
                      `comparison.rows.${row.key}`
                    ) as Record<string, string>;
                    const isEven = globalRowIndex % 2 === 0;
                    globalRowIndex++;

                    return (
                      <tr
                        key={row.key}
                        className={`border-t border-[var(--border)]/50 hover:bg-[var(--cream)]/50 transition-colors ${isEven ? "bg-[var(--muted)]/30" : ""}`}
                      >
                        <td className="px-6 py-2.5 text-[13px] font-medium text-[var(--muted-foreground)]">
                          {rowData.label}
                        </td>
                        <td className="px-6 py-2.5 text-center">
                          <span className="inline-flex justify-center">
                            <CellValue
                              type={row.starter}
                              text={rowData.starter}
                            />
                          </span>
                        </td>
                        <td className="px-6 py-2.5 text-center bg-[var(--accent)]/5">
                          <span className="inline-flex justify-center">
                            <CellValue
                              type={row.growth}
                              text={rowData.growth}
                            />
                          </span>
                        </td>
                        <td className="px-6 py-2.5 text-center opacity-50">
                          <span className="inline-flex justify-center">
                            <CellValue
                              type={row.pro}
                              text={rowData.pro}
                              muted
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>

      {/* Mobile: tier selector + single column */}
      <div className="md:hidden">
        <ScrollReveal delay={200}>
          {/* Tier selector dropdown */}
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-xl border border-[var(--border)] text-sm font-bold shadow-sm"
            >
              <span className={mobileTier === "growth" ? "text-[var(--accent)]" : ""}>
                {t(`${mobileTier}.name`)} — &euro;{TIER_PRICES[mobileTier]}{t("perMonth")}
              </span>
              <CaretDown
                className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                weight="bold"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[var(--border)] shadow-lg z-20 overflow-hidden">
                {TIERS.map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      setMobileTier(tier);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-colors ${
                      mobileTier === tier
                        ? "bg-[var(--accent)]/5 text-[var(--accent)]"
                        : "hover:bg-[var(--cream)]"
                    } ${tier === "pro" ? "opacity-50" : ""}`}
                  >
                    <span>{t(`${tier}.name`)}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      &euro;{TIER_PRICES[tier]}{t("perMonth")}
                      {tier === "pro" && ` · ${t("comingSoon")}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Single-tier feature list */}
          <div className="bg-white blog-card-3d rounded-2xl overflow-hidden hover:!transform-none hover:!shadow-[0_3px_0_var(--near-black)]">
            {FEATURE_CATEGORIES.map((category) => (
              <div key={category.key}>
                <div className="px-5 pt-5 pb-1.5 text-xs font-bold text-[var(--foreground)]">
                  {t(`comparison.categories.${category.key}`)}
                </div>
                {category.rows.map((row, rowIdx) => {
                  const rowData = t.raw(
                    `comparison.rows.${row.key}`
                  ) as Record<string, string>;
                  const cellType = row[mobileTier];
                  const cellText = rowData[mobileTier];

                  return (
                    <div
                      key={row.key}
                      className={`flex items-center justify-between px-5 py-2.5 border-t border-[var(--border)]/50 ${
                        rowIdx % 2 === 0 ? "bg-[var(--muted)]/30" : ""
                      } ${mobileTier === "pro" ? "opacity-50" : ""}`}
                    >
                      <span className="text-[13px] font-medium text-[var(--muted-foreground)]">
                        {rowData.label}
                      </span>
                      <span className="text-[13px] font-medium shrink-0 ml-4">
                        <CellValue
                          type={cellType}
                          text={cellText}
                          muted={mobileTier === "pro"}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function PricingFAQ() {
  const t = useTranslations("pricingPage");
  const faqs = t.raw("faq.items") as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <div className="mt-24 lg:mt-32">
      <ScrollReveal className="mb-12">
        <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
          {t("faq.title")}
        </h2>
        <p className="mt-4 text-[var(--muted-foreground)] text-lg font-medium">
          {t("faq.subtitle")}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={200} className="flex flex-col gap-4">
        {faqs.map((faq, index) => (
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
                <span className="text-xl font-bold">&#8595;</span>
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
  );
}

export function PricingPageContent() {
  const t = useTranslations("pricingPage");
  const locale = useLocale();
  const foundingHref =
    locale === "en" ? "/founding-partner" : "/programme-fondateur";

  return (
    <div className="max-w-[1200px] mx-auto px-6">
      {/* Hero */}
      <ScrollReveal className="text-center pt-32 lg:pt-40 pb-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold mb-6">
          {t("hero.badge")}
        </span>
        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">
          {t("hero.title")}
        </h1>
        <p className="text-[var(--muted-foreground)] text-lg lg:text-xl font-medium max-w-2xl mx-auto">
          {t("hero.subtitle")}
        </p>

        {/* Founding partner callout */}
        <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/20">
          <span className="text-sm font-semibold text-[var(--accent)]">
            {t("foundingCallout")}
          </span>
          <Link
            href={foundingHref}
            className="text-sm font-bold text-[var(--accent)] underline underline-offset-2 hover:no-underline inline-flex items-center gap-1"
          >
            {t("foundingLink")}
            <ArrowRight className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>
      </ScrollReveal>

      {/* Pricing Cards */}
      <ScrollReveal
        delay={200}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-md lg:max-w-none mx-auto mt-12"
      >
        <PricingCard tier="starter" price={PRICING.starter.price} />
        <PricingCard tier="growth" price={PRICING.growth.price} highlighted />
        <PricingCard tier="pro" price={PRICING.pro.price} comingSoon />
      </ScrollReveal>

      {/* Feature Comparison Table */}
      <FeatureComparisonTable />

      {/* FAQ */}
      <PricingFAQ />

      {/* Bottom CTA */}
      <ScrollReveal
        delay={200}
        className="mt-24 mb-20 p-10 lg:p-16 bg-[var(--foreground)] rounded-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
        <h2 className="text-white text-3xl lg:text-4xl font-bold mb-4">
          {t("cta2.title")}
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          {t("cta2.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/onboarding"
            className="bg-[var(--accent)] hover:brightness-110 text-white px-8 py-3 rounded-full font-bold transition-all"
          >
            {t("cta2.button")}
          </Link>
          <Link
            href="/contact"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold transition-all border border-white/10"
          >
            {t("cta2.contact")}
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
