import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { CELL_TITLE } from "../../platform/classes";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";
import { DeliveryCard } from "./DeliveryCard";

/** The last campaign's report on its own white card, and what every campaign shows beside it from `lg` (under it on a phone). */
export function DeliverySection() {
  const COPY = useLandingCopy().previews.promotionalCampaigns.PROMOTIONAL_CAMPAIGNS_PREVIEW;
  const { after } = COPY.delivery;

  return (
    <LpSection
      section="delivery"
      eyebrow={COPY.delivery.eyebrow}
      title={COPY.delivery.title}
      lead={COPY.delivery.lead}
      align="center"
    >
      <div className="mx-auto grid max-w-[520px] gap-10 text-left lg:max-w-[1040px] lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-7">
          <DeliveryCard />
        </div>
        <div className="lg:col-span-5">
          <h3 className={`${CELL_TITLE} text-balance lg:text-[2rem]`}>{after.title}</h3>
          <FactList facts={after.facts} className="mt-6" />
        </div>
      </div>
    </LpSection>
  );
}
