import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { LpSection } from "../../shared/LpSection";
import { BroadcastComposer } from "./BroadcastComposer";

/** "Write it, pick who gets it, send": the dashboard's New broadcast screen, with the lock screen it sends to. */
export function ComposerSection() {
  return (
    <LpSection section="composer" eyebrow={COPY.composer.eyebrow} title={COPY.composer.title} lead={COPY.composer.lead} align="center">
      <BroadcastComposer />
    </LpSection>
  );
}
