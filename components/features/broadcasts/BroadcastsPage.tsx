"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  MegaphoneIcon,
  AppleIcon,
  GoogleIcon,
  TargetIcon,
  ClockIcon,
  TranslateIcon,
  ChartPieSliceIcon,
  CheckIcon,
  X,
} from "@/components/icons";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { FeaturePrivacy } from "@/components/features/FeaturePrivacy";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";
import { JsonLd } from "@/components/JsonLd";
import { faqPageJsonLd } from "@/lib/structured-data";

const capabilityIcons = [TargetIcon, ClockIcon, TranslateIcon, ChartPieSliceIcon];

type DeliveryTint = "apple" | "google" | "muted";

const deliveryTintClass: Record<DeliveryTint, string> = {
  apple: "bg-[var(--foreground)] text-white",
  google: "bg-[var(--accent)] text-white",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function WalletBadge({ kind }: { kind: "apple" | "google" }) {
  if (kind === "apple") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold">
        <AppleIcon className="w-4 h-4" />
        Apple Wallet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[var(--border)] text-xs font-semibold">
      <GoogleIcon className="w-4 h-4" />
      Google Wallet
    </span>
  );
}

export function BroadcastsPage() {
  const t = useTranslations("features");
  const tp = useTranslations("features.campagnes-promotionnelles");

  const stats = tp.raw("statBand.stats") as {
    value: string;
    label: string;
    caption: string;
  }[];

  const whyColumns = tp.raw("whyNotSms.columns") as string[];
  const whyRows = tp.raw("whyNotSms.rows") as {
    label: string;
    values: string[];
  }[];

  const capabilities = tp.raw("capabilities.items") as {
    title: string;
    description: string;
    badge?: string;
  }[];

  const deliveryMetrics = tp.raw("delivery.metrics") as {
    label: string;
    value: number;
    tint: DeliveryTint;
  }[];

  const useCases = tp.raw("useCases.items") as {
    emoji: string;
    title: string;
    description: string;
  }[];

  const tierColumns = tp.raw("tierMatrix.columns") as string[];
  const tierRows = tp.raw("tierMatrix.rows") as {
    label: string;
    values: string[];
  }[];

  const faqItems = tp.raw("faq.items") as {
    question: string;
    answer: string;
  }[];

  const related = tp.raw("related") as string[];

  const deliveryTotal = deliveryMetrics.reduce((sum, m) => sum + m.value, 0);

  return (
    <>
      <JsonLd data={faqPageJsonLd(faqItems)} />

      {/* ============ 1. Hero ============ */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 right-[8%] w-80 h-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-56 h-56 rounded-full bg-[var(--stamp-coral)]/10 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--accent)]/10 shadow-sm mb-6">
                <MegaphoneIcon className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-bold tracking-wide">
                  {tp("heroBadge")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
                {tp("hero.title")}
              </h1>

              <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto mb-10">
                {tp("hero.subtitle")}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-wide">
                  {tp("hero.pillGrowth")}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--foreground)]/5 text-[var(--foreground)] text-xs font-bold uppercase tracking-wide">
                  {tp("hero.pillPro")}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
                >
                  <span>{t("ctaButton")}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-3 pt-8">
                <WalletBadge kind="apple" />
                <WalletBadge kind="google" />
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ============ 2. Stat band ============ */}
      <section className="py-20 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("statBand.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("statBand.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-white rounded-2xl blog-card-3d p-8 h-full">
                  <div className="text-5xl font-extrabold text-[var(--accent)] tracking-tight mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-bold text-[var(--foreground)] mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {stat.caption}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ 3. Why not SMS — comparison table ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("whyNotSms.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("whyNotSms.subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="bg-white rounded-2xl blog-card-3d overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--blog-bg)]">
                      {whyColumns.map((col, i) => (
                        <th
                          key={i}
                          className={`p-5 text-sm font-bold ${
                            i === 3
                              ? "text-[var(--accent)]"
                              : i === 0
                                ? "text-[var(--muted-foreground)]"
                                : "text-[var(--foreground)]"
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {whyRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-t border-[var(--border)]/50"
                      >
                        <td className="p-5 text-sm font-semibold text-[var(--foreground)] w-[28%]">
                          {row.label}
                        </td>
                        {row.values.map((value, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`p-5 text-sm leading-relaxed ${
                              cellIdx === 2
                                ? "text-[var(--foreground)] font-semibold bg-[var(--accent)]/[0.04]"
                                : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          <p className="mt-6 text-xs text-[var(--muted-foreground)] text-center italic max-w-3xl mx-auto">
            {tp("whyNotSms.caption")}
          </p>
        </Container>
      </section>

      {/* ============ 4. How it works ============ */}
      <HowItWorks
        translationKey="features.campagnes-promotionnelles.howItWorks"
        sectionClassName="py-20 sm:py-28 relative bg-[var(--blog-bg-alt)]"
        id="how-broadcasts-work"
      />

      {/* ============ 5. Capabilities ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("capabilities.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("capabilities.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {capabilities.map((item, index) => {
              const Icon = capabilityIcons[index] || TargetIcon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <div className="relative p-8 bg-white rounded-2xl blog-card-3d h-full transition-transform duration-300 hover:-translate-y-1">
                    {item.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {item.badge}
                      </span>
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============ 6. Delivery transparency ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("delivery.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("delivery.subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl blog-card-3d p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <ChartPieSliceIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide">
                    Broadcast #124
                  </div>
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {deliveryTotal} recipients
                  </div>
                </div>
              </div>

              <div className="flex h-3 w-full rounded-full overflow-hidden bg-[var(--muted)]">
                {deliveryMetrics.map((metric, i) => {
                  const pct = deliveryTotal === 0 ? 0 : (metric.value / deliveryTotal) * 100;
                  return (
                    <div
                      key={i}
                      className={deliveryTintClass[metric.tint]}
                      style={{ width: `${pct}%` }}
                      aria-label={`${metric.label}: ${metric.value}`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {deliveryMetrics.map((metric, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm ${deliveryTintClass[metric.tint]}`}
                      />
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        {metric.label}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                      {metric.value.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)] pt-6">
                {tp("delivery.note")}
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 7. Use cases ============ */}
      <section className="py-20 sm:py-28">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("useCases.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("useCases.subtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="p-8 bg-white rounded-2xl blog-card-3d h-full">
                  <div className="text-4xl mb-4" aria-hidden>
                    {item.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ 8. Tier matrix ============ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("tierMatrix.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("tierMatrix.subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="bg-white rounded-2xl blog-card-3d overflow-hidden max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--blog-bg)]">
                      {tierColumns.map((col, i) => (
                        <th
                          key={i}
                          className={`p-5 text-sm font-bold ${
                            i === 2 ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tierRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-t border-[var(--border)]/50"
                      >
                        <td className="p-5 text-sm font-semibold text-[var(--foreground)] w-[32%]">
                          {row.label}
                        </td>
                        {row.values.map((value, cellIdx) => {
                          const isDash = value === "—";
                          const isGrowth = cellIdx === 1;
                          return (
                            <td
                              key={cellIdx}
                              className={`p-5 text-sm ${
                                isDash
                                  ? "text-[var(--muted-foreground)]"
                                  : isGrowth
                                    ? "text-[var(--foreground)] font-semibold bg-[var(--accent)]/[0.04]"
                                    : "text-[var(--foreground)] font-medium"
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                {isDash ? (
                                  <X className="w-4 h-4 text-[var(--border)]" weight="bold" />
                                ) : (
                                  <CheckIcon className="w-4 h-4 text-[var(--stamp-sage)]" />
                                )}
                                {value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ============ 9. Privacy ============ */}
      <FeaturePrivacy
        title={tp("privacy.title")}
        subtitle={tp("privacy.subtitle")}
        points={tp.raw("privacy.points") as string[]}
        gdprLabel={tp("privacy.gdprLabel")}
      />

      {/* ============ 10. FAQ ============ */}
      <section className="py-20 sm:py-28">
        <Container className="max-w-3xl">
          <ScrollReveal className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {tp("faq.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              {tp("faq.subtitle")}
            </p>
          </ScrollReveal>

          <div className="flex flex-col gap-4">
            {faqItems.map((item, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <details className="group bg-white rounded-2xl blog-card-3d p-6 open:ring-1 open:ring-[var(--accent)]/20">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {item.question}
                    </h3>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] group-open:rotate-45 transition-transform font-bold">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ 11. CTA ============ */}
      <FeatureCTA title={tp("cta.title")} subtitle={tp("cta.subtitle")} />

      <RelatedFeatures related={related} />
    </>
  );
}
