import { CTAButton } from "@/components/ui/CTAButton";
import type { CTALocation } from "@/lib/analytics";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";

/** The trial offered again between a page's sections: a keycap, tracked under the `location` of the page's section it follows. */
export function LpTrialButton({ location, className = "" }: Readonly<{ location: CTALocation; className?: string }>) {
  const { SHARED } = useLandingCopy().shared;

  return <CTAButton label={SHARED.cta} trackAs={location} keycap className={`mb-[3px] w-full sm:w-auto ${className}`} />;
}
