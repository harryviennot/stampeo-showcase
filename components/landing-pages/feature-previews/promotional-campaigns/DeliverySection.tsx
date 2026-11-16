import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { ToggleCard } from "../../platform/ToggleCard";
import { LpSection } from "../../shared/LpSection";
import { DeliveryCard } from "./DeliveryCard";

/** The delivery card beside its three facts, on one white surface as wide as the page's other cards. */
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
      <div className="mx-auto max-w-[1040px]">
        <ToggleCard
          ariaLabel={COPY.delivery.title}
          tabs={[{ key: "delivery", label: tab.title, title: tab.title, facts: tab.facts, visual: <DeliveryCard /> }]}
        />
      </div>
    </LpSection>
  );
}
