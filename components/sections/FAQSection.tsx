import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { FAQList } from "../ui/FAQList";
import { CTAButton } from "../ui/CTAButton";
import { interpolatePricing } from "@/lib/pricing";

export async function FAQSection() {
  const t = await getTranslations("landing.faq");
  const tb = await getTranslations("common.buttons");
  const rawFaqs = t.raw("items") as Array<{ question: string; answer: string }>;
  const faqs = rawFaqs.map((faq) => ({
    question: faq.question,
    answer: interpolatePricing(faq.answer),
  }));

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[840px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <ScrollReveal className="mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)] text-lg font-medium">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Accordion List */}
        <ScrollReveal delay={200}>
          <FAQList items={faqs} defaultOpenCount={2} />
        </ScrollReveal>

        {/* CTA Section inside FAQ */}
        <ScrollReveal delay={400} className="mt-20 p-10 bg-[var(--foreground)] rounded-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
          <h3 className="text-white text-3xl font-bold mb-4">{t("stillQuestions")}</h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            {t("stillQuestionsDesc")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <CTAButton label={tb("startFree")} size="md" showArrow={false} trackAs="faq" />
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
