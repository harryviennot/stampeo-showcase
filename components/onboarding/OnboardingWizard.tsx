"use client";

import { useEffect, useState, useCallback } from "react";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";
import { getUserBusinesses } from "@/lib/onboarding";
import { OnboardingCardPreview } from "./OnboardingCardPreview";
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { BusinessTypeStep } from "./steps/BusinessTypeStep";
import { CardPreviewStep } from "./steps/CardPreviewStep";
import { CreateAccountStep } from "./steps/CreateAccountStep";
import { ChoosePlanStep } from "./steps/ChoosePlanStep";

// Helper to adjust color brightness for hover states
function adjustBrightness(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function OnboardingWizard() {
  const { session, loading: authLoading } = useAuth();
  const isAuthenticated = !!session?.access_token;
  const store = useOnboardingStore(isAuthenticated);
  const [checkingBusinesses, setCheckingBusinesses] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [animatingStampIndex, setAnimatingStampIndex] = useState<number | null>(null);

  // Card position: left for steps 1-2, right for steps 3+
  const cardPosition = store.currentStep < 3 ? "left" : "right";

  // Track if user has visited step 3 (design step) to persist colors
  const hasVisitedDesignStep = store.completedSteps.includes(2) || store.currentStep >= 3;

  // Update page accent color to match their business color (once they've reached design step)
  useEffect(() => {
    const accentColor = store.data.cardDesign?.accentColor;
    if (accentColor && hasVisitedDesignStep) {
      document.documentElement.style.setProperty("--accent", accentColor);
      document.documentElement.style.setProperty("--accent-hover", adjustBrightness(accentColor, -15));
    }

    // Cleanup: reset to default when leaving onboarding
    return () => {
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--accent-hover");
    };
  }, [store.data.cardDesign?.accentColor, hasVisitedDesignStep]);

  // Check if authenticated user already has a business (completed onboarding)
  useEffect(() => {
    async function checkUserBusinesses() {
      if (!session?.access_token || authChecked) return;

      setCheckingBusinesses(true);
      const { data: businesses } = await getUserBusinesses(session.access_token);

      if (businesses.length > 0) {
        // User already has a business - redirect to app
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
        window.location.href = appUrl;
        return;
      }

      // User is authenticated but has no business - they need to complete onboarding
      // If they're on Step 4 (create account), skip to Step 5
      if (store.currentStep === 4) {
        store.goToStep(5);
      }

      setCheckingBusinesses(false);
      setAuthChecked(true);
    }

    if (!authLoading && session) {
      checkUserBusinesses();
    } else if (!authLoading && !session) {
      setAuthChecked(true);
    }
  }, [session, authLoading, authChecked, store]);

  // Handle step completion with animation
  const handleStepComplete = useCallback((nextStep: number) => {
    const currentStep = store.currentStep;

    // Mark current step as completed (triggers stamp animation)
    store.markStepCompleted(currentStep);

    // Animate the stamp (0-indexed, so step 1 = index 0)
    setAnimatingStampIndex(currentStep - 1);

    // Wait for animation, then advance
    setTimeout(() => {
      setAnimatingStampIndex(null);

      // Skip step 4 if already authenticated
      if (nextStep === 4 && isAuthenticated) {
        store.goToStep(5);
      } else {
        store.goToStep(nextStep);
      }
    }, 500);
  }, [store, isAuthenticated]);

  // Custom next step handlers for each step
  const handleStep1Next = useCallback(() => {
    handleStepComplete(2);
  }, [handleStepComplete]);

  const handleStep2Next = useCallback(() => {
    handleStepComplete(3);
  }, [handleStepComplete]);

  const handleStep3Next = useCallback(() => {
    handleStepComplete(4);
  }, [handleStepComplete]);

  const handleStep4Next = useCallback(() => {
    handleStepComplete(5);
  }, [handleStepComplete]);

  // Don't render until we've loaded from localStorage and checked auth
  if (!store.isInitialized || authLoading || checkingBusinesses || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderStep = () => {
    switch (store.currentStep) {
      case 1:
        return <BusinessInfoStep store={store} onNext={handleStep1Next} />;
      case 2:
        return (
          <BusinessTypeStep
            store={store}
            onNext={handleStep2Next}
            onBack={store.prevStep}
          />
        );
      case 3:
        return (
          <CardPreviewStep
            store={store}
            onNext={handleStep3Next}
            onBack={store.prevStep}
          />
        );
      case 4:
        return (
          <CreateAccountStep
            store={store}
            onNext={handleStep4Next}
            onBack={store.prevStep}
          />
        );
      case 5:
        return <ChoosePlanStep store={store} onBack={store.prevStep} />;
      default:
        return <BusinessInfoStep store={store} onNext={handleStep1Next} />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
        {/* Card Panel */}
        <div
          className="flex items-center justify-center transition-all duration-500 ease-out"
          style={{
            order: cardPosition === "left" ? 0 : 1,
          }}
        >
          <div className="w-full max-w-[360px] transition-transform duration-500">
            <OnboardingCardPreview
              businessName={store.data.businessName}
              category={store.data.category}
              completedSteps={store.completedSteps.length}
              animatingStampIndex={animatingStampIndex}
              design={store.data.cardDesign}
            />

            {/* Step indicator below card on mobile */}
            <div className="mt-6 flex justify-center gap-2 lg:hidden">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${store.completedSteps.includes(step)
                    ? "bg-[var(--accent)]"
                    : step === store.currentStep
                      ? "bg-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                      : "bg-[var(--muted)]"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div
          className="flex flex-col justify-center transition-all duration-500 ease-out"
          style={{
            order: cardPosition === "left" ? 1 : 0,
          }}
        >
          {/* Step labels below form - desktop only */}
          <div className="hidden lg:flex justify-center gap-8 mb-6 text-sm">
            {[
              { step: 1, label: "Business" },
              { step: 2, label: "Type" },
              { step: 3, label: "Design" },
              { step: 4, label: "Account" },
              { step: 5, label: "Plan" },
            ].map(({ step, label }) => (
              <button
                key={step}
                onClick={() => {
                  if (store.completedSteps.includes(step)) {
                    store.goToStep(step);
                  }
                }}
                disabled={!store.completedSteps.includes(step)}
                className={`transition-colors duration-200 ${step === store.currentStep
                  ? "text-[var(--accent)] font-medium"
                  : store.completedSteps.includes(step)
                    ? "text-[var(--accent)] hover:underline cursor-pointer"
                    : "text-[var(--muted-foreground)] cursor-default"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Step content */}
          <div
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-sm"
            key={store.currentStep}
          >
            {renderStep()}
          </div>


        </div>
      </div>
    </div>
  );
}
