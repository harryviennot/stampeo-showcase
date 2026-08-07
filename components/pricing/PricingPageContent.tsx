"use client";

import { Fragment, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CTAButton } from "@/components/ui/CTAButton";
import { Check, X, CaretDown } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  formatPrice,
  isFoundingProgramOpen,
  tierPrice,
  yearlyCardView,
  type BillingInterval,
} from "@/lib/pricing";
import { PricingTierCard } from "@/components/pricing/PricingTierCard";
import { BillingIntervalToggle } from "@/components/pricing/BillingIntervalToggle";
import { ROICalculator } from "@/components/pricing/ROICalculator";
import { FEATURE_CATEGORIES, type CellType } from "@/lib/pricing-features";

function PricingCard({
  tier,
  highlighted,
  interval,
  foundingOpen,
}: {
  tier: "starter" | "growth" | "pro";
  highlighted?: boolean;
  interval: BillingInterval;
  foundingOpen: boolean;
}) {
  const t = useTranslations("pricingPage");
  const locale = useLocale();
  const view = yearlyCardView(tier, interval, foundingOpen);

  return (
    <PricingTierCard
      name={t(`${tier}.name`)}
      tagline={t(`${tier}.tagline`)}
      features={t.raw(`${tier}.features`) as string[]}
      price={view.price}
      discount={view.discount}
      // Both cadences quote a per-MONTH figure so the two are directly
      // comparable; the yearly total moves to the sub-label below.
      perMonthLabel={t("perMonth")}
      forLifeLabel={view.isYearly ? t("perMonth") : t("forLife")}
      subLabel={
        view.isYearly
          ? t("billedYearlyTotal", {
              price: formatPrice(view.yearlyTotal, locale),
              saving: formatPrice(view.yearlySaving, locale),
            })
          : t("billedMonthly")
      }
      featuresLabel={t(`${tier}.featuresLabel`)}
      cta={t("cta")}
      ctaHref="/onboarding"
      ctaSubtext={t("ctaSubtext")}
      highlighted={highlighted}
      popularLabel={t("popular")}
      annotationLabel={t("annotation")}
    />
  );
}

function CellValue({ type, text }: { type: CellType; text?: string }) {
  const t = useTranslations("pricingPage");
  if (type === "check") {
    return <Check className="w-5 h-5 text-green-500" weight="bold" />;
  }
  if (type === "cross") {
    return <X className="w-5 h-5 text-[var(--border)]" weight="bold" />;
  }
  if (type === "soon") {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)] whitespace-nowrap">
        {t("comparison.soon")}
      </span>
    );
  }
  return <span className="text-sm font-medium">{text}</span>;
}

const TIERS = ["starter", "growth", "pro"] as const;
type Tier = (typeof TIERS)[number];

/**
 * The comparison table always quotes MONTHLY prices, whatever the cards above
 * are showing: it is a feature reference, and mixing cadences mid-page makes
 * the columns unreadable. The label below says so.
 */
