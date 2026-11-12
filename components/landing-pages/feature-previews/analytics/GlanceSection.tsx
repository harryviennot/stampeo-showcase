import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { ToggleCard } from "../../platform/ToggleCard";
import { GlanceTiles } from "./GlanceTiles";

/**
 * "Your numbers, updated with every scan": Platform's white surface with one
 * pane, so no tabs: the every-plan dashboard tiles drawn on one side, what an
 * owner sees from day one on the other.
 */
export function GlanceSection() {
  const { eyebrow, title, lead, tab } = ANALYTICS_PREVIEW.glance;

  return (
    <LpSection section="glance" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ToggleCard
        ariaLabel={title}
        tabs={[{ key: "glance", label: eyebrow, title: tab.title, facts: [...tab.facts], visual: <GlanceTiles /> }]}
      />
    </LpSection>
  );
}
