"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  trackLandingCTAClicked,
  trackLandingDemoCTAClicked,
  type CTALocation,
} from "@/lib/analytics";
import { isTrackablePath } from "@/lib/consent-routes";
import { gaEventForCTA, trackGaEvent } from "@/lib/google-analytics";
import { metaEventForCTA, trackMetaEvent } from "@/lib/meta-pixel";

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
  /** When set, fires a landing CTA event on click. Event name is auto-picked
   *  based on href — `/contact*` → `landing_demo_cta_clicked`, else `landing_cta_clicked`. */
  trackAs?: CTALocation;
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
  const locale = useLocale();
  const pathname = usePathname();
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all";

  const handleClick = trackAs
    ? () => {
        const props = { locale, cta_location: trackAs, href };
        if (href.startsWith("/contact")) {
          trackLandingDemoCTAClicked(props);
        } else {
          trackLandingCTAClicked(props);
        }

        // Alongside PostHog, never instead of it: the two serve different
        // questions and the PostHog taxonomy already feeds live dashboards.
        // A no-op unless the pixel actually loaded, so no consent check here.
        const trackable = isTrackablePath(pathname);

        const metaEvent = metaEventForCTA({ ctaLocation: trackAs, href });
        if (metaEvent) {
          trackMetaEvent({ event: metaEvent, trackable });
        }

        // GA4 takes the same click under the analytics category. It carries
        // the CTA context as parameters because, unlike Meta, GA4 reports on
        // custom dimensions rather than on the event name alone.
        const gaEvent = gaEventForCTA({ ctaLocation: trackAs, href });
        if (gaEvent) {
          trackGaEvent({
            event: gaEvent,
            trackable,
            params: { cta_location: trackAs, locale, href },
          });
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
