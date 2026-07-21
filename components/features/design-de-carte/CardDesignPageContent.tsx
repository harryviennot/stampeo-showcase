import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { FAQList } from "@/components/ui/FAQList";
import { JsonLd } from "@/components/JsonLd";
import { faqPageJsonLd } from "@/lib/structured-data";
import { HeroCardStack } from "./HeroCardStack";
import { CardDesignPlayground } from "./CardDesignPlayground";
import { CardStyleGallery } from "./CardStyleGallery";
import { CustomIconsSection } from "./CustomIconsSection";
import { IconLibrarySection } from "./IconLibrarySection";
import { LivingCardSection } from "./LivingCardSection";
import { AnnotatedWalletCard } from "./AnnotatedWalletCard";
import { WalletParitySection } from "./WalletParitySection";
import { RelatedFeatures } from "@/components/features/RelatedFeatures";
import { FeatureCTA } from "@/components/features/FeatureCTA";

export async function CardDesignPageContent() {
  const t = await getTranslations("features");
  const tb = await getTranslations("common.buttons");

  const related = t.raw("design-de-carte.related") as string[];
  const faqItems = t.raw("design-de-carte.faq.items") as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <>
      <JsonLd data={faqPageJsonLd(faqItems)} />

      {/* Hero with card stack */}
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
                {t("design-de-carte.hero.title")}
              </h1>
              <p className="text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-xl">
                {t("design-de-carte.hero.subtitle")}
              </p>
              <CTAButton label={tb("startFree")} />
            </ScrollReveal>

            {/* Right: hero card with peeking sample styles */}
            <ScrollReveal delay={150}>
              <HeroCardStack />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Problem section */}
      <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
        <Container>
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-6">
              {t("design-de-carte.problem.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {t("design-de-carte.problem.description")}
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* Full style gallery: every sample brand, stamps and points interleaved */}
      <CardStyleGallery />

      {/* Preset icon catalog breadth */}
      <IconLibrarySection />

      {/* "Or use your own icons" — reads as the follow-up to the library above */}
      <CustomIconsSection />

      {/* Personalization: customer name, variables, stacked rewards */}
      <LivingCardSection />

      {/* Creation methods hidden for now — component kept for later re-enable. */}

      {/* Annotated Card Anatomy (stamps/points toggle; points styles live in
          the playground below) */}
      <AnnotatedWalletCard />

      {/* Both wallets + multiple saved styles */}
      <WalletParitySection />

      {/* Interactive card designer: the hands-on close, right before the FAQ */}
      <CardDesignPlayground />

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-[var(--blog-bg-alt)]">
        <Container className="max-w-3xl">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              {t("design-de-carte.faq.title")}
            </h2>
            <p className="mt-5 text-lg text-[var(--muted-foreground)]">
              {t("design-de-carte.faq.subtitle")}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <FAQList items={faqItems} defaultOpenCount={1} />
          </ScrollReveal>
        </Container>
      </section>

      {/* CTA */}
      <FeatureCTA
        title={t("design-de-carte.cta.title")}
        subtitle={t("design-de-carte.cta.subtitle")}
      />

      <RelatedFeatures related={related} className="bg-[var(--blog-bg)]" />
    </>
  );
}
