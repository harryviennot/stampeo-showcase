"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { WalletIcon, SignalIcon, BellIcon, CheckIcon, SparklesIcon, ChartIcon, DevicePhoneMobileIcon } from "../icons";

const customerIcons = [WalletIcon, SignalIcon, BellIcon, CheckIcon];
const businessIcons = [SparklesIcon, ChartIcon, DevicePhoneMobileIcon, BellIcon];

export function BenefitsSection() {
  const [activeTab, setActiveTab] = useState<"customers" | "business">("business");
  const t = useTranslations("landing.benefits");

  const translatedBenefits = t.raw(activeTab) as Array<{ title: string; description: string }>;
  const icons = activeTab === "customers" ? customerIcons : businessIcons;

  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight px-4 pb-3">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl px-4">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Toggle — sticky on mobile so users can switch without scrolling back */}
        <div className="sticky top-16 z-20 flex justify-center px-4 py-4 mb-4 bg-[var(--background)]/80 backdrop-blur-md md:static md:bg-transparent md:backdrop-blur-none md:py-8">
          <div className="flex h-auto min-h-12 sm:min-h-14 w-full max-w-md items-center justify-center rounded-full bg-[var(--accent)]/5 p-1.5 border border-[var(--accent)]/10">
            <button
              onClick={() => setActiveTab("business")}
              className={`flex cursor-pointer h-full grow items-center justify-center rounded-full px-4 sm:px-6 py-1 transition-all duration-300 text-sm sm:text-base font-bold leading-normal ${
                activeTab === "business"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--accent)]/70 hover:text-[var(--accent)]"
              }`}
            >
              {t("tabBusiness")}
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex cursor-pointer h-full grow items-center justify-center rounded-full px-4 sm:px-6 py-1 transition-all duration-300 text-sm sm:text-base font-bold leading-normal ${
                activeTab === "customers"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--accent)]/70 hover:text-[var(--accent)]"
              }`}
            >
              {t("tabCustomers")}
            </button>
          </div>
        </div>

        {/* Benefit Cards — 2-column grid instead of 4 for more breathing room */}
        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {translatedBenefits.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <div
                key={`${activeTab}-${index}`}
                className="group relative flex flex-col gap-6 p-8 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-bold leading-tight">{benefit.title}</h3>
                  <p className="text-[var(--muted-foreground)] text-base font-medium leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
