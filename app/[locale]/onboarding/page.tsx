"use client";

import { Suspense } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-0 flex items-center justify-center py-4 sm:min-h-[80vh] sm:py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <OnboardingWizard />
      </Suspense>
    </div>
  );
}
