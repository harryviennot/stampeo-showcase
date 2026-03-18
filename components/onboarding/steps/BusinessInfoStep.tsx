"use client";

import { useEffect, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { checkSlugAvailability } from "@/lib/onboarding";
import { CheckIcon, XMarkIcon } from "@/components/icons";
import { SubstepDots } from "../SubstepDots";

interface BusinessInfoStepProps {
  store: OnboardingStore;
  onNext: () => void;
}

const heardFromOptions = [
  { id: "google", icon: "🔍" },
  { id: "social", icon: "📱" },
  { id: "word_of_mouth", icon: "🗣️" },
  { id: "event", icon: "🎪" },
  { id: "other", icon: "✨" },
];

// Animation variants for substep transitions (same as CardPreviewStep)
const substepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "tween" as const,
      ease: "easeInOut" as const,
      duration: 0.3,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: {
      type: "tween" as const,
      ease: "easeInOut" as const,
      duration: 0.3,
    },
  }),
};

export function BusinessInfoStep({ store, onNext }: BusinessInfoStepProps) {
  const t = useTranslations("onboarding.businessInfo");
  const tc = useTranslations("common.buttons");
  const { data, updateBusinessName, updateSlug, updateData, isSlugAvailable, slugErrorReason, isSlugChecking, setIsSlugAvailable, setSlugErrorReason, setIsSlugChecking, validatedSlug, markSlugValidated } = store;
  const [debouncedSlug, setDebouncedSlug] = useState(data.urlSlug);
  const [substep, setSubstep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(0);

  // Debounce slug checking
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(data.urlSlug);
    }, 300);
    return () => clearTimeout(timer);
  }, [data.urlSlug]);

  // Check slug availability
  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 3) {
      setIsSlugAvailable(null);
      setSlugErrorReason(null);
      return;
    }

    // Skip check if this slug was already validated
    if (debouncedSlug === validatedSlug) {
      setIsSlugAvailable(true);
      setSlugErrorReason(null);
      setIsSlugChecking(false);
      return;
    }

    let cancelled = false;
    setIsSlugChecking(true);

    checkSlugAvailability(debouncedSlug).then((result) => {
      if (!cancelled) {
        setIsSlugAvailable(result.available);
        setSlugErrorReason(result.reason || null);
        setIsSlugChecking(false);
        // Cache the slug if it's available
        if (result.available) {
          markSlugValidated();
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedSlug, setIsSlugAvailable, setSlugErrorReason, setIsSlugChecking, validatedSlug, markSlugValidated]);

  const isValid =
    data.businessName.trim().length >= 2 &&
    data.urlSlug.length >= 3 &&
    data.ownerName.trim().length >= 2 &&
    isSlugAvailable === true;

  const goToSubstep = (target: 1 | 2) => {
    setDirection(target > substep ? 1 : -1);
    setSubstep(target);
  };

  const handleContinue = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (substep === 1 && isValid) {
        goToSubstep(2);
      } else if (substep === 2) {
        onNext();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isValid, onNext, substep]
  );

  const handleBack = () => {
    if (substep === 2) {
      goToSubstep(1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {substep === 1 ? t("subtitle") : t("subtitleDiscovery")}
        </p>
      </div>

      {/* Substep indicator */}
      <SubstepDots current={substep} total={2} />

      {/* Animated substep content */}
      <div className="min-h-[380px] relative">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={substep}
            custom={direction}
            variants={substepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {substep === 1 ? (
              <form onSubmit={handleContinue} className="space-y-5">
                {/* Business Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    {t("businessName")}
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={data.businessName}
                    onChange={(e) => updateBusinessName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    placeholder={t("businessNamePlaceholder")}
                  />
                </div>

                {/* URL Slug */}
                <div className="space-y-2">
                  <label
                    htmlFor="urlSlug"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    {t("uniqueUrl")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--muted-foreground)] text-sm">
                      stampeo.app/
                    </div>
                    <input
                      id="urlSlug"
                      type="text"
                      value={data.urlSlug}
                      onChange={(e) => updateSlug(e.target.value)}
                      required
                      minLength={3}
                      className="w-full pl-[104px] py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                      placeholder={t("urlPlaceholder")}
                    />
                    {/* Availability indicator */}
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {isSlugChecking && (
                        <div className="w-6 h-6 border-2 border-[var(--muted-foreground)] border-t-transparent rounded-full animate-spin" />
                      )}
                      {!isSlugChecking && isSlugAvailable === true && (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {!isSlugChecking && isSlugAvailable === false && (
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                          <XMarkIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Fixed height container to prevent jitter */}
                  <div className="h-5">
                    {data.urlSlug.length > 0 && data.urlSlug.length < 3 && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {t("slugMinLength")}
                      </p>
                    )}
                    {!isSlugChecking && isSlugAvailable === false && slugErrorReason && (
                      <p className="text-xs text-red-500">
                        {slugErrorReason}
                      </p>
                    )}
                    {!isSlugChecking && isSlugAvailable === true && (
                      <p className="text-xs text-green-600">
                        {t("slugAvailable")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="ownerName"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
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

                {/* Website (optional) */}
                <div className="space-y-2">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    {t("website")} <span className="text-[var(--muted-foreground)] font-normal text-xs">(optional)</span>
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

                {/* Phone (optional) */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[var(--foreground)]"
                  >
                    {t("phone")} <span className="text-[var(--muted-foreground)] font-normal text-xs">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => updateData({ phone: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                    placeholder={t("phonePlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {tc("next")}
                </button>
              </form>
            ) : (
              /* Substep 2: Where did you hear about us? */
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {heardFromOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateData({ heardFrom: option.id })}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${data.heardFrom === option.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                          : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                        }
                      `}
                    >
                      <span className="text-2xl" role="img" aria-label={t(`heardFromOptions.${option.id}`)}>
                        {option.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${data.heardFrom === option.id
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground)]/80"
                          }`}
                      >
                        {t(`heardFromOptions.${option.id}`)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="py-3.5 px-6 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
                  >
                    {tc("back")}
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 py-3.5 px-4 border border-[var(--border)] text-[var(--muted-foreground)] font-medium rounded-full hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
                  >
                    {tc("skip")}
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!data.heardFrom}
                    className="flex-1 py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {tc("continue")}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
