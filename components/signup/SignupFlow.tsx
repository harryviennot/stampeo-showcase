"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/supabase/auth-provider";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { AccountStep } from "./AccountStep";
import { OtpStep } from "./OtpStep";

type Step = "personal" | "account" | "otp";

const STEP_ORDER: Step[] = ["personal", "account", "otp"];

export interface SignupData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

const STORAGE_KEY = "stampeo_signup_v1";

function loadDraft(): Partial<SignupData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SignupData>) : {};
  } catch {
    return {};
  }
}

function saveDraft(data: Partial<SignupData>) {
  if (typeof window === "undefined") return;
  // Never persist password — it lives only in memory.
  const { password: _, ...persisted } = data;
  void _;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // ignore quota errors
  }
}

/**
 * Three-step signup. Replaces the legacy six-step OnboardingWizard. Each step
 * is a self-contained component; the orchestrator holds the in-progress data
 * and dispatches navigation. Once OTP succeeds we redirect to the web
 * dashboard, which routes the user into the launch wizard via its setup-gate.
 */
export function SignupFlow() {
  const t = useTranslations("signup");
  const locale = useLocale();
  const { session, loading: authLoading } = useAuth();

  const [data, setData] = useState<SignupData>(() => {
    const draft = loadDraft();
    return {
      name: draft.name ?? "",
      phone: draft.phone ?? "",
      email: draft.email ?? "",
      password: "",
    };
  });
  const [step, setStep] = useState<Step>("personal");

  // If the user lands here already signed in, ship them straight to the app.
  useEffect(() => {
    if (authLoading) return;
    if (session?.access_token) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
      window.location.href = appUrl;
    }
  }, [session, authLoading]);

  const update = (patch: Partial<SignupData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
  };

  const goTo = (next: Step) => setStep(next);
  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  const progress = useMemo(
    () => ({ current: STEP_ORDER.indexOf(step) + 1, total: STEP_ORDER.length }),
    [step]
  );

  const handleVerified = () => {
    // Clear the draft now that the account is live, then redirect to web.
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
    window.location.href = appUrl;
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div
          className="h-[3px] bg-[var(--accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
        <div className="mx-auto max-w-[480px] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] uppercase tracking-wider text-[#999] font-medium">
            {t("progress", progress)}
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-[480px] flex-1 flex flex-col px-4 py-6 min-[768px]:py-12">
          {step === "personal" && (
            <PersonalInfoStep
              value={{ name: data.name, phone: data.phone }}
              onChange={(patch) => update(patch)}
              onNext={() => goTo("account")}
            />
          )}
          {step === "account" && (
            <AccountStep
              value={{ name: data.name, phone: data.phone, email: data.email, password: data.password }}
              locale={locale}
              onChange={(patch) => update(patch)}
              onOtpRequested={() => goTo("otp")}
              onBack={goBack}
            />
          )}
          {step === "otp" && (
            <OtpStep
              email={data.email}
              onVerified={handleVerified}
              onBack={goBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}
