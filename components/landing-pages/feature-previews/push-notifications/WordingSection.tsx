import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { ToggleCard } from "../../platform/ToggleCard";
import { LpSection } from "../../shared/LpSection";
import { LockScreenSlice } from "./LockScreenSlice";

/**
 * "Use our wording, or write your own": a toggle card with the ready-made messages
 * (the default stamp banner) and the owner's own words (a banner with a first name).
 */
export function WordingSection() {
  const { ready, words } = COPY.wording.tabs;

  return (
    <LpSection
      section="wording"
      eyebrow={COPY.wording.eyebrow}
      title={COPY.wording.title}
      lead={COPY.wording.lead}
      align="center"
    >
      <ToggleCard
        ariaLabel={COPY.wording.title}
        tabs={[
          {
            key: "ready",
            label: ready.label,
            title: ready.title,
            facts: ready.facts,
            visual: <LockScreenSlice banner={STAMP_BANNER} />,
          },
          {
            key: "words",
            label: words.label,
            title: words.title,
            facts: words.facts,
            visual: <LockScreenSlice banner={words.banner} />,
          },
        ]}
      />
    </LpSection>
  );
}
