"use client";

import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function PriceReveal() {
  const t = useTranslations("features.programme-fondateur.custom.price");
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.3 });

  return (
    <section className="py-16 sm:py-24">
      <div ref={ref} className="max-w-[840px] mx-auto px-6 text-center">
        {/* Original price with animated strikethrough */}
        <div className="relative inline-block mb-6">
          <span className="text-3xl sm:text-4xl font-bold text-[var(--muted-foreground)]/50">
            {t("original")}
          </span>
          <span
            className="absolute left-0 top-1/2 h-0.5 bg-red-500 transition-all duration-500 ease-out"
            style={{ width: isRevealed ? "100%" : "0%" }}
          />
        </div>

        {/* Founding price */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isRevealed ? 1 : 0,
            transform: isRevealed ? "scale(1)" : "scale(0.8)",
            transitionDelay: "0.5s",
          }}
        >
          <p className="text-5xl sm:text-7xl font-black text-[var(--accent)] mb-2">
            {t("founding")}
          </p>
        </div>

        {/* "For life" */}
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isRevealed ? 1 : 0,
            transitionDelay: "0.8s",
          }}
        >
          <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            {t("forLife")}
          </p>
        </div>
      </div>
    </section>
  );
}
