"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../../ui/ScrollReveal";

export function ROICalculator() {
  const t = useTranslations("features.programme-fondateur.custom.roi");
  const [clients, setClients] = useState(50);
  const [basket, setBasket] = useState(5);

  const extraRevenue = Math.round(clients * basket * 0.15 * 30);
  const stampeoCost = 14.99;
  const roi = Math.round((extraRevenue / stampeoCost) * 100);

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
                  max={200}
                  step={5}
                  value={clients}
                  onChange={(e) => setClients(Number(e.target.value))}
                  className="roi-slider w-full"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>10</span>
                  <span>200</span>
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
                  min={2}
                  max={50}
                  step={1}
                  value={basket}
                  onChange={(e) => setBasket(Number(e.target.value))}
                  className="roi-slider w-full"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>2€</span>
                  <span>50€</span>
                </div>
              </div>
            </div>

            {/* Fixed assumption */}
            <div className="flex items-center gap-2 mb-8 p-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
              <span className="text-sm font-medium text-[var(--muted-foreground)]">
                {t("assumption")}
              </span>
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
                  +{roi}%
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
