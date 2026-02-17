"use client";

import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";

export function SocialProofBar() {
  const t = useTranslations("landing.socialProof");

  const stats = [
    { value: "50+", label: t("stats.businesses") },
    { value: "2 000+", label: t("stats.cardsIssued") },
    { value: "4.9/5", label: t("stats.rating") },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <Container>
        <ScrollReveal>
          <div className="bg-white rounded-3xl blog-card-3d p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  {t("trustedBy")}
                </p>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {t("joinCount")}
                </p>
              </div>

              <div className="flex items-center gap-8 sm:gap-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
