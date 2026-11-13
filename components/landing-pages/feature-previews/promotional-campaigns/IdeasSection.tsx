import type { ReactNode } from "react";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { HoverRows } from "../../platform/HoverRows";
import { LpSection } from "../../shared/LpSection";
import { LockScreenSlice } from "../push-notifications/LockScreenSlice";

type Key = (typeof COPY.ideas.rows)[number]["key"];

/** A row's notification: drawn 200px wide (zoomed to 216px under the words on a phone), 124px tall to fit the longest message. */
const SLICE = { width: 200, height: 124, narrow: 128 };

const VISUALS = Object.fromEntries(
  COPY.ideas.rows.map((row) => [
    row.key,
    <ScaledBox key={row.key} width={SLICE.width} height={SLICE.height} narrowTo={SLICE.narrow}>
      <LockScreenSlice banner={row.banner} size="thumb" />
    </ScaledBox>,
  ]),
) as Record<Key, ReactNode>;

/** "Give them a reason to come in today": four broadcasts a café could send, a row each with the message on Aurevo's lock screen. */
export function IdeasSection() {
  return (
    <LpSection section="ideas" eyebrow={COPY.ideas.eyebrow} title={COPY.ideas.title} lead={COPY.ideas.lead} align="center">
      <HoverRows items={COPY.ideas.rows} visuals={VISUALS} stackOnPhone={216} />
    </LpSection>
  );
}
