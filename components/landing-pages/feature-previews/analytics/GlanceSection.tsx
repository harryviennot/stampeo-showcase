import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { ToggleCard } from "../../platform/ToggleCard";
import { GlanceTiles } from "./GlanceTiles";

/** The every-plan dashboard tiles on Platform's white surface, beside what an owner sees from day one. */
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
