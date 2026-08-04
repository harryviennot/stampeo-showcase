"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/pricing";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InfoIcon } from "@/components/icons";
import { trackLandingCTAClicked, type CTALocation } from "@/lib/analytics";

export type FeatureItem = string | { text: string; tooltip: string };

/**
 * A pricing discount. Pass a percentage (e.g. `{ percentage: 50 }`) or an
 * explicit target price (e.g. `{ targetPrice: 10 }`). The original price is
 * always rendered with a strike-through; the discounted value becomes the
 * headline price. Pass `undefined` for plain pricing.
 */
export type Discount = { percentage: number } | { targetPrice: number };

export function getDiscountedPrice(price: number, discount: Discount): number {
  if ("targetPrice" in discount) return discount.targetPrice;
  return Math.round(price * (1 - discount.percentage / 100) * 100) / 100;
}

type PricingTierCardProps = {
  name: string;
  tagline: string;
  features: FeatureItem[];
  /** Optional small uppercase label above the feature list ("Everything included:") */
  featuresLabel?: string;
  price: number;
  /** When set and effective, renders strike-through original + discounted headline */
  discount?: Discount;
  /** Suffix shown next to the headline price when no discount is active */
  perMonthLabel: string;
  /** Suffix used next to the discounted price (e.g. "/month for life"). Falls back to perMonthLabel. */
  forLifeLabel?: string;
  /** Line under the price, e.g. "Billed €192 per year". */
  subLabel?: string;
  cta: string;
  ctaHref: string;
  /** Small line below the CTA — "30-day free trial · Cancel anytime" */
  ctaSubtext?: string;
  highlighted?: boolean;
  popularLabel?: string;
  currencySymbol?: string;
  /** When set, fires `landing_cta_clicked` with this location on CTA click. */
  trackAs?: CTALocation;
  /** Lets the page control stacking order (recommended tier first on mobile). */
  className?: string;
};

function FeatureListItem({ feature }: { feature: FeatureItem }) {
  const checkClass = "text-[var(--muted-foreground)] text-base";

  if (typeof feature === "string") {
    return (
      <li className="flex items-start gap-3 text-[15px]">
        <span className={checkClass}>&#10003;</span>
        <span>{feature}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 text-[15px]">
      <span className={checkClass}>&#10003;</span>
      <span className="flex items-center gap-1.5">
        {feature.text}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Info"
              className="inline-flex text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm leading-relaxed">
            {feature.tooltip}
          </TooltipContent>
        </Tooltip>
      </span>
    </li>
  );
}

export function PricingTierCard({
  name,
  tagline,
  features,
  featuresLabel,
  price,
  discount,
  perMonthLabel,
  forLifeLabel,
  subLabel,
  cta,
  ctaHref,
  ctaSubtext,
  highlighted,
  popularLabel,
  currencySymbol = "€",
  trackAs,
  className = "",
}: PricingTierCardProps) {
  const locale = useLocale();
  const discounted = discount ? getDiscountedPrice(price, discount) : undefined;
  const showDiscount = discounted !== undefined && discounted < price;

  const handleCtaClick = trackAs
    ? () => trackLandingCTAClicked({ locale, cta_location: trackAs, href: ctaHref })
    : undefined;

  // The recommended tier is drawn in the accent ink; the others in black. Both
  // sit proud of the page like the rest of the site's cards.
  const containerClass = highlighted
    ? "card-stamp bg-[var(--cream)] border-[var(--accent)] shadow-[0_3px_0_var(--accent)] z-10"
    : "card-stamp bg-[var(--cream)]";

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-7 lg:p-8 transition-all duration-300 ${containerClass} ${className}`}
    >
      {highlighted && popularLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-[var(--accent)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            {popularLabel}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-7">
        <h3 className="text-h3">{name}</h3>
        <p className="text-sm text-[var(--muted-foreground)] font-medium">{tagline}</p>

        {showDiscount ? (
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-[var(--muted-foreground)] line-through">
              {currencySymbol}
              {formatPrice(price, locale)}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">
                {currencySymbol}
                {formatPrice(discounted, locale)}
              </span>
              <span className="text-[var(--muted-foreground)] text-base font-semibold">
                {forLifeLabel ?? perMonthLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {currencySymbol}
              {formatPrice(price, locale)}
            </span>
            <span className="text-[var(--muted-foreground)] text-base font-semibold">
              {perMonthLabel}
            </span>
          </div>
        )}

        {subLabel && (
          <p className="text-sm text-[var(--muted-foreground)] font-medium -mt-2">
            {subLabel}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 flex-1 mb-7">
        {featuresLabel && (
          <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
            {featuresLabel}
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {features.map((feature, i) => (
            <FeatureListItem key={i} feature={feature} />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        {highlighted ? (
          <Link
            href={ctaHref}
            onClick={handleCtaClick}
            className="w-full flex cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-[var(--accent)] text-white text-[15px] font-semibold shadow-md shadow-[var(--accent)]/20 transition-all hover:brightness-105"
          >
            <span>{cta}</span>
          </Link>
        ) : (
          <Link
            href={ctaHref}
            onClick={handleCtaClick}
            className="w-full flex cursor-pointer items-center justify-center rounded-full h-12 px-6 border-2 border-[var(--foreground)] text-[var(--foreground)] text-[15px] font-semibold transition-all hover:bg-[var(--foreground)] hover:text-white"
          >
            <span>{cta}</span>
          </Link>
        )}
        {ctaSubtext && (
          <p className="text-xs text-center text-[var(--muted-foreground)]">{ctaSubtext}</p>
        )}
      </div>
    </div>
  );
}
