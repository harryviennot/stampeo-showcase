"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CardColorDemo } from "./CardColorDemo";
import { CreationMethodsSection } from "./CreationMethodsSection";
import { AnnotatedWalletCard } from "./AnnotatedWalletCard";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";

export function CardDesignPageContent() {
  const t = useTranslations("features");

  const hero = {
    title: t("design-de-carte.hero.title"),
    subtitle: t("design-de-carte.hero.subtitle"),
  };

  const problem = {
    title: t("design-de-carte.problem.title"),
    description: t("design-de-carte.problem.description"),
  };

  const cta = {
    title: t("design-de-carte.cta.title"),
    subtitle: t("design-de-carte.cta.subtitle"),
  };

  const related = t.raw("design-de-carte.related") as string[];

  return (
    <>
      {/* Hero with interactive card demo */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-[var(--accent)]/5 blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[var(--stamp-sage)]/5 blur-3xl" />
        </div>
        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: text */}
            <ScrollReveal>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] mb-6">
                {hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-xl">
                {hero.subtitle}
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center h-14 px-8 bg-[var(--accent)] text-white text-base font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
              >
                {t("ctaButton")}
              </Link>
            </ScrollReveal>

            {/* Right: interactive card color demo */}
            <ScrollReveal delay={150}>
              <CardColorDemo />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Problem section */}
      <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {problem.title}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {problem.description}
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* 3 Creation Methods */}
      <CreationMethodsSection />

      {/* Annotated Card Anatomy */}
      <AnnotatedWalletCard />

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <Container>
          <ScrollReveal className="text-center max-w-2xl mx-auto py-12 px-8 bg-white rounded-2xl border border-[var(--accent)]/10 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              {cta.title}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              {cta.subtitle}
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-14 px-8 bg-[var(--accent)] text-white text-base font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
            >
              {t("ctaButton")}
            </Link>
          </ScrollReveal>
        </Container>
      </section>

      <RelatedFeatures related={related} className="bg-[var(--blog-bg)]" />
    </>
  );
}
