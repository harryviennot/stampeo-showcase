import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";

export async function VariantFinalCTA() {
  const t = await getTranslations("variant.finalCta");

  return (
    <section className="relative stamp-pattern flex flex-col items-center justify-center px-4 sm:px-6 py-16 lg:py-24 text-center overflow-hidden">
      <ScrollReveal className="relative z-10 max-w-[840px] mx-auto flex flex-col items-center gap-6">
        <h2 className="text-display">
          {t.rich("title", {
            accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
          })}
        </h2>

        <p className="text-lead text-[var(--muted-foreground)] max-w-2xl">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <CTAButton label={t("primaryCta")} trackAs="final_cta" />
          <CTAButton
            label={t("secondaryCta")}
            href="/contact?type=demo"
            size="md"
            variant="link"
            showArrow={false}
            trackAs="final_cta_demo"
          />
        </div>

        <p className="text-sm text-[var(--muted-foreground)] font-medium">
          {t("reassurance")}
        </p>
      </ScrollReveal>
    </section>
  );
}
