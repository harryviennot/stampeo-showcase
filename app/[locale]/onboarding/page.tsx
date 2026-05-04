"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-0 flex items-center justify-center py-4 sm:min-h-[80vh] sm:py-8">
      <OnboardingWizard />
    </div>
  );
}
