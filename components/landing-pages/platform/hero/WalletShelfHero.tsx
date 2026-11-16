import { WalletCard } from "@/components/card/WalletCard";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { PROGRAM_TYPES } from "@/lib/landing-pages/copy/program-types";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { SHELF_CARDS, SHELF_ON_PHONE } from "@/lib/landing-pages/platform/wallet-shelf";
import { showing } from "@/lib/landing-pages/platform/wallet-stack";
import { HeroWords } from "./HeroWords";
import { LpCtaPair } from "../LpCtaPair";

/** A card is laid out 300px wide and 1.282 tall, and drawn at 168px from `lg` (128px below it). */
const LAYOUT = { width: 300, height: 384.6 };
const SIZE = { wide: 168, narrow: 128 };
/** Each card overlaps the one before by 28% of its width: the wide stride is 121px, the narrow one 92px. */
const OVERLAP = { wide: 47, narrow: 36 };
/** The stride between cards from `lg` (`SIZE.wide - OVERLAP.wide`), written into the class below. */
const STRIDE = SIZE.wide - OVERLAP.wide;
/** The levels stand 14px higher than the one before, like a podium. */
const PODIUM_PX = 14;
const FIRST_LEVEL = 6;

/** Where each kept card sits on a phone, written out so Tailwind sees the classes: the others are hidden. */
const PHONE_ORDER = ["max-lg:order-1", "max-lg:order-2", "max-lg:order-3", "max-lg:order-4", "max-lg:order-5"] as const;

/** The cards deal in from the right with a small overshoot, 50ms apart; a reader who asks for less motion gets none. */
const KEYFRAMES = `
@keyframes wsh-deal { 0% { opacity: 0; transform: translateX(120px); } 70% { opacity: 1; transform: translateX(-6px); } 100% { transform: translateX(0); } }
.wsh-deal { animation: wsh-deal 620ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@media (prefers-reduced-motion: reduce) { .wsh-deal { animation: none; } }
`;

/** The cards' lean: each tipped as a hand of cards held flat. */
const TILT = "perspective(900px) rotateY(-16deg) rotateX(4deg)";

/** The centre of each group of three cards along the row, in px, for the labels beneath. */
const groupCentre = (group: number) => group * 3 * STRIDE + (2 * STRIDE + SIZE.wide) / 2;

/**
 * Platform's hero with the shelf: nine wallet cards in a straight, overlapping row (stamps, points, then one shop at
 * Bronze, Silver and Gold); a phone keeps five of them.
 */
export function WalletShelfHero() {
  return (
    <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-12">
      <style href="wallet-shelf" precedence="default">
        {KEYFRAMES}
      </style>
      <Container>
        <HeroWords slug="platform" look="fan" />
      </Container>

      <div role="img" aria-label={PLATFORM.heroCards.shelfAlt} className="mt-10 select-none lg:mt-12">
        <div
          aria-hidden
          className="flex justify-center pt-8 pl-[36px] lg:relative lg:mx-auto lg:block lg:h-[264px] lg:w-[1136px] lg:pt-0 lg:pl-0"
        >
          {SHELF_CARDS.map((card, index) => {
            const shown = showing(card, false);
            const phoneSlot = SHELF_ON_PHONE.indexOf(index as (typeof SHELF_ON_PHONE)[number]);
            const lift = Math.max(index - FIRST_LEVEL, 0) * PODIUM_PX;

            return (
              <div
                key={card.id + index}
                className={`relative shrink-0 -ml-[36px] lg:absolute lg:top-8 lg:ml-0 lg:left-[calc(var(--i)*121px)] ${
                  phoneSlot === -1 ? "max-lg:hidden" : PHONE_ORDER[phoneSlot]
                }`}
                style={{ "--i": index, zIndex: index + 1 } as React.CSSProperties}
              >
                <div className="wsh-deal" style={{ animationDelay: `${index * 50}ms` }}>
                  <div style={{ transform: `translateY(${-lift}px) ${TILT}` }}>
                    <ScaledBox width={LAYOUT.width} height={LAYOUT.height} to={SIZE.wide} narrowTo={SIZE.narrow} breakpoint="lg">
                      <WalletCard
                        design={shown.design}
                        stamps={shown.stamps}
                        pointsBalance={shown.pointsBalance}
                        pointsRewards={shown.pointsRewards}
                        headerLabel={shown.headerLabel}
                        showQR={false}
                      />
                    </ScaledBox>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div aria-hidden className="relative mx-auto hidden h-6 w-[1136px] lg:block">
          {PROGRAM_TYPES.map((type, group) => (
            <span
              key={type.key}
              className="absolute top-0 -translate-x-1/2 text-xs font-semibold text-[var(--muted-foreground)]"
              style={{ left: groupCentre(group) }}
            >
              {type.label}
            </span>
          ))}
        </div>
      </div>

      <Container className="relative z-10 mt-8 lg:mt-6">
        <div className="flex flex-col items-center gap-3">
          <LpCtaPair location="hero" />
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            <RegionText raw={SHARED.reassurance} />
          </p>
        </div>
      </Container>
    </section>
  );
}
