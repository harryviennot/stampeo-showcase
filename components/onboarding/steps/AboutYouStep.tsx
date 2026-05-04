"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface AboutYouStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

export function AboutYouStep({ store, onNext, onBack }: AboutYouStepProps) {
  const t = useTranslations("onboarding.aboutYou");
  const tc = useTranslations("common.buttons");
  const { data, updateData } = store;

  const isValid = data.ownerName.trim().length >= 2;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) onNext();
    },
    [isValid, onNext]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">{t("title")}</h1>
        <p className="text-[var(--muted-foreground)] mt-2">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="ownerName" className="block text-sm font-medium text-[var(--foreground)]">
            {t("ownerName")}
          </label>
          <input
            id="ownerName"
            type="text"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder={t("ownerNamePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-medium text-[var(--foreground)]">
            {t("website")} <span className="text-[var(--muted-foreground)] font-normal text-xs">{t("optional")}</span>
          </label>
          <input
            id="website"
            type="url"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            placeholder={t("websitePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)]">
            {t("phone")} <span className="text-[var(--muted-foreground)] font-normal text-xs">{t("optional")}</span>
          </label>
          <PhoneInput id="phone" value={data.phone} onChange={(phone) => updateData({ phone })} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="py-3.5 px-6 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
          >
            {tc("back")}
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {tc("continue")}
          </button>
        </div>
      </form>
    </div>
  );
}
