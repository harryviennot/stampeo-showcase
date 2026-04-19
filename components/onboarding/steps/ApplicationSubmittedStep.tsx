"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { OnboardingStore } from "@/hooks/useOnboardingStore";

interface ApplicationSubmittedStepProps {
  store: OnboardingStore;
}

const REDIRECT_DELAY_MS = 1500;

export function ApplicationSubmittedStep({ store }: ApplicationSubmittedStepProps) {
  const t = useTranslations("onboarding.applicationSubmitted");
  const { data } = store;
  const redirected = useRef(false);

  const goToDashboard = useCallback(() => {
    if (redirected.current) return;
    redirected.current = true;
    store.clearStore();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
    window.location.href = appUrl;
  }, [store]);

  useEffect(() => {
    const timer = setTimeout(goToDashboard, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [goToDashboard]);

  const initials = data.businessName
    ? data.businessName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "YB";

  return (
    <div className="w-full max-w-md mx-auto text-center py-4">
      <div className="mb-6">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3">
        {t("title")}
      </h1>

      <p className="text-[var(--muted-foreground)] text-lg mb-2">
        {t("subtitle")}
      </p>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">
        {t("redirecting")}
      </p>

      <div className="bg-[var(--muted)]/30 rounded-2xl p-5 mb-8 text-left">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">
              {data.businessName || "Your Business"}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              stampeo.app/{data.urlSlug || "your-business"}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToDashboard}
        className="w-full py-4 px-6 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 text-lg"
      >
        {t("goToDashboard")}
      </button>
    </div>
  );
}
