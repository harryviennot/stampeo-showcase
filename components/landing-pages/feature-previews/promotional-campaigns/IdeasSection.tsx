import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { CARD_SHADOW, CARD_TITLE } from "../../platform/classes";
import { LpSection } from "../../shared/LpSection";
import { LockScreenSlice } from "../push-notifications/LockScreenSlice";

const TITLE = `${CARD_TITLE} lg:text-[1.375rem]`;
const CARD = `flex flex-col rounded-[28px] bg-white p-5 ${CARD_SHADOW} ring-1 ring-black/5 lg:p-6`;

/** Four campaigns a café could send, each on its own white card: its name, the message on Aurevo's lock screen and who gets it. */
export function IdeasSection() {
  return (
    <LpSection section="ideas" eyebrow={COPY.ideas.eyebrow} title={COPY.ideas.title} lead={COPY.ideas.lead} align="center">
      <ul className="mx-auto grid max-w-[560px] gap-4 text-left lg:max-w-[1040px] lg:grid-cols-2 lg:gap-6">
        {COPY.ideas.rows.map((row) => (
          <li key={row.key} className={CARD}>
            <h3 className={TITLE}>{row.name}</h3>
            <div className="mt-4 flex-1">
              <LockScreenSlice banner={row.banner} compact className="h-full" />
            </div>
            <p className="mt-4 text-[15px] text-pretty text-[var(--muted-foreground)]">{row.body}</p>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
