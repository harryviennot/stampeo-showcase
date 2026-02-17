"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";

export function FinalCTASection() {
  const t = useTranslations("landing.finalCta");

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
          <Link
            href="/onboarding"
            className="group flex min-w-[280px] md:min-w-[340px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 md:h-20 px-10 bg-[var(--accent)] text-white text-lg md:text-xl font-extrabold leading-normal tracking-wide shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <span>{t("cta")}</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <p className="text-[var(--muted-foreground)] text-sm md:text-base font-medium">
            {t("subtitle")}
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
