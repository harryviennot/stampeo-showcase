import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { FAQList } from "../ui/FAQList";
import { FeatureCTA } from "../features/FeatureCTA";
import { EngineExplainer } from "./EngineExplainer";
import { EnginePicker } from "./EnginePicker";
import { DesignTeaser } from "./DesignTeaser";
import { BusinessTypeMap } from "./BusinessTypeMap";

export async function LoyaltyProgramsPage() {
  const t = await getTranslations("loyalty");
  const faqItems = t.raw("faq.items") as Array<{ question: string; answer: string }>;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-14 sm:pb-20 overflow-hidden">
        {/* Soft dual-program glow: stamps orange left, points violet right */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[8%] w-64 h-64 rounded-full bg-[var(--accent)]/6 blur-3xl" />
          <div className="absolute bottom-0 right-[10%] w-72 h-72 rounded-full bg-[#8b5cf6]/6 blur-3xl" />
        </div>
        <Container className="relative z-10 max-w-3xl text-center">
          <ScrollReveal>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold mb-6">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-[var(--foreground)]">
              {t.rich("hero.title", {
                accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
              })}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </ScrollReveal>
        </Container>
      </section>

      <EngineExplainer />
      <EnginePicker />
      <DesignTeaser />
      <BusinessTypeMap />

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-[var(--blog-bg-alt)]">
        <Container className="max-w-3xl">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
              {t("faq.title")}
            </h2>
            <p className="mt-5 text-lg text-[var(--muted-foreground)]">{t("faq.subtitle")}</p>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <FAQList items={faqItems} defaultOpenCount={2} />
          </ScrollReveal>
        </Container>
      </section>

      <FeatureCTA
        title={t("cta.title")}
        subtitle={t("cta.subtitle")}
        buttonText={t("cta.button")}
      />
    </>
  );
}
