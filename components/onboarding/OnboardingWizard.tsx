"use client";

import { useEffect, useState, useCallback } from "react";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuth } from "@/lib/supabase/auth-provider";
import { getUserBusinesses } from "@/lib/onboarding";
import { OnboardingProgress } from "./OnboardingProgress";
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { BusinessTypeStep } from "./steps/BusinessTypeStep";
import { CardPreviewStep } from "./steps/CardPreviewStep";
import { CreateAccountStep } from "./steps/CreateAccountStep";
import { ChoosePlanStep } from "./steps/ChoosePlanStep";

export function OnboardingWizard() {
  const store = useOnboardingStore();
  const { session, isLoading: authLoading } = useAuth();
  const [checkingBusinesses, setCheckingBusinesses] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthenticated = !!session?.access_token;

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

  // Custom next step that skips Step 4 if authenticated
  const handleNextStep = useCallback(() => {
    if (store.currentStep === 3 && isAuthenticated) {
      // Skip Step 4 (create account) and go directly to Step 5
      store.goToStep(5);
    } else {
      store.nextStep();
    }
  }, [store, isAuthenticated]);

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
        return <BusinessInfoStep store={store} onNext={store.nextStep} />;
      case 2:
        return (
          <BusinessTypeStep
            store={store}
            onNext={store.nextStep}
            onBack={store.prevStep}
          />
        );
      case 3:
        return (
          <CardPreviewStep
            store={store}
            onNext={handleNextStep}
            onBack={store.prevStep}
          />
        );
      case 4:
        return (
          <CreateAccountStep
            store={store}
            onNext={store.nextStep}
            onBack={store.prevStep}
          />
        );
      case 5:
        return <ChoosePlanStep store={store} onBack={store.prevStep} />;
      default:
        return <BusinessInfoStep store={store} onNext={store.nextStep} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress indicator */}
      <OnboardingProgress
        currentStep={store.currentStep}
        onStepClick={(step) => {
          // Only allow going back to completed steps
          if (step < store.currentStep) {
            store.goToStep(step);
          }
        }}
      />

      {/* Step content with animation */}
      <div className="mt-8 transition-all duration-300 ease-in-out">
        <div
          className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-sm"
          key={store.currentStep}
        >
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
