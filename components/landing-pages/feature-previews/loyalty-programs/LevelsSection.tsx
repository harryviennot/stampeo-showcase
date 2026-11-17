import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpSection } from "../../shared/LpSection";
import { LevelFactTiles } from "./LevelFactTiles";
import { LevelLadder } from "./LevelLadder";

/**
 * "Add levels": the barbershop's ladder from Bronze to Gold, what levels can do in four tiles, and the tip.
 * `#levels` is the hero's second button.
 */
export function LevelsSection() {
  const copy = useLandingCopy().previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW;
  const { eyebrow, title, lead, facts, tip } = copy.levels;
  const { tipLabel } = copy.settings;
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
