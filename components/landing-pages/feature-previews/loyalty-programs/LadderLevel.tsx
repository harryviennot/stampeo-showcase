import type { ReactNode } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { ArrowRightIcon, CheckIcon, StarIcon } from "@/components/icons";
import { ScaledBox } from "@/components/ui/ScaledBox";
import type { LadderLevel as LevelCopy, LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import type { LadderCard } from "@/lib/landing-pages/previews/loyalty-ladder";
import { CARD_SHADOW, CELL_TITLE } from "../../platform/classes";
import { PassFrame } from "../../shared/PassFrame";
import { APP } from "../mobile-scanner/appColors";

/** The card as drawn, and the width it shrinks to beside its words on a phone. */
const CARD = { width: 240, height: 308, narrow: 128 };

/** A row of the level's list: a small grey label, then its value; without a label the value takes the whole row. */
function Row({ label, children }: Readonly<{ label?: string; children: ReactNode }>) {
  return (
    <div className="grid grid-cols-[3.25rem_1fr] gap-x-3 border-t border-black/5 py-3 first:border-t-0 first:pt-0 last:pb-0">
      {label && <dt className="pt-0.5 text-xs font-semibold tracking-[0.12em] text-[var(--muted-foreground)] uppercase">{label}</dt>}
      <dd className={`min-w-0 text-base text-[var(--foreground)] ${label ? "" : "col-span-2"}`}>{children}</dd>
    </div>
  );
}

/**
 * One level of the ladder: its card (a thumbnail beside its name on a phone, the full card on top from `lg`), how
 * a customer gets there, and its card, perks and gift. `rise` is the step the panel starts at from `lg`.
 */
export function LadderLevel({
  level,
  card,
  labels,
  rise,
  climbs,
  top,
  alt,
}: Readonly<{
  level: LevelCopy;
  card: LadderCard;
  labels: (typeof LOYALTY_PROGRAMS_PREVIEW)["levels"]["labels"];
  /** The panel's top padding from `lg`, which makes the three panels a staircase. */
  rise: string;
  /** Whether the level is reached from another one (it gets the up arrow). */
  climbs: boolean;
  /** Whether it is the last level. */
  top: boolean;
  /** The ladder's description, read out once, on its first card. */
  alt?: string;
}>) {
  return (
    <li className={`flex flex-col ${rise}`}>
      <div
        className={`grid flex-1 grid-cols-[128px_1fr] items-center gap-x-4 gap-y-5 rounded-[28px] bg-white p-4 ring-1 ring-black/5 ${CARD_SHADOW} sm:p-5 lg:flex lg:flex-col lg:items-stretch lg:gap-y-0 lg:p-6`}
      >
        <div
          role={alt ? "img" : undefined}
          aria-label={alt}
          aria-hidden={alt ? undefined : true}
          className="lg:flex lg:justify-center"
        >
          <div aria-hidden>
            <ScaledBox
              width={CARD.width}
              height={CARD.height}
              narrowTo={CARD.narrow}
              className="rounded-[7px] ring-1 ring-black/10 lg:rounded-[13px]"
            >
              <PassFrame width={CARD.width}>
                <WalletCard design={card.design} stamps={card.stamps} headerLabel={level.name} />
              </PassFrame>
            </ScaledBox>
          </div>
        </div>

        <div className="lg:mt-6 lg:mb-5">
          <h3 className={CELL_TITLE}>{level.name}</h3>
          <p className="mt-1 flex items-start gap-1.5 text-base text-[var(--muted-foreground)]">
            {climbs && (
              <ArrowRightIcon size={16} weight="bold" aria-hidden className="mt-1 shrink-0 -rotate-45 text-[var(--accent-hover)]" />
            )}
            <span className="text-pretty">{level.reach}</span>
          </p>
        </div>

        <dl className="col-span-2 border-t border-black/5 pt-4 lg:col-span-1 lg:mt-auto">
          <Row label={labels.card}>{level.card}</Row>
          <Row label={labels.perks}>
            {level.perks.length === 0 ? (
              <span className="text-[var(--muted-foreground)]">{labels.noPerks}</span>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {level.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <StarIcon size={16} weight="fill" aria-hidden className="mt-1 shrink-0" style={{ color: APP.amber }} />
                    <span className="text-pretty">{perk}</span>
                  </li>
                ))}
              </ul>
            )}
          </Row>
          {level.gift && <Row label={labels.gift}>{level.gift}</Row>}
          {top && (
            <Row>
              <span className="flex items-start gap-2 font-semibold">
                <CheckIcon size={18} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-[var(--accent-hover)]" />
                <span className="text-pretty">{labels.top}</span>
              </span>
            </Row>
          )}
        </dl>
      </div>
    </li>
  );
}