function FeatureComparisonTable() {
  const t = useTranslations("pricingPage");
  const [mobileTier, setMobileTier] = useState<Tier>("growth");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Every category starts closed. The full table is 20 rows and was more than
  // half the page; people who want the detail open the part they care about.
  const [openCategories, setOpenCategories] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const toggleCategory = (key: string) =>
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Build a flat row index for alternating colors (skip category headers)
  let globalRowIndex = 0;

  return (
    <div className="mt-16 lg:mt-24">
      <ScrollReveal className="text-center mb-12">
        <h2 className="text-h2">{t("comparison.title")}</h2>
        <p className="text-lead text-[var(--muted-foreground)] mt-4 max-w-2xl mx-auto">
          {t("comparison.subtitle")}
        </p>
        <p className="text-[var(--muted-foreground)] text-sm mt-2 max-w-2xl mx-auto">
          {t("comparisonMonthlyNote")}
        </p>
      </ScrollReveal>

      {/* Desktop Table */}
      <ScrollReveal delay={200} className="hidden md:block">
        <div className="bg-white border border-[var(--border)] shadow-sm rounded-3xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-6 w-[34%]" />
                <th className="p-6 text-center w-[22%]">
                  <div className="text-sm font-bold">{t("starter.name")}</div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-1">
                    &euro;{tierPrice("starter", "month")}{t("perMonth")}
                  </div>
                </th>
                <th className="p-6 text-center w-[22%] bg-[var(--accent)]/5">
                  <div className="text-sm font-bold text-[var(--accent)]">
                    {t("growth.name")}
                  </div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-1">
                    &euro;{tierPrice("growth", "month")}{t("perMonth")}
                  </div>
                </th>
                <th className="p-6 text-center w-[22%]">
                  <div className="text-sm font-bold">{t("pro.name")}</div>
                  <div className="text-[var(--muted-foreground)] text-xs mt-1">
                    &euro;{tierPrice("pro", "month")}{t("perMonth")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_CATEGORIES.map((category) => (
                <Fragment key={category.key}>
                  <tr className="border-t border-[var(--border)]/50">
                    <td colSpan={4} className="p-0">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.key)}
                        aria-expanded={openCategories.has(category.key)}
                        className="flex w-full items-center justify-between px-6 py-4 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--cream)]/50 transition-colors"
                      >
                        {t(`comparison.categories.${category.key}`)}
                        <CaretDown
                          className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${
                            openCategories.has(category.key) ? "rotate-180" : ""
                          }`}
                          weight="bold"
                        />
                      </button>
                    </td>
                  </tr>
                  {openCategories.has(category.key) && category.rows.map((row) => {
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
                        <td className="px-6 py-2.5 text-center">
                          <span className="inline-flex justify-center">
                            <CellValue type={row.pro} text={rowData.pro} />
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
                {t(`${mobileTier}.name`)} &middot; &euro;{tierPrice(mobileTier, "month")}{t("perMonth")}
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
                    }`}
                  >
                    <span>{t(`${tier}.name`)}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      &euro;{tierPrice(tier, "month")}{t("perMonth")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Single-tier feature list, one collapsed group per category */}
          <div className="bg-white border border-[var(--border)] shadow-sm rounded-2xl overflow-hidden">
            {FEATURE_CATEGORIES.map((category) => (
              <details
                key={category.key}
                className="group border-t border-[var(--border)]/50 first:border-t-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-[var(--foreground)]">
                  {t(`comparison.categories.${category.key}`)}
                  <CaretDown
                    className="w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180"
                    weight="bold"
                  />
                </summary>
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
                      }`}
                    >
                      <span className="text-[13px] font-medium text-[var(--muted-foreground)]">
                        {rowData.label}
                      </span>
                      <span className="text-[13px] font-medium shrink-0 ml-4">
                        <CellValue type={cellType} text={cellText} />
                      </span>
                    </div>
                  );
                })}
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function PricingFAQ({ foundingOpen }: { foundingOpen: boolean }) {
  const t = useTranslations("pricingPage");
  const allFaqs = t.raw("faq.items") as Array<{
    question: string;
    answer: string;
    foundingOnly?: boolean;
  }>;
  const faqs = foundingOpen ? allFaqs : allFaqs.filter((f) => !f.foundingOnly);

  return (
    <div className="mt-16 lg:mt-24 max-w-[840px] mx-auto">
      <ScrollReveal className="mb-12">
        <h2 className="text-h2">{t("faq.title")}</h2>
        <p className="mt-4 text-lead text-[var(--muted-foreground)]">
          {t("faq.subtitle")}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={200} className="flex flex-col gap-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group flex flex-col rounded-xl bg-white border border-[var(--border)] shadow-sm px-6 py-4"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
              <p className="text-base font-semibold leading-normal group-hover:text-[var(--accent)] transition-colors">
                {faq.question}
              </p>
              <div className="text-[var(--muted-foreground)] transition-transform duration-300 group-open:rotate-180 group-open:text-[var(--accent)]">
                <span className="text-xl font-bold">&#8595;</span>
              </div>
            </summary>
            <div className="pt-2 pb-4">
              <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
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
  const foundingOpen = isFoundingProgramOpen();
  // Yearly is the default: it is the price we want anchored, and the monthly
  // equivalent it shows (with the yearly total spelled out underneath) is what
  // every comparable pricing page leads with.
  const [interval, setInterval] = useState<BillingInterval>("year");

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero: title, toggle, price. Nothing between them. */}
      <ScrollReveal className="text-center pt-28 lg:pt-32">
        <h1 className="text-h1 mb-4">{t("hero.title")}</h1>
        <p className="text-lead text-[var(--muted-foreground)] max-w-2xl mx-auto">
          {t("hero.subtitle")}
        </p>
      </ScrollReveal>

      {/* Billing cycle switcher */}
      <ScrollReveal delay={150} className="mt-8">
        <BillingIntervalToggle value={interval} onChange={setInterval} />
      </ScrollReveal>

      {/* Pricing Cards. Cheap-to-expensive at every width — the stacked mobile
          order matches the desktop one. */}
      <ScrollReveal
        delay={200}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-md lg:max-w-none mx-auto mt-8 lg:mt-14"
      >
        <PricingCard
          tier="starter"
          interval={interval}
          foundingOpen={foundingOpen}
        />
        <PricingCard
          tier="growth"
          interval={interval}
          foundingOpen={foundingOpen}
          highlighted
        />
        <PricingCard
          tier="pro"
          interval={interval}
          foundingOpen={foundingOpen}
        />
      </ScrollReveal>

      {foundingOpen && (
        <ScrollReveal delay={300} className="mt-8 text-center">
          <p className="text-[var(--muted-foreground)] text-sm font-medium max-w-2xl mx-auto">
            {t("foundingReassurance")}
          </p>
        </ScrollReveal>
      )}

      {/* Feature Comparison Table */}
      <FeatureComparisonTable />

      {/* "Is it worth it?" simulator — rehomed here when the founding page
          retired. Measured against the public Growth price. */}
      <ROICalculator />

      {/* FAQ */}
      <PricingFAQ foundingOpen={foundingOpen} />

      {/* Bottom CTA */}
      <ScrollReveal
        delay={200}
        className="mt-16 lg:mt-24 mb-20 p-10 lg:p-14 bg-[var(--foreground)] rounded-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
        <h2 className="text-white text-h2 mb-4">{t("cta2.title")}</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          {t("cta2.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <CTAButton
            label={t("cta2.button")}
            size="md"
            showArrow={false}
          />
          <CTAButton
            label={t("cta2.contact")}
            href="/contact"
            size="md"
            variant="secondary"
            showArrow={false}
          />
        </div>
      </ScrollReveal>
    </div>
  );
}
