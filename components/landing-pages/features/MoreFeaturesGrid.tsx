import type { Icon } from "@phosphor-icons/react";
import {
  CalendarCheckIcon,
  Gift,
  MapPinIcon,
  PaperPlaneIcon,
  PrinterIcon,
  TranslateIcon,
} from "@/components/icons";
import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSection } from "../shared/LpSection";
import { PlanChip } from "../shared/PlanChip";

/** One icon for each tile, in the copy's order. */
const ICONS: Icon[] = [
  Gift,
  PaperPlaneIcon,
  PrinterIcon,
  TranslateIcon,
  CalendarCheckIcon,
  MapPinIcon,
];

/**
 * Everything else the card does: six tiles with their plans, a list on a
 * phone and three columns from `lg`, then the trial in an outline button.
 */
export function MoreFeaturesGrid() {
  return (
    <LpSection section="more_features" title={FEATURES.more.title} lead={FEATURES.more.lead} align="center">
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {FEATURES.more.tiles.map((tile, index) => {
          const Icon = ICONS[index];
          return (
            <li
              key={tile.title}
              className="flex items-start gap-4 rounded-2xl bg-white p-3.5 ring-1 ring-[var(--border)] sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--background-subtle)] text-[var(--accent-hover)]">
                <Icon size={22} weight="duotone" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <h3 className="text-[15px] font-semibold text-[var(--foreground)]">{tile.title}</h3>
                  {tile.plan && <PlanChip plan={tile.plan} />}
                </div>
                <p className="mt-1 text-pretty text-sm text-[var(--muted-foreground)]">{tile.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <ScrollReveal className="mt-10 flex justify-center">
        <CTAButton label={SHARED.cta} variant="outline" trackAs="feature_cta" className="w-full sm:w-auto" />
      </ScrollReveal>
    </LpSection>
  );
}
