"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface UserInfoStepProps {
  value: { name: string; phone: string };
  onChange: (patch: Partial<{ name: string; phone: string }>) => void;
  onNext: () => void;
}

export function UserInfoStep({ value, onChange, onNext }: UserInfoStepProps) {
  const t = useTranslations("onboarding.userInfo");
  const [showErrors, setShowErrors] = useState(false);

  const nameValid = value.name.trim().length > 0;
  const phoneValid = value.phone.length === 0 || value.phone.startsWith("+");
  const canContinue = nameValid && phoneValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) {
      setShowErrors(true);
      return;
    }
    onNext();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="onboarding-name"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            {t("name")}
          </label>
          <input
            id="onboarding-name"
            type="text"
            autoComplete="name"
            autoFocus
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("namePlaceholder")}
            className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
          {showErrors && !nameValid && (
            <p className="text-xs text-red-600">{t("nameRequired")}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="onboarding-phone"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            {t("phone")}{" "}
            <span className="text-[var(--muted-foreground)] font-normal">
              {t("optional")}
            </span>
          </label>
          <PhoneInput
            id="onboarding-phone"
            value={value.phone}
            onChange={(e164) => onChange({ phone: e164 })}
            error={showErrors && !phoneValid}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            {t("phoneHelp")}
          </p>
          {showErrors && !phoneValid && (
            <p className="text-xs text-red-600">{t("phoneInvalid")}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
        >
          {t("continue")}
        </button>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          {t("loginPrompt")}{" "}
          <Link
            href="/login"
            className="text-[var(--accent)] font-semibold hover:underline"
          >
            {t("loginCta")}
          </Link>
        </p>
      </form>
    </div>
  );
}
