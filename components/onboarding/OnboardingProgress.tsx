"use client";

import { CheckIcon } from "@/components/icons";

interface OnboardingProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: "Business" },
  { number: 2, label: "Type" },
  { number: 3, label: "Preview" },
  { number: 4, label: "Account" },
  { number: 5, label: "Plan" },
];

export function OnboardingProgress({
  currentStep,
  onStepClick,
}: OnboardingProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm
                  transition-all duration-300 flex-shrink-0
                  ${
                    isCompleted
                      ? "bg-[var(--accent)] text-white cursor-pointer hover:scale-110"
                      : isCurrent
                        ? "bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }
                  ${!isClickable ? "cursor-default" : ""}
                `}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      currentStep > step.number
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--muted)]"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels - visible on larger screens */}
      <div className="hidden sm:flex items-center justify-between mt-3">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`flex-1 text-center text-xs font-medium transition-colors ${
              index < steps.length - 1 ? "pr-4" : ""
            } ${
              currentStep >= step.number
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]"
            }`}
            style={{
              marginLeft: index === 0 ? 0 : undefined,
              marginRight: index === steps.length - 1 ? 0 : undefined,
            }}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}
