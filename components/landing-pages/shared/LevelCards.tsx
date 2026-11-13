import { getTranslations } from "next-intl/server";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { GOLD_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import { LEVEL_UP_BANNER, SHARED } from "@/lib/landing-pages/copy/shared";
import { PassFrame } from "./PassFrame";
import { lpBanner } from "./banner";
import { WRENFOLD } from "./samples";

/** The cards are drawn at this width, in a stage of this size. */
const CARD_WIDTH = 240;
const STAGE = { width: 384, height: 340 };

/** How wide the stage shows: shrunk to 300px below `sm`, whole from there. */
const DEFAULT_SIZE = { narrowTo: 300, breakpoint: "sm" } as const;

/**
 * The stage on a hover row: shrunk to a third below `lg`; from it, to 0.75 of its drawn width, as tall as a
 * card thumbnail (it overhangs the card column into the row's padding).
 */
export const LEVELS_ON_A_ROW = { narrowTo: 128, to: 288, breakpoint: "lg" } as const;

interface Level {
  name: string;
  /** Its look over the shop's own: Bronze is the sample as it is. */
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
 * The dry cleaner's card as Bronze (its own look), Silver and Gold, fanned,
 * each with its level name over the count as on the real pass. `banner` adds
 * the default level-up notification over the front card; `size` shows the
 * stage smaller (`narrowTo` below the breakpoint, `to` from it).
 */
export async function LevelCards({
  banner = false,
  size = DEFAULT_SIZE,
}: Readonly<{
  banner?: boolean;
  size?: { narrowTo: number; to?: number; breakpoint: "sm" | "lg" };
}>) {
  const t = await getTranslations("features.design-de-carte.custom.playground");
  const fields = [{ key: "member", label: t("memberLabel"), value: t("memberName") }];

  return (
    <div
      role="img"
      aria-label={SHARED.levelCardsAlt}
      className="relative"
      style={{ paddingBottom: banner ? 40 : 0 }}
    >
      <ScaledBox width={STAGE.width} height={STAGE.height} {...size}>
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
                design={{ ...WRENFOLD.design, ...level.look, secondary_fields: fields }}
                stamps={level.stamps}
                headerLabel={level.name}
                showQR={false}
              />
            </PassFrame>
          </div>
        ))}
      </ScaledBox>
      {banner && (
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[300px]">
          <NotificationBanner {...lpBanner(LEVEL_UP_BANNER)} />
        </div>
      )}
    </div>
  );
}
