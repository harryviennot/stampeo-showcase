import type { Icon } from "@phosphor-icons/react";
import { Gift, PaperPlaneIcon, PrinterIcon, TranslateIcon } from "@/components/icons";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { IconTile } from "../shared/IconTile";
import { LpSection } from "../shared/LpSection";
import { LpTrialButton } from "../shared/LpTrialButton";

/** One icon for each tile, in the copy's order. */
const ICONS: Icon[] = [Gift, PaperPlaneIcon, PrinterIcon, TranslateIcon];

/**
 * Everything else the card does: four tiles, a list on a phone and four
 * columns from `lg`, then the trial.
 */
export function MoreFeaturesGrid() {
  return (
    <LpSection section="more_features" title={FEATURES.more.title} lead={FEATURES.more.lead} align="center">
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {FEATURES.more.tiles.map((tile, index) => {
          const Icon = ICONS[index];
          return (
            <li
              key={tile.title}
              className="flex items-start gap-4 rounded-2xl bg-white p-3.5 ring-1 ring-[var(--border)] sm:p-5"
            >
              <IconTile tone="subtle">
                <Icon size={22} weight="duotone" aria-hidden />
              </IconTile>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-[var(--foreground)]">{tile.title}</h3>
                <p className="mt-1 text-pretty text-sm text-[var(--muted-foreground)]">{tile.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <ScrollReveal className="mt-10 flex justify-center">
        <LpTrialButton />
      </ScrollReveal>
    </LpSection>
  );
}
