import { getTranslations } from "next-intl/server";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpCtaPair } from "./LpCtaPair";
import { LpSection } from "../shared/LpSection";

/**
 * "Where Stampeo stands today": the site's own three metrics as large figures
 * (one source, shared with the proof line elsewhere), then the pair of actions.
 */
export async function NumbersBlock() {
  const t = await getTranslations("variant.metrics");
  const items = t.raw("items") as Array<{ value: string; label: string }>;

  return (
    <LpSection
      section="numbers"
      eyebrow={PLATFORM.numbers.eyebrow}
      title={PLATFORM.numbers.title}
      align="center"
    >
      <ul className="grid gap-6 text-center sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.label}>
            <p className="text-h1 tabular-nums text-[var(--accent-hover)]">{item.value}</p>
            <p className="mt-2 text-lead text-[var(--muted-foreground)]">{item.label}</p>
          </li>
        ))}
      </ul>
      <div className="mt-12 flex justify-center lg:mt-14">
        <LpCtaPair location="feature_cta" />
      </div>
    </LpSection>
  );
}
