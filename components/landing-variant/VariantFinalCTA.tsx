import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { interpolatePricing, type Pricing } from "@/lib/pricing";
import { marketCopy } from "@/lib/market-copy";
import { type Market } from "@/lib/markets";

export async function VariantFinalCTA({
  trialDays,
  pricing,
  locale,
  market = "int",
}: Readonly<{ pricing: Pricing; locale: string; trialDays: number; market?: Market }>) {
  const t = await getTranslations("variant");
  const copy = marketCopy(t, market);

  return (
    <section className="relative stamp-pattern flex flex-col items-center justify-center px-4 sm:px-6 py-16 lg:py-24 text-center overflow-hidden">
      <ScrollReveal className="relative z-10 max-w-[840px] mx-auto flex flex-col items-center gap-6">
        <h2 className="text-display">
          {copy.rich("finalCta.title", {
            accent: (chunks: ReactNode) => (
              <span className="text-[var(--accent)]">{chunks}</span>
            ),
          })}
        </h2>

        <p className="text-lead text-[var(--muted-foreground)] max-w-2xl">
          {/* t.raw: the pricing tokens are ours, not ICU's. */}
          {interpolatePricing(copy.raw("finalCta.subtitle") as string, pricing, locale, trialDays)}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <CTAButton label={copy.t("finalCta.primaryCta")} trackAs="final_cta" />
          <CTAButton
            label={copy.t("finalCta.secondaryCta")}
            href="/contact?type=demo"
            size="md"
            variant="link"
            showArrow={false}
            trackAs="final_cta_demo"
          />
        </div>

        <p className="text-sm text-[var(--muted-foreground)] font-medium">
          {copy.t("finalCta.reassurance", { trialDays })}
        </p>
      </ScrollReveal>
    </section>
  );
}
