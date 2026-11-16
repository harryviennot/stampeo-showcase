import { ScaledBox } from "@/components/ui/ScaledBox";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LevelCards } from "../../shared/LevelCards";
import { LpSection } from "../../shared/LpSection";
import { SampleCard } from "./SampleCard";

/** A card is drawn 240px wide on a laptop and 144px beside its words on a phone. */
const CARD = { width: 240, height: 308, narrow: 144 };
/** The three level cards fan out in a stage of the same weight as a single card. */
const LEVELS_STAGE = { narrowTo: 144, to: 288, breakpoint: "lg" } as const;

/** The card of each program: a burger bar's stamps, a gym's points and a dry cleaner's levels, none of them shown elsewhere on the page. */
const VISUALS = [
  <ScaledBox key="stamps" width={CARD.width} height={CARD.height} narrowTo={CARD.narrow}>
    <SampleCard id="smash-club" width={CARD.width} />
  </ScaledBox>,
  <ScaledBox key="points" width={CARD.width} height={CARD.height} narrowTo={CARD.narrow}>
    <SampleCard id="forme" width={CARD.width} />
  </ScaledBox>,
  <LevelCards key="levels" size={LEVELS_STAGE} />,
];

/**
 * "A stamp card, a points card or levels": a real card of each with its title and a line under it. On a phone each
 * is a row with the card beside its words; from `lg` three columns with the card over its words.
 */
export function TypesSection() {
  const { eyebrow, title, lead, cards, alts } = CARD_DESIGN_PREVIEW.programs;

  return (
    <LpSection section="types" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ul className="mx-auto grid max-w-[1040px] gap-8 lg:grid-cols-3 lg:gap-10">
        {cards.map((card, index) => (
          <li
            key={card.title}
            className="grid grid-cols-[144px_1fr] items-center gap-5 lg:grid-cols-1 lg:justify-items-center lg:gap-7 lg:text-center"
          >
            <div role="img" aria-label={alts[index]} className="justify-self-center">
              <div aria-hidden>{VISUALS[index]}</div>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-[-0.01em] text-[var(--foreground)]">{card.title}</h3>
              <p className="mt-2 text-base text-pretty text-[var(--muted-foreground)]">{card.line}</p>
            </div>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
