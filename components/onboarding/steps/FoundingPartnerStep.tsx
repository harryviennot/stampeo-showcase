"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { createBusiness, BusinessCreatePayload } from "@/lib/onboarding";
import { useAuth } from "@/lib/supabase/auth-provider";
import { getThemeColor } from "@/lib/theme";
import { CheckIcon } from "@/components/icons";

interface FoundingPartnerStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

export function FoundingPartnerStep({ store, onNext, onBack }: Readonly<FoundingPartnerStepProps>) {
  const t = useTranslations("onboarding.foundingPartner");
  const tc = useTranslations("common.buttons");
  const { data, updateData } = store;
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valueProps = t.raw("valueProps") as string[];

  const handleBecomePartner = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Skip business creation if already created (user went back and returned)
      if (data.businessId) {
        setLoading(false);
        onNext();
        return;
      }

      // Create business via API — always Pro tier for founding partners
      const themeColor = getThemeColor(
        data.cardDesign.accentColor,
        data.cardDesign.backgroundColor
      );

      const payload: BusinessCreatePayload = {
        name: data.businessName,
        url_slug: data.urlSlug,
        subscription_tier: "pro",
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

      setLoading(false);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }, [data, updateData, onNext, session]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wide mb-4">
          {t("limitedSpots")}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Value proposition card */}
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-[var(--foreground)] text-[var(--background)] rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--background)]">
              Pro
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm line-through text-[var(--background)]/50">
                &euro;29.99
              </span>
              <span className="text-sm text-[var(--accent)] font-semibold">
                3 months free
              </span>
            </div>
            <div className="mt-1">
              <span className="text-3xl font-bold text-[var(--background)]">
                &euro;14.99
              </span>
              <span className="text-sm text-[var(--background)]/70">
                /month for life
              </span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {valueProps.map((prop, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--accent)]">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-[var(--background)]/90">
                  {prop}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleBecomePartner}
            disabled={loading}
            className="w-full py-3.5 px-4 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25"
          >
            {loading ? t("settingUp") : t("cta")}
          </button>
        </div>
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
            {tc("goBack")}
          </button>
        </div>
      )}
    </div>
  );
}
