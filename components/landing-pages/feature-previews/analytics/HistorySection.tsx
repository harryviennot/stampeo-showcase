import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { LpCtaPair } from "../../platform/LpCtaPair";
import { NumberFigures } from "../../platform/NumberFigures";

/**
 * "Look back as far as your plan goes": each plan's days of history, written by
 * hand, then the trial. The page has no demo, so there is no second action.
 */
export function HistorySection() {
  const { eyebrow, title, figures } = ANALYTICS_PREVIEW.numbers;

  return (
    <LpSection section="numbers" eyebrow={eyebrow} title={title} align="center">
      <NumberFigures items={[...figures]} />
      <div className="mt-12 flex justify-center lg:mt-14">
        <LpCtaPair location="feature_cta" secondary={null} />
      </div>
    </LpSection>
  );
}
