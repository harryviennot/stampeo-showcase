"use client";

import { useEffect, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStore, TeamSize, LocationCount, PrimaryGoal } from "@/hooks/useOnboardingStore";
import { checkSlugAvailability } from "@/lib/onboarding";
import { CheckIcon, XMarkIcon } from "@/components/icons";
import { SubstepDots } from "../SubstepDots";

interface BusinessProfileStepProps {
  store: OnboardingStore;
  onNext: () => void;
}

type Substep = 1 | 2 | 3 | 4 | 5;

const categories = [
  { id: "cafe", icon: "☕" },
  { id: "restaurant", icon: "🍽️" },
  { id: "bakery", icon: "🥐" },
  { id: "retail", icon: "🛍️" },
  { id: "salon", icon: "💇" },
  { id: "fitness", icon: "💪" },
  { id: "services", icon: "🔧" },
  { id: "other", icon: "✨" },
];

const teamSizes: { id: TeamSize; icon: string }[] = [
  { id: "solo", icon: "🙋" },
  { id: "2-5", icon: "👥" },
  { id: "6-20", icon: "👨‍👩‍👧" },
  { id: "20+", icon: "🏢" },
];

const locationOptions: { id: LocationCount; icon: string }[] = [
  { id: "1", icon: "📍" },
  { id: "2-5", icon: "🗺️" },
  { id: "6+", icon: "🌍" },
];

const goals: { id: PrimaryGoal; icon: string }[] = [
  { id: "acquire", icon: "✨" },
  { id: "retain", icon: "💛" },
  { id: "both", icon: "🚀" },
];

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

