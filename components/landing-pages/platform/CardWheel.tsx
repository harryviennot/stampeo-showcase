import type { CSSProperties, ReactNode } from "react";
import { WalletCard } from "@/components/card/WalletCard";
import { WhenIdle } from "@/components/ui/WhenIdle";
import { WHEEL, WHEEL_CARDS, inFirstPaint, wheelAngle, type WheelCard } from "@/lib/landing-pages/card-wheel";
import { PassFrame } from "../shared/PassFrame";
import { WheelWindow } from "./WheelWindow";
import "./card-wheel.css";

/** One sample card, drawn live at the wheel's card width by a fixed scale. */
function Card({ card }: Readonly<{ card: WheelCard }>) {
  return (
    <PassFrame width={WHEEL.cardWidth}>
      <WalletCard
        design={card.design}
        stamps={card.stamps}
        pointsBalance={card.pointsBalance}
        pointsRewards={card.pointsRewards}
      />
    </PassFrame>
  );
}

/** The wheel's geometry as the custom properties card-wheel.css reads. */
const GEOMETRY = {
  "--wheel-radius": `${WHEEL.radius}px`,
  "--wheel-card-w": `${WHEEL.cardWidth}px`,
  "--wheel-card-h": `${WHEEL.cardHeight}px`,
  "--wheel-turn": `${WHEEL.turnSeconds}s`,
} as CSSProperties;

/**
 * The Platform hero's wheel of sample cards: sixteen shops on the rim of a wheel
 * whose hub sits below the hero, turning slowly like a Ferris wheel seen from the
 * front, each card leaning with the rim. `children` (the hero's actions) sit
 * under the top card, with the wheel arching behind them. The cards on the upper
 * half are in the first paint; the rest come once the page is idle. Readers who
 * ask for less motion see it still, Aurevo on top.
 */
export function CardWheel({ className = "", children }: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <div className={`card-wheel-stage relative ${className}`} style={GEOMETRY}>
      <WheelWindow>
        <div className="card-wheel-hub">
          <div className="card-wheel-turn">
            {WHEEL_CARDS.map((card, index) => (
              <div
                key={card.id}
                data-wheel-card={card.id}
                className="card-wheel-arm"
                style={{ "--angle": `${wheelAngle(index)}deg` } as CSSProperties}
              >
                <div className="card-wheel-card">
                  {inFirstPaint(index) ? (
                    <Card card={card} />
                  ) : (
                    <WhenIdle>
                      <Card card={card} />
                    </WhenIdle>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </WheelWindow>
      <div className="card-wheel-clear relative z-10">{children}</div>
    </div>
  );
}
