import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { ToggleCard } from "../../platform/ToggleCard";
import { LpSection } from "../../shared/LpSection";
import { DeliveryCard } from "./DeliveryCard";

/** "See where every message landed": one white surface, the delivery card beside its three facts. */
export function DeliverySection() {
  const { tab } = COPY.delivery;

  return (
    <LpSection
      section="delivery"
      eyebrow={COPY.delivery.eyebrow}
      title={COPY.delivery.title}
      lead={COPY.delivery.lead}
      align="center"
    >
      <ToggleCard
        ariaLabel={COPY.delivery.title}
        tabs={[{ key: "delivery", label: tab.title, title: tab.title, facts: tab.facts, visual: <DeliveryCard /> }]}
      />
    </LpSection>
  );
}
