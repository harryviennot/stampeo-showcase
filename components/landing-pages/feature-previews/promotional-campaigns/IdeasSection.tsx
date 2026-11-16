import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { LpSection } from "../../shared/LpSection";
import { LockScreenSlice } from "../push-notifications/LockScreenSlice";

/** An idea's name: the title of a chart card or a floating card, left-aligned over its picture. */
const TITLE = "text-[1.25rem] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-[var(--foreground)] lg:text-[1.375rem]";

/** Four campaigns a café could send, each on its own white card: its name, the message on Aurevo's lock screen and who gets it. */
export function IdeasSection() {
  return (
    <LpSection section="ideas" eyebrow={COPY.ideas.eyebrow} title={COPY.ideas.title} lead={COPY.ideas.lead} align="center">
      <ul className="mx-auto grid max-w-[560px] gap-4 text-left lg:max-w-[1040px] lg:grid-cols-2 lg:gap-6">
        {COPY.ideas.rows.map((row) => (
          <li
            key={row.key}
            className="flex flex-col rounded-[28px] bg-white p-5 shadow-[0_2px_4px_rgba(25,18,16,0.04),0_32px_72px_-32px_rgba(25,18,16,0.18)] ring-1 ring-black/5 lg:p-6"
          >
            <h3 className={TITLE}>{row.chip}</h3>
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
