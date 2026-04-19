import { Link } from "@/i18n/navigation";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InfoIcon } from "@/components/icons";

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
  cta: string;
  ctaHref: string;
  /** Small line below the CTA — "No credit card required · Cancel anytime" */
  ctaSubtext?: string;
  highlighted?: boolean;
  popularLabel?: string;
  comingSoon?: boolean;
  comingSoonLabel?: string;
  ctaComingSoonLabel?: string;
  currencySymbol?: string;
};

function FeatureListItem({ feature, muted }: { feature: FeatureItem; muted?: boolean }) {
  const checkClass = muted
    ? "text-[var(--muted-foreground)] text-lg"
    : "text-[var(--accent)] text-lg";

  if (typeof feature === "string") {
    return (
      <li className="flex items-start gap-3 text-[15px] font-medium">
        <span className={checkClass}>&#10003;</span>
        <span>{feature}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 text-[15px] font-medium">
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
  cta,
  ctaHref,
  ctaSubtext,
  highlighted,
  popularLabel,
  comingSoon,
  comingSoonLabel,
  ctaComingSoonLabel,
  currencySymbol = "\u20AC",
}: PricingTierCardProps) {
  const discounted = discount ? getDiscountedPrice(price, discount) : undefined;
  const showDiscount = discounted !== undefined && discounted < price;

  const containerClass = comingSoon
    ? "border border-[var(--border)] bg-[var(--cream)] opacity-60"
    : highlighted
      ? "border-[3px] border-[var(--accent)] bg-[var(--cream)] shadow-2xl lg:scale-[1.03] z-10"
      : "border border-[var(--border)] bg-[var(--cream)] shadow-sm hover:shadow-xl";

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 lg:p-10 transition-all duration-300 ${containerClass}`}
    >
      {highlighted && popularLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-[var(--accent)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            {popularLabel}
          </div>
        </div>
      )}

      {comingSoon && comingSoonLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] whitespace-nowrap">
            {comingSoonLabel}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-8">
        <h3 className={`text-2xl font-bold ${comingSoon ? "text-[var(--muted-foreground)]" : ""}`}>
          {name}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] font-medium">{tagline}</p>

        {showDiscount ? (
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-[var(--muted-foreground)] line-through">
              {currencySymbol}
              {price}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight">
                {currencySymbol}
                {discounted}
              </span>
              <span className="text-[var(--muted-foreground)] text-lg font-bold">
                {forLifeLabel ?? perMonthLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span
              className={`text-5xl font-black tracking-tight ${comingSoon ? "text-[var(--muted-foreground)]" : ""}`}
            >
              {currencySymbol}
              {price}
            </span>
            <span className="text-[var(--muted-foreground)] text-lg font-bold">
              {perMonthLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 flex-1 mb-8">
        {featuresLabel && (
          <p className="text-xs font-extrabold text-[var(--muted-foreground)] uppercase tracking-widest">
            {featuresLabel}
          </p>
        )}
        <ul className={`flex flex-col gap-4 ${comingSoon ? "text-[var(--muted-foreground)]" : ""}`}>
          {features.map((feature, i) => (
            <FeatureListItem key={i} feature={feature} muted={comingSoon} />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        {comingSoon ? (
          <div className="w-full flex items-center justify-center rounded-full h-14 px-6 border-2 border-[var(--border)] text-[var(--muted-foreground)] text-base font-extrabold cursor-not-allowed">
            <span>{ctaComingSoonLabel ?? cta}</span>
          </div>
        ) : highlighted ? (
          <Link
            href={ctaHref}
            className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 bg-[var(--accent)] text-white text-base font-extrabold shadow-lg shadow-[var(--accent)]/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>{cta}</span>
          </Link>
        ) : (
          <Link
            href={ctaHref}
            className="w-full flex cursor-pointer items-center justify-center rounded-full h-14 px-6 border-2 border-[var(--foreground)] text-[var(--foreground)] text-base font-extrabold transition-all hover:bg-[var(--foreground)] hover:text-white"
          >
            <span>{cta}</span>
          </Link>
        )}
        {!comingSoon && ctaSubtext && (
          <p className="text-xs text-center text-[var(--muted-foreground)]">{ctaSubtext}</p>
        )}
      </div>
    </div>
  );
}
