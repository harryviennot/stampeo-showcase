"use client";

import { Link } from "@/i18n/navigation";
import type { CTALocation } from "@/lib/analytics";
import { useCtaTracking } from "@/hooks/use-cta-tracking";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary" | "outline" | "link";

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

// Heights, not padding, so buttons of different sizes still line up in a row.
const sizeStyles: Record<Size, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-[52px] px-7 text-base",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20 hover:brightness-105",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/20",
  outline:
    "bg-transparent text-[var(--foreground)] border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white",
  // For a secondary action next to a primary button: reads as a link, still
  // reports its click like the others.
  link: "bg-transparent text-[var(--foreground)] underline-offset-4 hover:underline",
};

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
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all";

  return (
    <Link
      id={id}
      href={href}
      onClick={handleClick}
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
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
