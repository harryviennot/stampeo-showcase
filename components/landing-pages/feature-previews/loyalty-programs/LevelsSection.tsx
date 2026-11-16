import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { LpSection } from "../../shared/LpSection";
import { LevelFactTiles } from "./LevelFactTiles";
import { LevelLadder } from "./LevelLadder";

/**
 * "Add levels": the dry cleaner's ladder from Bronze to Gold, what levels can do in four tiles, and the tip.
 * `#levels` is the hero's second button.
 */
export function LevelsSection() {
  const { eyebrow, title, lead, facts, tip } = LOYALTY_PROGRAMS_PREVIEW.levels;
  const { tipLabel } = LOYALTY_PROGRAMS_PREVIEW.settings;
  const tipBody = tip.startsWith(tipLabel) ? tip.slice(tipLabel.length).trim() : tip;

  return (
    <LpSection section="levels" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <LevelLadder />
      <div className="mt-12 lg:mt-16">
        <LevelFactTiles tiles={facts} columns="sm:grid-cols-2 lg:grid-cols-4" />
      </div>
      <p className="mx-auto mt-8 max-w-[640px] text-center text-base text-pretty text-[var(--muted-foreground)]">
        <strong className="font-semibold text-[var(--foreground)]">{tipLabel}</strong> {tipBody}
      </p>
    </LpSection>
  );
}
