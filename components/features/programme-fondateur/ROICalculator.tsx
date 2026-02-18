"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../../ui/ScrollReveal";

type Mode = "prudent" | "optimiste";

const PERCENTAGES: Record<Mode, number> = {
  prudent: 0.06,
  optimiste: 0.12,
};

interface ROICalculatorProps {
  namespace?: string;
}

export function ROICalculator({ namespace = "features.programme-fondateur.custom.roi" }: ROICalculatorProps) {
  const t = useTranslations(namespace);
  const [clients, setClients] = useState(40);
  const [basket, setBasket] = useState(8);
  const [mode, setMode] = useState<Mode>("prudent");

  const percent = PERCENTAGES[mode];
  const percentDisplay = Math.round(percent * 100);
  const extraClientsPerDay = clients * percent;
  const extraRevenue = Math.round(extraClientsPerDay * basket * 30);
  const stampeoCost = 14.99;
  const multiplier = Math.round(extraRevenue / stampeoCost);

  return (
    <section className="py-12 sm:py-24 lg:py-32">
      <div className="max-w-[840px] mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>

          {/* Prudent / Optimiste pill switcher */}
          <div className="mt-5 sm:mt-6 inline-flex items-center rounded-full bg-[var(--blog-bg)] p-1">
            <button
              type="button"
              onClick={() => setMode("prudent")}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "prudent"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {t("modePrudent")}
            </button>
            <button
              type="button"
              onClick={() => setMode("optimiste")}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "optimiste"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {t("modeOptimiste")}
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl blog-card-3d p-5 sm:p-8 md:p-10">
            {/* Sliders */}
            <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-10">
              {/* Clients per day */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label htmlFor="roi-clients" className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                    {t("clientsLabel")}
                  </label>
                  <span className="text-base sm:text-lg font-extrabold text-[var(--accent)] tabular-nums">
                    {clients}
                  </span>
                </div>
                <input
                  id="roi-clients"
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={clients}
                  onChange={(e) => setClients(Number(e.target.value))}
                  className="roi-slider w-full"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              {/* Average basket */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label htmlFor="roi-basket" className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                    {t("basketLabel")}
                  </label>
                  <span className="text-base sm:text-lg font-extrabold text-[var(--accent)] tabular-nums">
                    {basket}€
                  </span>
                </div>
                <input
                  id="roi-basket"
                  type="range"
                  min={3}
                  max={50}
                  step={1}
                  value={basket}
                  onChange={(e) => setBasket(Number(e.target.value))}
                  className="roi-slider w-full"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>3€</span>
                  <span>50€</span>
                </div>
              </div>
            </div>

            {/* Visible calculation breakdown */}
            <div className="mb-5 sm:mb-8 p-3 sm:p-4 rounded-xl bg-[var(--blog-bg)] space-y-1.5 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">
                {t("assumption", { percent: percentDisplay })}
              </p>
              <div className="text-xs sm:text-sm text-[var(--muted-foreground)] space-y-0.5 sm:space-y-1">
                <p>
                  {t("breakdownClients", {
                    clients,
                    percent: percentDisplay,
                    extra: extraClientsPerDay % 1 === 0
                      ? extraClientsPerDay
                      : extraClientsPerDay.toFixed(1),
                  })}
                </p>
                <p>
                  {t("breakdownRevenue", {
                    extra: extraClientsPerDay % 1 === 0
                      ? extraClientsPerDay
                      : extraClientsPerDay.toFixed(1),
                    basket,
                    total: extraRevenue,
                  })}
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-2.5 sm:p-4 rounded-xl bg-[var(--blog-bg)] flex flex-col justify-between">
                <p className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  {t("extraRevenue")}
                </p>
                <div className="mt-auto">
                  <p className="text-lg sm:text-3xl font-extrabold text-[var(--foreground)] tabular-nums transition-all duration-300">
                    {extraRevenue}€
                  </p>
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">
                    {t("perMonth")}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl bg-[var(--blog-bg)] flex flex-col justify-between">
                <p className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  {t("stampeoCost")}
                </p>
                <div className="mt-auto">
                  <p className="text-lg sm:text-3xl font-extrabold text-[var(--foreground)] tabular-nums">
                    {stampeoCost}€
                  </p>
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">
                    {t("perMonth")}
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl bg-[var(--accent)]/10 flex flex-col justify-between">
                <p className="text-xs sm:text-sm font-medium text-[var(--accent)] mb-1">
                  {t("roiLabel")}
                </p>
                <div className="mt-auto">
                  <p className="text-lg sm:text-3xl font-extrabold text-[var(--accent)] tabular-nums transition-all duration-300">
                    ×{multiplier}
                  </p>
                  <p className="text-xs font-medium invisible" aria-hidden="true">
                    {t("perMonth")}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer + Sources */}
            <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-[var(--muted-foreground)] text-center">
              {t("disclaimer")}
            </p>
            <p className="mt-1.5 text-[10px] sm:text-xs text-[var(--muted-foreground)] text-center opacity-70">
              {t("sources")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
