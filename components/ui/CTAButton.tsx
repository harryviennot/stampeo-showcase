"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  trackLandingCTAClicked,
  trackLandingDemoCTAClicked,
  type CTALocation,
} from "@/lib/analytics";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "secondary" | "outline";

type CTAButtonProps = Readonly<{
  label: string;
  href?: string;
  size?: Size;
  variant?: Variant;
  className?: string;
  id?: string;
  showArrow?: boolean;
  /** When set, fires a landing CTA event on click. Event name is auto-picked
   *  based on href — `/contact*` → `landing_demo_cta_clicked`, else `landing_cta_clicked`. */
  trackAs?: CTALocation;
}>;

const sizeStyles: Record<Size, string> = {
  sm: "h-11 px-6 text-sm",
  md: "px-8 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "h-16 md:h-20 px-10 text-lg md:text-xl min-w-[280px] md:min-w-[340px] justify-center",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/25 hover:scale-105 hover:brightness-110",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/20",
  outline:
    "bg-transparent text-[var(--foreground)] border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white",
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
  const locale = useLocale();
  const base =
    "group inline-flex items-center gap-2 rounded-full font-bold transition-all";

  const handleClick = trackAs
    ? () => {
        const props = { locale, cta_location: trackAs, href };
        if (href.startsWith("/contact")) {
          trackLandingDemoCTAClicked(props);
        } else {
          trackLandingCTAClicked(props);
        }
      }
    : undefined;

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
