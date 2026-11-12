import { getTranslations } from "next-intl/server";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { WalletCard } from "@/components/card/WalletCard";
import { GOLD_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import { LEVEL_UP_BANNER, SHARED } from "@/lib/landing-pages/copy/shared";
import { PassFrame } from "./AurevoCard";
import { lpBanner } from "./banner";
import { BARBER } from "./samples";

/** The cards are drawn at this width, in a stage of this size; on a phone the stage is shrunk to 300px by a fixed CSS scale. */
const CARD_WIDTH = 240;
const STAGE = { width: 384, height: 340 };

interface Level {
  name: string;
  /** Its look over the barbershop's own: Bronze is the sample as it is. */
  look?: LevelLook;
  stamps: number;
  /** Where the card sits in the fan, and how it is turned. */
  left: number;
  top: number;
  rotate: number;
}

/** Bronze in front, Silver and Gold peeking out behind it to the right, so each level's name shows. */
const LEVELS: Level[] = [
  { name: "Bronze", stamps: 6, left: 0, top: 26, rotate: -5 },
  { name: "Silver", look: SILVER_LOOK, stamps: 4, left: 72, top: 12, rotate: 0 },
  { name: "Gold", look: GOLD_LOOK, stamps: 2, left: 144, top: 0, rotate: 5 },
];

/**
 * The barbershop's card as Bronze (its own look), Silver and Gold, fanned,
 * each with its level name over the count as on the real pass. `banner` adds
 * the default level-up notification over the front card.
 */
export async function LevelCards({ banner = false }: Readonly<{ banner?: boolean }>) {
  const t = await getTranslations("features.design-de-carte.custom.playground");
  const fields = [{ key: "member", label: t("memberLabel"), value: t("memberName") }];

  return (
    <div
      role="img"
      aria-label={SHARED.levelCardsAlt}
      className="relative"
      style={{ paddingBottom: banner ? 40 : 0 }}
    >
      <div className="relative h-[266px] w-[300px] sm:h-[340px] sm:w-[384px]">
        <div className="origin-top-left scale-[0.78125] sm:scale-100" style={{ width: STAGE.width, height: STAGE.height }}>
          {LEVELS.map((level, index) => (
            <div
              key={level.name}
              aria-hidden
              className="absolute"
              style={{
                left: level.left,
                top: level.top,
                zIndex: LEVELS.length - index,
                transform: `rotate(${level.rotate}deg)`,
              }}
            >
              <PassFrame width={CARD_WIDTH}>
                <WalletCard
                  design={{ ...BARBER.design, ...level.look, secondary_fields: fields }}
                  stamps={level.stamps}
                  headerLabel={level.name}
                  showQR={false}
                />
              </PassFrame>
            </div>
          ))}
        </div>
      </div>
      {banner && (
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[300px]">
          <NotificationBanner {...lpBanner(LEVEL_UP_BANNER)} />
        </div>
      )}
    </div>
  );
}
