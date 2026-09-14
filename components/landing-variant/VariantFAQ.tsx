import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { FAQList } from "../ui/FAQList";
import { CTAButton } from "../ui/CTAButton";

/**
 * `faqs` arrive already interpolated, from VariantLanding. That is deliberate:
 * the same array feeds `faqPageJsonLd`, and interpolating in two places once
 * meant the structured data shipped the raw "{starterPrice}" token to Google.
 */
export async function VariantFAQ({
  faqs,
}: Readonly<{ faqs: Array<{ question: string; answer: string }> }>) {
  const t = await getTranslations("variant.faq");

  return (
    <section id="faq" className="relative py-16 lg:py-24 overflow-hidden">
      <div className="max-w-[840px] mx-auto px-6 relative z-10">
        <ScrollReveal className="mb-12">
          <h2 className="text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 text-lead text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <FAQList items={faqs} />
        </ScrollReveal>

        <ScrollReveal
          delay={400}
          className="mt-20 p-10 bg-[var(--foreground)] rounded-xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
          <h3 className="text-white text-h2 mb-4">{t("stillQuestions")}</h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            {t("stillQuestionsDesc")}
          </p>
          <div className="flex justify-center">
            <CTAButton
              label={t("contactSupport")}
              href="/contact"
              size="md"
              variant="secondary"
              showArrow={false}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
