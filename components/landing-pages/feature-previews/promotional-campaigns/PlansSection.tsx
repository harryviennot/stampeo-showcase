import { ArrowRightIcon } from "@/components/icons";
import { MarketLink } from "@/components/market/MarketLink";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { marketPath } from "@/lib/markets";
import { ARROW_LINK } from "../../platform/classes";
import { StepsTable } from "../../platform/StepsTable";
import { LpSection } from "../../shared/LpSection";

/** Growth's cell and Pro's side by side, and the link to compare the plans. */
export function PlansSection() {
  return (
    <LpSection section="plans" eyebrow={COPY.plans.eyebrow} title={COPY.plans.title} lead={COPY.plans.lead} align="center">
      <StepsTable
        cells={COPY.plans.cells}
        link={
          <MarketLink market="us" href={marketPath("us", "/pricing")} className={ARROW_LINK}>
            {COPY.plans.link}
            <ArrowRightIcon size={16} weight="bold" aria-hidden />
          </MarketLink>
        }
      />
    </LpSection>
  );
}
