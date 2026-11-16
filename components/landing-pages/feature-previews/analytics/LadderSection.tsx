import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { Ladder } from "./Ladder";

/**
 * "Every plan answers. Growth and Pro chart it": what each plan sees of the same questions, from Starter's
 * one-line sentences to Pro's cohorts, with the history each plan keeps.
 */
export function LadderSection() {
  const { eyebrow, title, lead } = ANALYTICS_PREVIEW.ladder;

  return (
    <LpSection section="ladder" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <Ladder />
    </LpSection>
  );
}
