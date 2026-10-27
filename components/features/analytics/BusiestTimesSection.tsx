"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";

/** The real Busiest times card: answers the problem section's "which day is quietest". */
export function BusiestTimesSection() {
  const t = useTranslations("features.analytiques.busiest");
  const shot = landingShot(useLocale() as Locale, "phone-busiest");

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <ScrollReveal className="max-w-xl">
            <h2 className="text-h2 text-[var(--foreground)]">{t("title")}</h2>
            <p className="mt-4 text-lead text-[var(--muted-foreground)] leading-relaxed">{t("lead")}</p>
          </ScrollReveal>
          <ScrollReveal delay={150} className="flex justify-center">
            <PhoneScreenshot src={shot.src} alt={t("alt")} />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
