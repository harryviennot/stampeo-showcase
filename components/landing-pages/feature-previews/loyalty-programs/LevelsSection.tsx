import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { LpSection } from "../../shared/LpSection";

/** Placeholder until the section is built; `#levels` is the hero's second button. */
export function LevelsSection() {
  const { eyebrow, title, lead } = LOYALTY_PROGRAMS_PREVIEW.levels;

  return <LpSection section="levels" anchor eyebrow={eyebrow} title={title} lead={lead} align="center" />;
}
