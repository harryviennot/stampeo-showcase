import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { ToggleCard } from "../../platform/ToggleCard";
import { CustomersMini } from "./CustomersMini";
import { TRAY } from "./GlanceTiles";

/** A toggle between the live feed of visits (still for a reader who asks for less motion) and the groups the dashboard sorts customers into. */
export function ActivitySection() {
  const { eyebrow, title, lead, tabs } = ANALYTICS_PREVIEW.activity;

  return (
    <LpSection section="activity" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ToggleCard
        ariaLabel={title}
        tabs={[
          {
            key: "live",
            ...tabs.live,
            facts: [...tabs.live.facts],
            visual: (
              <div className={TRAY}>
                <LiveActivityFeed cardOnly stillWhenReduced softFrame roomBelow />
              </div>
            ),
          },
          {
            key: "customers",
            ...tabs.customers,
            facts: [...tabs.customers.facts],
            visual: (
              <div className={TRAY}>
                <CustomersMini />
              </div>
            ),
          },
        ]}
      />
    </LpSection>
  );
}
