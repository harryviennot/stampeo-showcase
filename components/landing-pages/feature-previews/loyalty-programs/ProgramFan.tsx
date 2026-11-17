import type { ReactNode } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { resolveFanCard } from "@/lib/hero-fan";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { goldHeroCard } from "@/lib/landing-pages/previews/loyalty-ladder";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { PassFrame } from "../../shared/PassFrame";
import { EYEBROW } from "../../shared/LpSection";
import { MARGINALIA } from "../../shared/samples";
import { levelShopBanner } from "./LevelShopIcon";

/** The stage the three cards are drawn on, and the width it shrinks to on a phone. */
const STAGE = { width: 520, height: 372, narrowTo: 340 } as const;
/** Each card's width, left edge and top, and how it is turned: the two behind lean out, the one in front stands. */
const CARDS = {
  stamps: { width: 216, left: 18, top: 44, rotate: -8 },
  points: { width: 216, left: 286, top: 44, rotate: 8 },
  front: { width: 250, left: 135, top: 0, rotate: 0 },
} as const;
/** The notification over the front card's lower part. */
const BANNER = { left: 95, top: 258, width: 330 } as const;

const juice = resolveFanCard("pulp");

/**
 * The hero picture: a juice bar's stamp card and a bookstore's points card behind, the barbershop's card at Gold
 * in front with its level-up notification over it, and the program of each named under it. Still; read out as
 * `hero.alt`.
 */
export function ProgramFan() {
  const copy = useLandingCopy();
  const { alt, banner, labels } = copy.previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW.hero;
  const gold = goldHeroCard(copy.previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW.levels.member);

  return (
    <ScrollReveal className="flex w-full flex-col items-center">
      <div role="img" aria-label={alt} className="w-[340px] lg:w-[520px]">
        <div aria-hidden>
          <ScaledBox width={STAGE.width} height={STAGE.height} narrowTo={STAGE.narrowTo}>
            <div className="relative" style={{ width: STAGE.width, height: STAGE.height }}>
              <FanPosition spot={CARDS.stamps} z={1}>
                <PassFrame width={CARDS.stamps.width}>
                  {juice.kind === "stamps" && <WalletCard design={juice.sample.design} stamps={juice.sample.stamps} />}
                </PassFrame>
              </FanPosition>
              <FanPosition spot={CARDS.points} z={1}>
                <PassFrame width={CARDS.points.width}>
                  <WalletCard
                    design={MARGINALIA.design}
                    pointsBalance={MARGINALIA.pointsBalance}
                    pointsRewards={MARGINALIA.pointsRewards}
                  />
                </PassFrame>
              </FanPosition>
              <FanPosition spot={CARDS.front} z={2}>
                <PassFrame width={CARDS.front.width}>
                  <WalletCard
                    design={gold.design}
                    stamps={gold.stamps}
                    headerLabel={copy.shared.SHARED.levelNames.gold}
                    showQR={false}
                  />
                </PassFrame>
              </FanPosition>
              <div className="absolute z-[3]" style={BANNER}>
                <LockScreenNotification {...levelShopBanner(banner)} timeAgo={copy.shared.SHARED.now} />
              </div>
            </div>
          </ScaledBox>

          <ul className={`mt-3 grid grid-cols-3 px-[11%] text-center text-[var(--muted-foreground)] ${EYEBROW}`}>
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      </div>
    </ScrollReveal>
  );
}

/** A card placed at its spot on the stage, turned about its centre. */
function FanPosition({
  spot,
  z,
  children,
}: Readonly<{ spot: { width: number; left: number; top: number; rotate: number }; z: number; children: ReactNode }>) {
  return (
    <div
      className="absolute"
      style={{ left: spot.left, top: spot.top, zIndex: z, transform: `rotate(${spot.rotate}deg)` }}
    >
      {children}
    </div>
  );
}
