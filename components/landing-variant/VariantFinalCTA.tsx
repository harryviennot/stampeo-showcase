import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";

export async function VariantFinalCTA() {
  const t = await getTranslations("variant.finalCta");

  return (
    <section className="relative stamp-pattern flex flex-col items-center justify-center px-6 py-24 md:py-32 lg:py-40 text-center overflow-hidden">
      <ScrollReveal className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-10">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05]">
          {t.rich("title", {
            accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
          })}
        </h2>

        <p className="text-[var(--muted-foreground)] text-lg md:text-xl font-medium max-w-2xl">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <CTAButton label={t("primaryCta")} size="xl" trackAs="final_cta" />
          <CTAButton
            label={t("secondaryCta")}
            href="/contact?type=demo"
            size="xl"
            variant="outline"
            showArrow={false}
            trackAs="final_cta_demo"
          />
        </div>

        <p className="text-sm md:text-base text-[var(--muted-foreground)] font-medium">
          {t("reassurance")}
        </p>
      </ScrollReveal>
    </section>
  );
}
