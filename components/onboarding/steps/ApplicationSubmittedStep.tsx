"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";
import { saveOnboardingProgress } from "@/lib/onboarding";

interface ApplicationSubmittedStepProps {
  store: OnboardingStore;
}

const COUNTDOWN_SECONDS = 12;

const heardFromOptions = [
  { id: "google", icon: "🔍" },
  { id: "instagram", icon: "📸" },
  { id: "tiktok", icon: "🎵" },
  { id: "linkedin", icon: "💼" },
  { id: "article", icon: "📰" },
  { id: "friend", icon: "🗣️" },
  { id: "business", icon: "🏪" },
  { id: "other", icon: "✨" },
];

export function ApplicationSubmittedStep({ store }: ApplicationSubmittedStepProps) {
  const t = useTranslations("onboarding.applicationSubmitted");
  const { data, updateData } = store;
  const { session } = useAuth();
  const redirected = useRef(false);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  const goToDashboard = useCallback(async () => {
    if (redirected.current) return;
    redirected.current = true;
    // Persist the latest HDYHAU answer before navigating away.
    if (session?.access_token && (data.heardFrom || data.heardFromOther)) {
      await saveOnboardingProgress(
        {
          business_name: data.businessName,
          url_slug: data.urlSlug,
          heard_from: data.heardFrom || undefined,
          heard_from_other: data.heardFromOther || undefined,
          current_step: 6,
          completed_steps: store.completedSteps,
        },
        session.access_token
      ).catch(() => {});
    }
    store.clearStore();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
    window.location.href = appUrl;
  }, [session, data, store]);

  // Tick the countdown once per second; redirect when it hits zero.
  useEffect(() => {
    if (redirected.current) return;
    if (seconds <= 0) {
      goToDashboard();
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, goToDashboard]);

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
    <div className="w-full max-w-md mx-auto text-center py-2">
      <div className="mb-4">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
        {t("title")}
      </h1>
      <p className="text-[var(--muted-foreground)] mb-5">{t("subtitle")}</p>

      <div className="bg-[var(--muted)]/30 rounded-2xl p-4 mb-6 text-left">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {data.businessName || "Your Business"}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] truncate">
              stampeo.app/{data.urlSlug || "your-business"}
            </p>
          </div>
        </div>
      </div>

      {/* HDYHAU widget */}
      <div className="mb-6 text-left">
        <p className="text-sm font-semibold text-[var(--foreground)] text-center mb-1">
          {t("heardFromTitle")}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] text-center mb-4">
          {t("heardFromSubtitle")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {heardFromOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => updateData({ heardFrom: option.id })}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                data.heardFrom === option.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50"
              }`}
            >
              <span className="text-xl" role="img" aria-hidden>
                {option.icon}
              </span>
              <span className="text-xs font-medium text-[var(--foreground)]/80">
                {t(`heardFromOptions.${option.id}`)}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {data.heardFrom === "other" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-3">
                <label htmlFor="heardFromOther" className="block text-xs font-medium text-[var(--foreground)]">
                  {t("heardFromOtherLabel")}
                </label>
                <textarea
                  id="heardFromOther"
                  value={data.heardFromOther}
                  onChange={(e) => updateData({ heardFromOther: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none text-sm"
                  placeholder={t("heardFromOtherPlaceholder")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={goToDashboard}
        className="w-full py-4 px-6 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 text-base"
      >
        {seconds > 0 ? t("goToDashboardCountdown", { seconds }) : t("goToDashboard")}
      </button>
    </div>
  );
}
