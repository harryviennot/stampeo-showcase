"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { createBusiness, getUserProfile, BusinessCreatePayload } from "@/lib/onboarding";
import { useAuth } from "@/lib/supabase/auth-provider";
import { getThemeColor } from "@/lib/theme";
import { detectBusinessLocale } from "@/lib/locale-detect";
import { CheckIcon } from "@/components/icons";
import { PRICING } from "@/lib/pricing";

interface FoundingPartnerStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

const TIERS = ["starter", "growth", "pro"] as const;
type Tier = (typeof TIERS)[number];

export function FoundingPartnerStep({ store, onNext, onBack }: Readonly<FoundingPartnerStepProps>) {
  const t = useTranslations("onboarding.foundingPartner");
  const tp = useTranslations("pricing");
  const tc = useTranslations("common.buttons");
  const { data, updateData } = store;
  const { session } = useAuth();
  const locale = useLocale();
  const businessLocale = detectBusinessLocale(locale);

  const [loading, setLoading] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reseller state
  const [isReseller, setIsReseller] = useState(false);
  const [resellerDiscount, setResellerDiscount] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile to check reseller status
  useEffect(() => {
    if (!session?.access_token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileLoading(false);
      return;
    }

    getUserProfile(session.access_token).then(({ data: profile }) => {
      if (profile?.is_reseller && profile.reseller_discount_percent) {
        setIsReseller(true);
        setResellerDiscount(profile.reseller_discount_percent);
      }
      setProfileLoading(false);
    });
  }, [session?.access_token]);

  const handleSelectPlan = useCallback(async (tier: Tier) => {
    if (tier === "pro") return;

    setError(null);
    setLoading(true);
    setLoadingTier(tier);

    try {
      // Skip business creation if already created (user went back and returned)
      if (data.businessId) {
        setLoading(false);
        setLoadingTier(null);
        onNext();
        return;
      }

      const themeColor = getThemeColor(
        data.cardDesign.accentColor,
        data.cardDesign.backgroundColor
      );

      const payload: BusinessCreatePayload = {
        name: data.businessName,
        url_slug: data.urlSlug,
        subscription_tier: tier,
        is_founding_partner: !isReseller,
        settings: {
          category: data.category || undefined,
          description: data.description || undefined,
          owner_name: data.ownerName || undefined,
          accentColor: themeColor,
          backgroundColor: data.cardDesign.backgroundColor,
        },
        logo_url: data.cardDesign.logoUrl || undefined,
        website: data.website || undefined,
        phone: data.phone || undefined,
        heard_from: data.heardFrom || undefined,
        heard_from_other: data.heardFromOther || undefined,
        primary_locale: businessLocale,
      };

      const { data: business, error: apiError } =
        await createBusiness(payload, session?.access_token);

      if (apiError || !business) {
        setError(apiError || "Failed to create business");
        setLoading(false);
        setLoadingTier(null);
        return;
      }

      // Store the business ID to prevent re-creation if user goes back
      updateData({ businessId: business.id });

      setLoading(false);
      setLoadingTier(null);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
      setLoadingTier(null);
    }
  }, [data, updateData, onNext, session, businessLocale, isReseller]);

  /** Compute the discounted price for a tier */
  function getDiscountedPrice(regularPrice: number, discountPercent: number): number {
    return Math.round(regularPrice * (1 - discountPercent / 100));
  }

  if (profileLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        {/* Badge */}
        {isReseller ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wide mb-4">
            {t("resellerBadge", { discount: resellerDiscount! })}
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wide mb-4">
            {t("limitedSpots")}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {isReseller ? t("resellerTitle") : t("title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-lg mx-auto">
          {isReseller ? t("resellerSubtitle") : t("subtitle")}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 max-w-4xl mx-auto">
        {TIERS.map((tier) => {
          const isPro = tier === "pro";
          const isGrowth = tier === "growth";
          const tierPricing = PRICING[tier];
          const features = tp.raw(`${tier}.features`) as (string | { text: string })[];

          // Compute the display price based on reseller vs founding partner
          const regularPrice = tierPricing.price;
          let discountedPrice: number | null = null;
          let priceLabel: string | null = null;

          if (isReseller && resellerDiscount && !isPro) {
            discountedPrice = getDiscountedPrice(regularPrice, resellerDiscount);
            priceLabel = tp("perMonth");
          } else if (!isReseller && "foundingPrice" in tierPricing) {
            discountedPrice = tierPricing.foundingPrice;
            priceLabel = tp("forLife");
          }

          return (
            <div
              key={tier}
              className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
                isPro
                  ? "opacity-50 border-[var(--border)]"
                  : isGrowth
                    ? "border-[var(--accent)] shadow-lg ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)]"
              }`}
            >
              {/* Badge */}
              {isGrowth && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--accent)] text-white whitespace-nowrap">
                    {tp("popular")}
                  </span>
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] whitespace-nowrap">
                    {tp("comingSoon")}
                  </span>
                </div>
              )}

              {/* Plan name & pricing */}
              <div className="mb-4 mt-1">
                <h3 className={`text-lg font-bold ${isPro ? "text-[var(--muted-foreground)]" : ""}`}>
                  {tp(`${tier}.name`)}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {tp(`${tier}.tagline`)}
                </p>

                <div className="mt-3">
                  {discountedPrice !== null && priceLabel ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm line-through text-[var(--muted-foreground)]">
                          &euro;{regularPrice}
                        </span>
                        {isReseller ? (
                          <span className="text-xs text-[var(--accent)] font-semibold">
                            -{resellerDiscount}%
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--accent)] font-semibold">
                            {tp("freeMonths")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold">&euro;{discountedPrice}</span>
                        <span className="text-sm text-[var(--muted-foreground)]">{priceLabel}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[var(--muted-foreground)]">&euro;{regularPrice}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">{tp("perMonth")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-5 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2 text-[var(--muted-foreground)]">
                  {tp(`${tier}.featuresLabel`)}
                </p>
                <ul className="space-y-1.5">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isPro ? "bg-[var(--muted)]" : "bg-[var(--accent)]"
                      }`}>
                        <CheckIcon className={`w-2.5 h-2.5 ${isPro ? "text-[var(--muted-foreground)]" : "text-white"}`} />
                      </div>
                      <span className={isPro ? "text-[var(--muted-foreground)]" : ""}>
                        {typeof feature === "string" ? feature : feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {isPro ? (
                <div className="w-full py-3 px-4 text-center font-semibold rounded-full border-2 border-[var(--border)] text-[var(--muted-foreground)] text-sm cursor-not-allowed">
                  {tp("ctaComingSoon")}
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loading}
                  className={`w-full py-3 px-4 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                    isGrowth
                      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25"
                      : "border-2 border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
                  }`}
                >
                  {loadingTier === tier ? t("settingUp") : t("cta")}
                </button>
              )}
            </div>
          );
        })}
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
