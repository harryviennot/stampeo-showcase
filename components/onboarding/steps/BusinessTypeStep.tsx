"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStore } from "@/hooks/useOnboardingStore";

interface BusinessTypeStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  { id: "cafe", label: "Cafe / Coffee Shop", icon: "☕" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "bakery", label: "Bakery / Patisserie", icon: "🥐" },
  { id: "retail", label: "Retail Store", icon: "🛍️" },
  { id: "salon", label: "Hair Salon / Spa", icon: "💇" },
  { id: "fitness", label: "Gym / Fitness", icon: "💪" },
  { id: "services", label: "Services", icon: "🔧" },
  { id: "other", label: "Other", icon: "✨" },
];

export function BusinessTypeStep({
  store,
  onNext,
  onBack,
}: BusinessTypeStepProps) {
  const { data, updateData } = store;

  const isValid = data.category !== null;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) {
        onNext();
      }
    },
    [isValid, onNext]
  );

  const selectCategory = (categoryId: string) => {
    updateData({ category: categoryId });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          What type of business?
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          This helps us tailor your loyalty card
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.id)}
              className={`
                flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                ${
                  data.category === category.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                    : "border-[var(--border)] bg-white/50 dark:bg-white/5 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                }
              `}
            >
              <span className="text-2xl" role="img" aria-label={category.label}>
                {category.icon}
              </span>
              <span
                className={`text-sm font-medium ${
                  data.category === category.id
                    ? "text-[var(--foreground)]"
                    : "text-[var(--foreground)]/80"
                }`}
              >
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* Description - only shown for 'other' category */}
        <AnimatePresence>
          {data.category === "other" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Please let us know what type of business you are
                </label>
                <textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none transition-all duration-200 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none"
                  placeholder="e.g. Pet grooming, Car wash, Tattoo studio..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 px-4 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 py-3.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
