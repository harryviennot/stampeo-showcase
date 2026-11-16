import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { LpSection } from "../../shared/LpSection";
import { IdeasChips } from "./IdeasChips";

/** Four broadcasts a café could send, picked from a row of chips. */
export function IdeasSection() {
  return (
    <LpSection section="ideas" eyebrow={COPY.ideas.eyebrow} title={COPY.ideas.title} lead={COPY.ideas.lead} align="center">
      <IdeasChips />
    </LpSection>
  );
}
