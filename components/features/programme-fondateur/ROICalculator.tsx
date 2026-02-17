"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../../ui/ScrollReveal";

interface ROICalculatorProps {
  namespace?: string;
}

export function ROICalculator({ namespace = "features.programme-fondateur.custom.roi" }: ROICalculatorProps) {
  const t = useTranslations(namespace);
  const [clients, setClients] = useState(40);
  const [basket, setBasket] = useState(8);

  const extraClientsPerDay = clients * 0.08;
  const extraRevenue = Math.round(extraClientsPerDay * basket * 30);
  const stampeoCost = 14.99;
  const multiplier = Math.round(extraRevenue / stampeoCost);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[840px] mx-auto px-6">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl blog-card-3d p-8 sm:p-10">
            {/* Sliders */}
            <div className="space-y-8 mb-10">
              {/* Clients per day */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-bold text-[var(--foreground)]">
                    {t("clientsLabel")}
                  </label>
                  <span className="text-lg font-extrabold text-[var(--accent)] tabular-nums">
                    {clients}
                  </span>
                </div>
                <input
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
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-bold text-[var(--foreground)]">
                    {t("basketLabel")}
                  </label>
                  <span className="text-lg font-extrabold text-[var(--accent)] tabular-nums">
                    {basket}€
                  </span>
                </div>
                <input
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
            <div className="mb-8 p-4 rounded-xl bg-[var(--blog-bg)] space-y-2">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {t("assumption")}
              </p>
              <div className="text-sm text-[var(--muted-foreground)] space-y-1">
                <p>
                  {t("breakdownClients", {
                    clients,
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[var(--blog-bg)]">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  {t("extraRevenue")}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tabular-nums transition-all duration-300">
                  {extraRevenue}€
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">
                    {t("perMonth")}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--blog-bg)]">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  {t("stampeoCost")}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tabular-nums">
                  {stampeoCost}€
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">
                    {t("perMonth")}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--accent)]/10">
                <p className="text-sm font-medium text-[var(--accent)] mb-1">
                  {t("roiLabel")}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)] tabular-nums transition-all duration-300">
                  ×{multiplier}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-xs text-[var(--muted-foreground)] text-center">
              {t("disclaimer")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
