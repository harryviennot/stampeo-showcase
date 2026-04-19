"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import {
  createBusiness,
  getUserProfile,
  checkSlugAvailability,
  BusinessCreatePayload,
  CreateBusinessError,
} from "@/lib/onboarding";
import { useAuth } from "@/lib/supabase/auth-provider";
import { getThemeColor } from "@/lib/theme";
import { detectBusinessLocale } from "@/lib/locale-detect";
import { CheckIcon, XMarkIcon } from "@/components/icons";
import { PRICING, isFoundingProgramOpen } from "@/lib/pricing";

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
  const [error, setError] = useState<CreateBusinessError | null>(null);
  const [retryTier, setRetryTier] = useState<Tier | null>(null);

  // Inline slug-edit recovery state
  const [newSlug, setNewSlug] = useState("");
  const [slugCheck, setSlugCheck] = useState<{ available: boolean | null; reason: string | null }>({
    available: null,
    reason: null,
  });
  const [slugChecking, setSlugChecking] = useState(false);

  // Reseller state
  const [isReseller, setIsReseller] = useState(false);
  const [resellerDiscount, setResellerDiscount] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Founding program is closing — check on mount. Backend re-checks on submit
  // so a clock-skewed client can't sneak past the deadline.
  const foundingOpen = useMemo(() => isFoundingProgramOpen(), []);

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

  const attemptCreate = useCallback(
    async (tier: Tier, slugOverride?: string) => {
      setError(null);
      setLoading(true);
      setLoadingTier(tier);

      try {
        // Idempotency: if business was already created, just advance
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
          url_slug: slugOverride ?? data.urlSlug,
          subscription_tier: tier,
          is_founding_partner: !isReseller && foundingOpen,
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

        const { data: business, error: apiError } = await createBusiness(
          payload,
          session?.access_token
        );

        if (apiError || !business) {
          setError(apiError ?? { code: "server", message: "Failed to create business" });
          setRetryTier(tier);
          setLoading(false);
          setLoadingTier(null);
          return;
        }

        // Persist the chosen slug so subsequent saves/displays stay consistent.
        if (slugOverride && slugOverride !== data.urlSlug) {
          updateData({ urlSlug: slugOverride, businessId: business.id });
        } else {
          updateData({ businessId: business.id });
        }

        setLoading(false);
        setLoadingTier(null);
        onNext();
      } catch (err) {
        setError({
          code: "network",
          message: err instanceof Error ? err.message : "An error occurred",
        });
        setRetryTier(tier);
        setLoading(false);
        setLoadingTier(null);
      }
    },
    [data, updateData, onNext, session, businessLocale, isReseller, foundingOpen]
  );

  const handleSelectPlan = useCallback(
    async (tier: Tier) => {
      if (tier === "pro") return;
      setNewSlug(data.urlSlug);
      await attemptCreate(tier);
    },
    [attemptCreate, data.urlSlug]
  );

  const handleRetrySame = useCallback(async () => {
    if (!retryTier) return;
    await attemptCreate(retryTier);
  }, [attemptCreate, retryTier]);

  const handleSlugRetry = useCallback(async () => {
    if (!retryTier || !newSlug || slugCheck.available !== true) return;
    await attemptCreate(retryTier, newSlug);
  }, [attemptCreate, retryTier, newSlug, slugCheck.available]);

  const dismissError = useCallback(() => {
    setError(null);
    setRetryTier(null);
  }, []);

  // Debounced availability check inside the slug-taken recovery dialog
  useEffect(() => {
    if (error?.code !== "slug_taken") return;
    if (!newSlug || newSlug.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlugCheck({ available: null, reason: null });
      return;
    }
    if (newSlug === data.urlSlug) {
      setSlugCheck({ available: false, reason: null });
      return;
    }

    let cancelled = false;
    setSlugChecking(true);
    const timer = setTimeout(() => {
      checkSlugAvailability(newSlug).then((result) => {
        if (cancelled) return;
        setSlugCheck({
          available: result.available,
          reason: result.reason ?? null,
        });
        setSlugChecking(false);
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [newSlug, error, data.urlSlug]);

  const isSlugRetryReady = useMemo(
    () => slugCheck.available === true && !slugChecking && newSlug !== data.urlSlug,
    [slugCheck.available, slugChecking, newSlug, data.urlSlug]
  );

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
        {/* Badge — hidden once founding program closes (and we're not a reseller) */}
        {isReseller ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wide mb-4">
            {t("resellerBadge", { discount: resellerDiscount! })}
          </div>
        ) : foundingOpen ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wide mb-4">
            {t("limitedSpots")}
          </div>
        ) : null}

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {isReseller
            ? t("resellerTitle")
            : foundingOpen
              ? t("title")
              : t("standardTitle")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-lg mx-auto">
          {isReseller
            ? t("resellerSubtitle")
            : foundingOpen
              ? t("subtitle")
              : t("standardSubtitle")}
        </p>
      </div>

      {error?.code === "slug_taken" && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 text-left">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold text-[var(--foreground)]">
                {t("slugTakenTitle")}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {t("slugTakenBody")}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissError}
              aria-label={t("slugTakenCancel")}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={newSlug}
              onChange={(e) =>
                setNewSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                    .slice(0, 50)
                )
              }
              placeholder={t("slugTakenPlaceholder")}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-[var(--border)] bg-white dark:bg-white/5 focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {slugChecking && (
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              )}
              {!slugChecking && slugCheck.available === true && (
                <CheckIcon className="w-5 h-5 text-green-600" />
              )}
              {!slugChecking && slugCheck.available === false && (
                <XMarkIcon className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          {!slugChecking && slugCheck.reason && slugCheck.available === false && (
            <p className="text-xs text-red-600 mt-2">{slugCheck.reason}</p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={dismissError}
              disabled={loading}
              className="flex-1 py-2.5 px-4 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-full hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
            >
              {t("slugTakenCancel")}
            </button>
            <button
              type="button"
              onClick={handleSlugRetry}
              disabled={!isSlugRetryReady || loading}
              className="flex-1 py-2.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("settingUp") : t("slugTakenRetry")}
            </button>
          </div>
        </div>
      )}

      {error && error.code !== "slug_taken" && (
        <div className="mb-6 p-5 rounded-2xl bg-red-50 border border-red-100 dark:bg-red-950/50 dark:border-red-900/50 text-left">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold text-[var(--foreground)]">
                {t("retryTitle")}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {error.message || t("retryBody")}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissError}
              aria-label={t("slugTakenCancel")}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          {retryTier && (
            <button
              type="button"
              onClick={handleRetrySame}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("settingUp") : t("retryButton")}
            </button>
          )}
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
          } else if (!isReseller && foundingOpen && "foundingPrice" in tierPricing) {
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
