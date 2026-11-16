import { CTAButton } from "@/components/ui/CTAButton";
import { SHARED } from "@/lib/landing-pages/copy/shared";

/** The trial offered again between a page's sections: a keycap, tracked as a feature CTA. */
export function LpTrialButton({ className = "" }: Readonly<{ className?: string }>) {
  return <CTAButton label={SHARED.cta} trackAs="feature_cta" keycap className={`w-full sm:w-auto ${className}`} />;
}
