"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";
import { saveOnboardingProgress } from "@/lib/onboarding";

interface ApplicationSubmittedStepProps {
  store: OnboardingStore;
}

const heardFromOptions = [
  { id: "google", icon: "🔍" },
  { id: "instagram", icon: "📸" },
  { id: "tiktok", icon: "🎵" },
  { id: "youtube", icon: "🎥" },
  { id: "linkedin", icon: "💼" },
  { id: "article", icon: "📰" },
  { id: "friend", icon: "🗣️" },
  { id: "business", icon: "🏪" },
  { id: "ai", icon: "🤖" },
  { id: "other", icon: "✨" },
];

export function ApplicationSubmittedStep({ store }: ApplicationSubmittedStepProps) {
  const t = useTranslations("onboarding.applicationSubmitted");
  const { data, updateData } = store;
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    !!data.heardFrom &&
    (data.heardFrom !== "other" || data.heardFromOther.trim().length > 0);

  const handleContinue = useCallback(async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    if (session?.access_token) {
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
  }, [isValid, submitting, session, data, store]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div
          className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">{t("heardFromSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {heardFromOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => updateData({ heardFrom: option.id })}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
              data.heardFrom === option.id
                ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50"
            }`}
          >
            <span className="text-xl flex-shrink-0" role="img" aria-hidden>
              {option.icon}
            </span>
            <span className="text-xs font-medium text-[var(--foreground)]/85">
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
            <div className="space-y-2 pb-4">
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

      <button
        type="button"
        onClick={handleContinue}
        disabled={!isValid || submitting}
        className="w-full py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {submitting ? t("settingUpDashboard") : t("goToDashboard")}
      </button>
    </div>
  );
}
