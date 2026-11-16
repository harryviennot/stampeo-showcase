import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { CARD_SHADOW, CELL_TITLE } from "../../platform/classes";
import { AurevoCard } from "../../shared/AurevoCard";
import { FactList } from "../../shared/FactList";
import { EYEBROW, LpSection } from "../../shared/LpSection";
import { PassFrame } from "../../shared/PassFrame";
import { VANITY } from "../../shared/samples";

/** The card as drawn, and the width it shrinks to on a phone. */
const CARD = { width: 240, height: 308, narrow: 200 };

const PANEL = `flex flex-col rounded-[32px] bg-white p-6 ring-1 ring-black/5 ${CARD_SHADOW} sm:p-8 lg:p-10`;

/**
 * "Stamps or points": a white card for each, its real wallet card on top, then what it is, three facts and, at the
 * foot, the kind of business it suits. The two cards are as tall as each other.
 */
export async function ProgramsSection() {
  const { eyebrow, title, lead, stamps, points, bestForLabel } = LOYALTY_PROGRAMS_PREVIEW.programs;
  const programs = [
    {
      copy: stamps,
      card: <AurevoCard stamps={5} width={CARD.width} />,
    },
    {
      copy: points,
      card: (
        <PassFrame width={CARD.width}>
          <WalletCard design={VANITY.design} pointsBalance={VANITY.pointsBalance} pointsRewards={VANITY.pointsRewards} />
        </PassFrame>
      ),
    },
  ];

  return (
    <LpSection section="programs" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ul className="mx-auto grid max-w-[1040px] gap-6 lg:grid-cols-2 lg:gap-8">
        {programs.map(({ copy, card }) => (
          <li key={copy.title} className={PANEL}>
            <div role="img" aria-label={copy.alt} className="flex justify-center">
              <div aria-hidden>
                <ScaledBox width={CARD.width} height={CARD.height} narrowTo={CARD.narrow} breakpoint="sm">
                  {card}
                </ScaledBox>
              </div>
            </div>

            <h3 className={`mt-8 ${CELL_TITLE}`}>{copy.title}</h3>
            <p className="mt-2 text-base text-pretty text-[var(--muted-foreground)]">{copy.line}</p>
            <FactList facts={copy.facts} className="mt-6" />

            <div className="mt-auto pt-6">
              <p className="border-t border-black/5 pt-5">
                <span className={`block ${EYEBROW} text-[var(--muted-foreground)]`}>{bestForLabel}</span>
                <span className="mt-1.5 block text-base text-pretty text-[var(--foreground)]">{copy.bestFor}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
