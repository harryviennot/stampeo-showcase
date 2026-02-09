"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Link } from "@/i18n/navigation";

export function FAQSection() {
  const t = useTranslations("landing.faq");
  const faqs = t.raw("items") as Array<{ question: string; answer: string }>;

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Decoration: Top Right Stamp */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-[var(--accent)]/5 stamp-decoration pointer-events-none" />
      <div className="absolute top-20 -right-20 w-48 h-48 bg-[var(--accent)]/10 stamp-decoration rotate-12 pointer-events-none" />

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
        <ScrollReveal delay={200} className="flex flex-col gap-5">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group flex flex-col rounded-xl bg-[var(--cream)] shadow-sm border border-[var(--accent)]/5 px-6 py-4"
              open={index === 0 || index === 1}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                <p className="text-lg font-bold leading-normal group-hover:text-[var(--accent)] transition-colors">
                  {faq.question}
                </p>
                <div className="text-[var(--muted-foreground)] transition-transform duration-300 group-open:rotate-180 group-open:text-[var(--accent)]">
                  <span className="text-xl font-bold">↓</span>
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

        {/* CTA Section inside FAQ */}
        <ScrollReveal delay={400} className="mt-20 p-10 bg-[var(--foreground)] rounded-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
          <h3 className="text-white text-3xl font-bold mb-4">{t("stillQuestions")}</h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            {t("stillQuestionsDesc")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/onboarding"
              className="bg-[var(--accent)] hover:brightness-110 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              {t("startFreeTrial")}
            </Link>
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
            >
              {t("contactSupport")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
