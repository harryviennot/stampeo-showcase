import { CTAButton } from "@/components/ui/CTAButton";
import type { CTALocation } from "@/lib/analytics";

export function CallToAction({
  title,
  buttonText,
  href = "/onboarding",
  trackAs = "blog_cta",
}: {
  title: string;
  buttonText: string;
  href?: string;
  /** Where the button sits, as the click is reported. */
  trackAs?: CTALocation;
}) {
  return (
    <div className="not-prose my-8 p-8 text-center bg-white rounded-2xl blog-card-3d">
      <p className="text-lg font-bold mb-4 text-[var(--near-black)]">
        <span className="blog-highlight">{title}</span>
      </p>
      <CTAButton label={buttonText} href={href} size="sm" trackAs={trackAs} />
    </div>
  );
}
