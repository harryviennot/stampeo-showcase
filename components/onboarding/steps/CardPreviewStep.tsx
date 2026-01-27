"use client";

import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { OnboardingCardPreview } from "../OnboardingCardPreview";

interface CardPreviewStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

export function CardPreviewStep({
  store,
  onNext,
  onBack,
}: CardPreviewStepProps) {
  const { data } = store;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Your loyalty card
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          This is how your card will look in Apple Wallet
        </p>
      </div>

      {/* Card Preview */}
      <div className="mb-8 flex justify-center">
        <OnboardingCardPreview
          businessName={data.businessName}
          category={data.category}
        />
      </div>

      {/* Info note */}
      <div className="text-center mb-8">
        <p className="text-sm text-[var(--muted-foreground)]">
          You can fully customize your card design later in the dashboard
        </p>
      </div>

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
          type="button"
          onClick={onNext}
          className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200"
        >
          Looks good!
        </button>
      </div>
    </div>
  );
}
