import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { marketCopy } from "@/lib/market-copy";
import { type Market } from "@/lib/markets";
import { RegionText } from "@/components/market/RegionText";

export async function VariantFinalCTA({
  market = "int",
}: Readonly<{ market?: Market }>) {
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
          {/* t.raw: the pricing tokens are ours, not ICU's. The client leaf
              resolves them to the visitor's region (STA-330). */}
          <RegionText raw={copy.raw("finalCta.subtitle") as string} />
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
          <RegionText raw={copy.raw("finalCta.reassurance") as string} />
        </p>
      </ScrollReveal>
    </section>
  );
}
