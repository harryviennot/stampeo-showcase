import { CTAButton } from "@/components/ui/CTAButton";
import { ChevronDownIcon } from "@/components/icons";
import { SHARED } from "@/lib/landing-pages/copy/shared";

/**
 * The two actions side by side: the trial and, as an outline pill of the same
 * height, "Try it on your phone", which scrolls to the demo. Stacked and full
 * width on a phone; one centred row from `sm`.
 */
export function LpCtaPair({ location }: Readonly<{ location: "hero" | "feature_cta" }>) {
  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
      <CTAButton label={SHARED.cta} trackAs={location} className="w-full sm:w-auto" />
      {/* A plain anchor: the click is a scroll, not a contact. */}
      <a
        href="#demo"
        className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--foreground)] px-7 text-base font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white sm:w-auto"
      >
        {SHARED.demoLink}
        <ChevronDownIcon size={16} weight="bold" aria-hidden />
      </a>
    </div>
  );
}
