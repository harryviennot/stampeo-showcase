import { getTranslations } from "next-intl/server";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpCtaPair } from "./LpCtaPair";
import { LpSection } from "../shared/LpSection";

/** Each figure leans a little its own way, as the homepage's do, so a row of them never lines up like type. */
const TILTS = [-2, 1.5, -1];

/**
 * The figures written by hand, in the homepage's ink, each over its label: one column on a phone, a row
 * from `sm`. A `source` is printed once under the row, for figures that are someone's measurement.
 */
export function NumberFigures({
  items,
  source,
}: Readonly<{ items: Array<{ value: string; label: string }>; source?: string }>) {
  const figures = (
    <ul className="grid gap-8 text-center sm:grid-cols-3 sm:gap-6">
      {items.map((item, index) => (
        <li key={item.label} className="flex flex-col items-center">
          <p
            className="ink-figure whitespace-nowrap"
            style={{ fontSize: "clamp(3.5rem, 2.2rem + 4vw, 6rem)", transform: `rotate(${TILTS[index % TILTS.length]}deg)` }}
          >
            {item.value}
          </p>
          <p className="mt-2 text-lead text-[var(--muted-foreground)] sm:mt-3">{item.label}</p>
        </li>
      ))}
    </ul>
  );

  if (!source) return figures;

  return (
    <>
      {figures}
      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">{source}</p>
    </>
  );
}

/**
 * "Where Stampeo stands today": the site's own three metrics (one source, shared
 * with the proof line elsewhere), then the pair of actions.
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
      <NumberFigures items={items} />
      <div className="mt-12 flex justify-center lg:mt-14">
        <LpCtaPair location="feature_cta" />
      </div>
    </LpSection>
  );
}