export function BusinessProfileStep({ store, onNext }: BusinessProfileStepProps) {
  const t = useTranslations("onboarding.businessProfile");
  const tc = useTranslations("common.buttons");
  const {
    data,
    updateBusinessName,
    updateSlug,
    updateData,
    isSlugAvailable,
    slugErrorReason,
    isSlugChecking,
    setIsSlugAvailable,
    setSlugErrorReason,
    setIsSlugChecking,
    validatedSlug,
    markSlugValidated,
    step1Substep,
    setStep1Substep,
  } = store;
  const substep = step1Substep as Substep;
  const [debouncedSlug, setDebouncedSlug] = useState(data.urlSlug);
  const [direction, setDirection] = useState(0);

  // Debounce slug checking
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(data.urlSlug);
    }, 300);
    return () => clearTimeout(timer);
  }, [data.urlSlug]);

  // Slug availability check (only relevant on substep 1)
  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 3) {
      setIsSlugAvailable(null);
      setSlugErrorReason(null);
      return;
    }

    if (debouncedSlug === validatedSlug) {
      setIsSlugAvailable(true);
      setSlugErrorReason(null);
      setIsSlugChecking(false);
      return;
    }

    let cancelled = false;
    setIsSlugChecking(true);

    checkSlugAvailability(debouncedSlug).then((result) => {
      if (cancelled) return;
      setIsSlugAvailable(result.available);
      setSlugErrorReason(result.reason || null);
      setIsSlugChecking(false);
      if (result.available) markSlugValidated();
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedSlug, setIsSlugAvailable, setSlugErrorReason, setIsSlugChecking, validatedSlug, markSlugValidated]);

  const isIdentityValid =
    data.businessName.trim().length >= 2 &&
    data.urlSlug.length >= 3 &&
    isSlugAvailable === true;
  const isCategoryValid = data.category !== null;
  const isTeamSizeValid = data.teamSize !== null;
  const isLocationsValid = data.locations !== null;
  const isGoalValid = data.primaryGoal !== null;

  const isCurrentSubstepValid =
    (substep === 1 && isIdentityValid) ||
    (substep === 2 && isCategoryValid) ||
    (substep === 3 && isTeamSizeValid) ||
    (substep === 4 && isLocationsValid) ||
    (substep === 5 && isGoalValid);

  const goToSubstep = useCallback(
    (target: Substep) => {
      setDirection(target > substep ? 1 : -1);
      setStep1Substep(target);
    },
    [substep, setStep1Substep]
  );

  const handleContinue = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!isCurrentSubstepValid) return;
      if (substep < 5) {
        goToSubstep((substep + 1) as Substep);
      } else {
        onNext();
      }
    },
    [isCurrentSubstepValid, substep, goToSubstep, onNext]
  );

  const handleBack = useCallback(() => {
    if (substep > 1) goToSubstep((substep - 1) as Substep);
  }, [substep, goToSubstep]);

  const subtitle =
    substep === 1
      ? t("subtitleIdentity")
      : substep === 2
        ? t("subtitleCategory")
        : substep === 3
          ? t("subtitleTeamSize")
          : substep === 4
            ? t("subtitleLocations")
            : t("subtitleGoal");

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">{subtitle}</p>
      </div>

      <SubstepDots current={substep} total={5} />

      <motion.div layout transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}>
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
            {substep === 1 && (
              <form onSubmit={handleContinue} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="businessName" className="block text-sm font-medium text-[var(--foreground)]">
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

                <div className="space-y-2">
                  <label htmlFor="urlSlug" className="block text-sm font-medium text-[var(--foreground)]">
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
                  <div className="h-5">
                    {data.urlSlug.length > 0 && data.urlSlug.length < 3 && (
                      <p className="text-xs text-[var(--muted-foreground)]">{t("slugMinLength")}</p>
                    )}
                    {!isSlugChecking && isSlugAvailable === false && slugErrorReason && (
                      <p className="text-xs text-red-500">{slugErrorReason}</p>
                    )}
                    {!isSlugChecking && isSlugAvailable === true && (
                      <p className="text-xs text-green-600">{t("slugAvailable")}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isIdentityValid}
                  className="w-full py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {tc("next")}
                </button>
              </form>
            )}

            {substep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => updateData({ category: category.id })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        data.category === category.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                          : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                      }`}
                    >
                      <span className="text-2xl" role="img" aria-label={t(`categories.${category.id}`)}>
                        {category.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          data.category === category.id
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground)]/80"
                        }`}
                      >
                        {t(`categories.${category.id}`)}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {data.category === "other" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)]">
                          {t("otherLabel")}
                        </label>
                        <textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => updateData({ description: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none"
                          placeholder={t("otherPlaceholder")}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <NavButtons onBack={handleBack} onNext={handleContinue} disabled={!isCategoryValid} backLabel={tc("back")} nextLabel={tc("continue")} />
              </div>
            )}

            {substep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {teamSizes.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateData({ teamSize: option.id })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        data.teamSize === option.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                          : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                      }`}
                    >
                      <span className="text-2xl" role="img" aria-hidden>
                        {option.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          data.teamSize === option.id
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground)]/80"
                        }`}
                      >
                        {t(`teamSize.${option.id}`)}
                      </span>
                    </button>
                  ))}
                </div>

                <NavButtons onBack={handleBack} onNext={handleContinue} disabled={!isTeamSizeValid} backLabel={tc("back")} nextLabel={tc("continue")} />
              </div>
            )}

            {substep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {locationOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateData({ locations: option.id })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                        data.locations === option.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                          : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                      }`}
                    >
                      <span className="text-2xl" role="img" aria-hidden>
                        {option.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          data.locations === option.id
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground)]/80"
                        }`}
                      >
                        {t(`locations.${option.id}`)}
                      </span>
                    </button>
                  ))}
                </div>

                <NavButtons onBack={handleBack} onNext={handleContinue} disabled={!isLocationsValid} backLabel={tc("back")} nextLabel={tc("continue")} />
              </div>
            )}

            {substep === 5 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => updateData({ primaryGoal: goal.id })}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        data.primaryGoal === goal.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                          : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0" role="img" aria-hidden>
                        {goal.icon}
                      </span>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            data.primaryGoal === goal.id
                              ? "text-[var(--foreground)]"
                              : "text-[var(--foreground)]/80"
                          }`}
                        >
                          {t(`goals.${goal.id}.label`)}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {t(`goals.${goal.id}.description`)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <NavButtons onBack={handleBack} onNext={handleContinue} disabled={!isGoalValid} backLabel={tc("back")} nextLabel={tc("continue")} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface NavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
  backLabel: string;
  nextLabel: string;
}

function NavButtons({ onBack, onNext, disabled, backLabel, nextLabel }: NavButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onBack}
        className="py-3.5 px-6 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="flex-1 py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {nextLabel}
      </button>
    </div>
  );
}
