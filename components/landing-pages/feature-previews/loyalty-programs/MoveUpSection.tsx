import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { CARD_SHADOW, CELL_TITLE } from "../../platform/classes";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";
import { LevelFactTiles } from "./LevelFactTiles";
import { MovePointsMeter, MoveStampsMeter } from "./MoveUpMeters";

const PANEL = `flex flex-col rounded-[32px] bg-white p-6 ring-1 ring-black/5 ${CARD_SHADOW} sm:p-8 lg:p-10`;

/**
 * "Moving up": two white panels, what counts on a stamp card and on a points card, each with a small meter of a
 * Silver customer's progress toward Gold, then three more facts about moving up.
 */
export function MoveUpSection() {
  const { eyebrow, title, lead, stamps, points, facts } = LOYALTY_PROGRAMS_PREVIEW.moveUp;

  return (
    <LpSection section="move_up" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="mx-auto grid max-w-[1040px] gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={PANEL}>
          <h3 className={CELL_TITLE}>{stamps.title}</h3>
          <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{stamps.body}</p>
          <div className="mt-auto pt-8">
            <MoveStampsMeter copy={stamps} />
          </div>
        </div>

        <div className={PANEL}>
          <h3 className={CELL_TITLE}>{points.title}</h3>
          <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{points.body}</p>
          <div className="mt-auto pt-8">
            <MovePointsMeter copy={points} />
            <FactList facts={[{ text: points.spent }]} className="mt-5" />
          </div>
        </div>
      </div>

      <div className="mt-6 lg:mt-8">
        <LevelFactTiles tiles={facts} columns="sm:grid-cols-3" />
      </div>
    </LpSection>
  );
}
