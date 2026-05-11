"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface PersonalInfoStepProps {
  value: { name: string; phone: string };
  onChange: (patch: Partial<{ name: string; phone: string }>) => void;
  onNext: () => void;
}

/**
 * Step 1 — name + phone. Phone is optional; we store both in user_metadata
 * via `signUp` in step 2.
 */
export function PersonalInfoStep({ value, onChange, onNext }: PersonalInfoStepProps) {
  const t = useTranslations("signup");
  const tStep = useTranslations("signup.steps.personal");
  const tErr = useTranslations("signup.errors");
  const [showErrors, setShowErrors] = useState(false);

  const nameValid = value.name.trim().length > 0;
  // Phone is optional but if provided must look like E.164 (PhoneInput emits E.164).
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[22px] min-[768px]:text-[26px] font-semibold leading-tight">
          {tStep("title")}
        </h1>
        <p className="text-[14px] text-[#7A7A7A]">{tStep("subtitle")}</p>
      </header>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-name" className="text-[13px] font-medium">
            {tStep("name")}
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            autoFocus
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={tStep("namePlaceholder")}
            className="h-11 rounded-[10px] border border-[var(--border)] bg-white px-3.5 text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
          />
          {showErrors && !nameValid && (
            <p className="text-[12px] text-red-600">{tErr("nameRequired")}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-phone" className="text-[13px] font-medium">
            {tStep("phone")}
          </label>
          <PhoneInput
            id="signup-phone"
            value={value.phone}
            onChange={(e164) => onChange({ phone: e164 })}
            error={showErrors && !phoneValid}
          />
          <p className="text-[11.5px] text-[#999]">{tStep("phoneHelp")}</p>
          {showErrors && !phoneValid && (
            <p className="text-[12px] text-red-600">{tErr("phoneInvalid")}</p>
          )}
        </div>
      </div>

      <Button className="w-full min-h-[48px]">{tStep("submit")}</Button>

      <p className="text-center text-[13px] text-[#7A7A7A]">
        {t("loginPrompt")}{" "}
        <Link href="/login" className="text-[var(--accent)] font-semibold underline-offset-2 hover:underline">
          {t("loginCta")}
        </Link>
      </p>
    </form>
  );
}
