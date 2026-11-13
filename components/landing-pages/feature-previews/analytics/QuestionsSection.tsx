import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { HoverRows } from "../../platform/HoverRows";
import { LpSection } from "../../shared/LpSection";
import { BusiestMini, HabitsMini, RewardProgressMini, ReturnRateMini } from "./QuestionMinis";

/** "What a paper card can't tell you": a row per question, each answered by its dashboard tile, and a line under the rows for what Starter shows instead. */
export function QuestionsSection() {
  const { eyebrow, title, lead, rows, closer } = ANALYTICS_PREVIEW.questions;

  return (
    <LpSection section="questions" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <HoverRows
        items={rows}
        stackOnPhone={288}
        visuals={{
          return: <ReturnRateMini />,
          habits: <HabitsMini />,
          busiest: <BusiestMini />,
          rewards: <RewardProgressMini />,
        }}
        closer={<p className="mt-6 text-center text-sm text-pretty text-[var(--muted-foreground)]">{closer}</p>}
      />
    </LpSection>
  );
}
