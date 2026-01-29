"use client";

import { useState, useCallback } from "react";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { createBusiness, BusinessCreatePayload } from "@/lib/onboarding";
import { useAuth } from "@/lib/supabase/auth-provider";
import { getThemeColor } from "@/lib/theme";
import { CheckIcon } from "@/components/icons";

interface ChoosePlanStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

const plans = [
  {
    id: "pay" as const,
    name: "Pay",
    price: "20",
    description: "For single-location businesses",
    features: [
      { text: "1 card template", included: true },
      { text: "Unlimited customers", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Up to 3 scanner accounts", included: true },
      { text: "Basic analytics", included: true },
      { text: "Push notifications", included: true },
    ],
    featured: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "40",
    description: "For growing & multi-location businesses",
    features: [
      { text: "Multiple card templates", included: true },
      { text: "Unlimited customers", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Unlimited scanner accounts", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Push notifications", included: true },
    ],
    featured: true,
  },
];

export function ChoosePlanStep({ store, onNext, onBack }: Readonly<ChoosePlanStepProps>) {
  const { data, updateData } = store;
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = useCallback(
    async (planId: "pay" | "pro") => {
      updateData({ selectedPlan: planId });
      setError(null);
      setLoading(true);

      try {
        // Skip business creation if already created (user went back and returned)
        if (data.businessId) {
          setLoading(false);
          onNext();
          return;
        }

        // Create business via API
        // Pick the best theme color: accent if it has good contrast, otherwise background
        const themeColor = getThemeColor(
          data.cardDesign.accentColor,
          data.cardDesign.backgroundColor
        );

        const payload: BusinessCreatePayload = {
          name: data.businessName,
          url_slug: data.urlSlug,
          subscription_tier: planId,
          settings: {
            category: data.category || undefined,
            description: data.description || undefined,
            owner_name: data.ownerName || undefined,
            accentColor: themeColor,
            backgroundColor: data.cardDesign.backgroundColor,
          },
          logo_url: data.cardDesign.logoUrl || undefined,
        };

        const { data: business, error: apiError } =
          await createBusiness(payload, session?.access_token);

        if (apiError || !business) {
          setError(apiError || "Failed to create business");
          setLoading(false);
          return;
        }

        // Store the business ID to prevent re-creation if user goes back
        updateData({ businessId: business.id });

        // Business created successfully - go to congrats step
        // Don't clear store yet - CongratsStep needs the data
        setLoading(false);
        onNext();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    },
    [data, updateData, onNext, session]
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Choose your plan
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Start with a 14-day free trial. No credit card required.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-2xl transition-all duration-200 ${plan.featured
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--card-bg)] border border-[var(--border)]"
              } ${data.selectedPlan === plan.id
                ? "ring-2 ring-[var(--accent)] ring-offset-2"
                : ""
              }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-wide">
                Most popular
              </div>
            )}

            <div className="mb-4">
              <h3
                className={`text-lg font-semibold ${plan.featured
                  ? "text-[var(--background)]"
                  : "text-[var(--foreground)]"
                  }`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-sm ${plan.featured
                  ? "text-[var(--background)]/70"
                  : "text-[var(--muted-foreground)]"
                  }`}
              >
                {plan.description}
              </p>
            </div>

            <div className="mb-4">
              <span
                className={`text-4xl font-bold ${plan.featured
                  ? "text-[var(--background)]"
                  : "text-[var(--foreground)]"
                  }`}
              >
                &euro;{plan.price}
              </span>
              <span
                className={`text-sm ${plan.featured
                  ? "text-[var(--background)]/70"
                  : "text-[var(--muted-foreground)]"
                  }`}
              >
                /month
              </span>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.featured ? "bg-[var(--accent)]" : "bg-green-500"
                      }`}
                  >
                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span
                    className={`text-sm ${plan.featured
                      ? "text-[var(--background)]/90"
                      : "text-[var(--foreground)]"
                      }`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loading}
              className={`w-full py-3 px-4 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${plan.featured
                ? "bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--background)]/90"
                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                }`}
            >
              {loading && data.selectedPlan === plan.id
                ? "Setting up..."
                : "Start free trial"}
            </button>
          </div>
        ))}
      </div>

      {/* Back button - hidden if business already created */}
      {!data.businessId && (
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="py-2 px-6 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors disabled:opacity-50"
          >
            Go back
          </button>
        </div>
      )}

      <p className="text-center mt-4 text-xs text-[var(--muted-foreground)]">
        Both plans include a 14-day free trial. Cancel anytime.
      </p>
    </div>
  );
}
