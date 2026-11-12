import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { HoverRows } from "../../platform/HoverRows";
import { LpSection } from "../../shared/LpSection";
import { LockScreenSlice } from "../push-notifications/LockScreenSlice";

type Key = (typeof COPY.ideas.rows)[number]["key"];

/** A row's lock screen is drawn 240px wide and shrunk to 128px beside the words on a phone. */
const SLICE = { width: 240, height: 150, narrow: 128 };

const VISUALS = Object.fromEntries(
  COPY.ideas.rows.map((row) => [
    row.key,
    <ScaledBox key={row.key} width={SLICE.width} height={SLICE.height} narrowTo={SLICE.narrow}>
      <LockScreenSlice banner={row.banner} size="thumb" />
    </ScaledBox>,
  ]),
) as Record<Key, React.ReactNode>;

/**
 * "Give them a reason to come in today": four broadcasts a café could send, a row each
 * with the message on Aurevo's lock screen. Every row is open on a phone and under
 * reduced motion; the rows that need Pro's targeting say so.
 */
export function IdeasSection() {
  return (
    <LpSection section="ideas" eyebrow={COPY.ideas.eyebrow} title={COPY.ideas.title} lead={COPY.ideas.lead} align="center">
      <HoverRows items={COPY.ideas.rows} visuals={VISUALS} />
    </LpSection>
  );
}
