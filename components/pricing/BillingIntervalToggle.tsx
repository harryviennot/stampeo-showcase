"use client";

import { useTranslations } from "next-intl";
import type { BillingInterval } from "@/lib/pricing";

type Props = {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
  className?: string;
};

/**
 * Monthly / Yearly switcher above the pricing cards. The savings badge sits
 * INSIDE the Yearly option rather than beside the control, so the reason to
 * pick yearly travels with the thing you click, and the pill stays centered.
 * Yearly is the default everywhere it is used.
 */
export function BillingIntervalToggle({ value, onChange, className = "" }: Props) {
  const t = useTranslations("pricingPage");

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        role="tablist"
        className="inline-flex items-center rounded-full border border-[var(--border)] bg-white p-1 shadow-sm"
      >
        {(["month", "year"] as const).map((interval) => {
          const selected = value === interval;
          const yearly = interval === "year";
          return (
            <button
              key={interval}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(interval)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${
                selected
                  ? "bg-[var(--foreground)] text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {t(yearly ? "intervalYearly" : "intervalMonthly")}
              {yearly && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    selected
                      ? "bg-white/20 text-white"
                      : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  }`}
                >
                  {t("yearlyBadge")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
