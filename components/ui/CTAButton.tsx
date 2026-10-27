"use client";

import { Link } from "@/i18n/navigation";
import type { CTALocation } from "@/lib/analytics";
import { useCtaTracking } from "@/hooks/use-cta-tracking";
import {
  ctaBase,
  ctaSizeStyles,
  ctaVariantStyles,
  type CtaSize,
  type CtaVariant,
} from "./cta-styles";

type Size = CtaSize;
type Variant = CtaVariant;

type CTAButtonProps = Readonly<{
  label: string;
  href?: string;
  size?: Size;
  variant?: Variant;
  className?: string;
  id?: string;
  showArrow?: boolean;
  /** Where the button sits; sent with the click to PostHog, GA4 and Meta. */
  trackAs: CTALocation;
}>;

export function CTAButton({
  label,
  href = "/onboarding",
  size = "lg",
  variant = "primary",
  className = "",
  id,
  showArrow = true,
  trackAs,
}: CTAButtonProps) {
  const handleClick = useCtaTracking(trackAs, href);

  return (
    <Link
      id={id}
      href={href}
      onClick={handleClick}
      className={`${ctaBase} ${ctaSizeStyles[size]} ${ctaVariantStyles[variant]} ${className}`}
    >
      <span>{label}</span>
      {showArrow && (
        <span className="transition-transform group-hover:translate-x-1">
          →
        </span>
      )}
    </Link>
  );
}
