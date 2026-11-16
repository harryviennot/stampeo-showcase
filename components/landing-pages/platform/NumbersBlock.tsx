import { getTranslations } from "next-intl/server";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpCtaPair } from "./LpCtaPair";
import { NumberFigures } from "./NumberFigures";
import { LpSection } from "../shared/LpSection";

/**
 * "Where Stampeo stands today": the site's own three metrics (one source, shared
 * with the proof line elsewhere), the measured share of cards still in the wallet
 * with its source under it, then the pair of actions.
 */
export async function NumbersBlock() {
  const t = await getTranslations("variant.metrics");
  const counts = t.raw("items") as Array<{ value: string; label: string }>;
  const items = [...counts, ...PLATFORM.numbers.figures.map(({ value, text, source }) => ({ value, label: text, source }))];

  return (
    <LpSection
      section="numbers"
      eyebrow={PLATFORM.numbers.eyebrow}
      title={PLATFORM.numbers.title}
      align="center"
    >
      <NumberFigures items={items} />
      <div className="mt-12 flex justify-center lg:mt-14">
        <LpCtaPair location="feature_cta" />
      </div>
    </LpSection>
  );
}
