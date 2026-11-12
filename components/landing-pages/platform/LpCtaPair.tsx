import { CTAButton } from "@/components/ui/CTAButton";
import { ChevronDownIcon } from "@/components/icons";
import { SHARED } from "@/lib/landing-pages/copy/shared";

/** A second action: a label, and the anchor on the page it scrolls to. */
export interface SecondaryAction {
  label: string;
  href: string;
}

/** What the second action is unless the page says otherwise: "Try it on your phone", to the demo. */
const DEMO: SecondaryAction = { label: SHARED.demoLink, href: "#demo" };

/**
 * The two actions side by side: the trial and, as an outline pill of the same
 * height, a second action that scrolls to a section of the page ("Try it on
 * your phone" to the demo, unless the page names its own; `null` for none).
 * Stacked and full width on a phone; one centred row from `sm`.
 */
export function LpCtaPair({
  location,
  secondary = DEMO,
}: Readonly<{ location: "hero" | "feature_cta"; secondary?: SecondaryAction | null }>) {
  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
      <CTAButton label={SHARED.cta} trackAs={location} className="w-full sm:w-auto" />
      {secondary && (
        // A plain anchor: the click is a scroll, not a contact.
        <a
          href={secondary.href}
          className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--foreground)] px-7 text-base font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white sm:w-auto"
        >
          {secondary.label}
          <ChevronDownIcon size={16} weight="bold" aria-hidden />
        </a>
      )}
    </div>
  );
}
