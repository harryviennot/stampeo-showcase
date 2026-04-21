import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { PRICING } from "@/lib/pricing";

export async function FinalCTASection() {
  const t = await getTranslations("landing.finalCta");
  const tb = await getTranslations("common.buttons");

  return (
    <section className="relative stamp-pattern flex flex-col items-center justify-center px-6 py-24 md:py-32 lg:py-48 text-center overflow-hidden">
      {/* Central Content */}
      <ScrollReveal className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05]">
          {t.rich("title", {
            accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
          })}
        </h2>

        <div className="flex flex-col items-center gap-6">
          <CTAButton label={tb("startFree")} size="xl" />

          <p className="text-[var(--muted-foreground)] text-sm md:text-base font-medium">
            {t("subtitle", { price: PRICING.starter.foundingPrice })}
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
