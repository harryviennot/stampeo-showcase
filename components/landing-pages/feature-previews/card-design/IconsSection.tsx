import { ScaledBox } from "@/components/ui/ScaledBox";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";
import { SampleCard } from "./SampleCard";

/** The three cards, in the order of the captions: a shop's own citrus icons, a shop's own cones, and paws from the library. */
const CARDS = ["pulp", "gelo", "patoune"] as const;

const CARD = { width: 200, height: 257, narrow: 156 };

/**
 * "Use our stamp icons, or upload your own": three real cards, each named for what its stamps are, and the five
 * facts about the icons under them.
 */
export function IconsSection() {
  const { eyebrow, title, lead, facts, cards } = CARD_DESIGN_PREVIEW.icons;

  return (
    <LpSection section="icons" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ul className="mx-auto grid max-w-[760px] grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6">
        {CARDS.map((id, index) => (
          <li key={id} className="flex flex-col items-center gap-3 text-center max-sm:last:col-span-2">
            <div role="img" aria-label={cards[index]}>
              <div aria-hidden>
                <ScaledBox width={CARD.width} height={CARD.height} narrowTo={CARD.narrow} breakpoint="sm">
                  <SampleCard id={id} width={CARD.width} />
                </ScaledBox>
              </div>
            </div>
            <p aria-hidden className="max-w-[200px] text-sm font-medium text-pretty text-[var(--muted-foreground)]">
              {cards[index]}
            </p>
          </li>
        ))}
      </ul>
      <FactList facts={facts.map((text) => ({ text }))} className="mx-auto mt-12 max-w-md lg:mt-14" />
    </LpSection>
  );
}
