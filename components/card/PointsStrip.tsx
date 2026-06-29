"use client";

import { useTranslations } from "next-intl";
import {
  StampIconSvg,
  type StampIconType,
} from "@/components/onboarding/StampIconPicker";
import type { PointsRewardIcons, PointsStripStyle, RewardTier } from "@/lib/types/design";

interface PointsStripProps {
  style: PointsStripStyle;
  balance: number;
  rewards: RewardTier[];
  rewardIcons?: PointsRewardIcons;
  accentColor: string;
  backgroundColor: string;
  maxLimit?: number | null;
}

// Mirrors the backend points_strip_generator.py 1125x432 canvas using
// container-query width units so the preview matches the generated strip.
const BASE_W = 1125;
const cq = (px: number) => `${(px * 100) / BASE_W}cqw`;

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as [number, number, number];
}

function mix(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  const c = A.map((x, i) => Math.round(x + (B[i] - x) * t));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function PointsStrip({
  style,
  balance,
  rewards,
  rewardIcons,
  accentColor,
  backgroundColor,
  maxLimit,
}: PointsStripProps) {
  const t = useTranslations("common.pointsStrip");
  const muted = mix(accentColor, backgroundColor, 0.5);

  const sorted = [...rewards].sort((a, b) => a.threshold - b.threshold);
  const top = sorted[sorted.length - 1]?.threshold ?? 0;
  const nextReward = sorted.find((r) => r.threshold > balance) ?? null;
  const afterReward = nextReward
    ? sorted.find((r) => r.threshold > nextReward.threshold) ?? null
    : null;
  const isComplete = sorted.length > 0 && balance >= top;

  const unit = (n: number) => t("points", { points: n });

  const leftBlock = (
    <div
      style={{
        position: "absolute",
        left: cq(90),
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: cq(14),
        textAlign: "left",
        lineHeight: 1,
      }}
    >
      {isComplete && !nextReward ? (
        <>
          {t("complete")
            .split(" ")
            .map((word, i) => (
              <span
                key={i}
                style={{
                  color: accentColor,
                  fontWeight: 700,
                  fontSize: cq(46),
                  textTransform: "uppercase",
                  letterSpacing: "0.01em",
                }}
              >
                {word}
              </span>
            ))}
          {maxLimit != null && (
            <span style={{ color: accentColor, fontWeight: 800, fontSize: cq(58) }}>
              {unit(maxLimit)}
            </span>
          )}
        </>
      ) : (
        <>
          <span
            style={{
              color: accentColor,
              fontWeight: 700,
              fontSize: cq(40),
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {t("objective")}
          </span>
          <span style={{ color: accentColor, fontWeight: 800, fontSize: cq(86) }}>
            {nextReward ? unit(nextReward.threshold) : "—"}
          </span>
          {afterReward && (
            <span
              style={{
                color: muted,
                fontWeight: 700,
                fontSize: cq(42),
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {t("nextWord")} → {unit(afterReward.threshold)}
            </span>
          )}
        </>
      )}
    </div>
  );

  if (style === "big_point") {
    const digits = String(balance).length;
    const bigSize = digits <= 3 ? 200 : digits === 4 ? 168 : digits === 5 ? 132 : 108;
    return (
      <Canvas>
        {leftBlock}
        <span
          style={{
            position: "absolute",
            right: cq(80),
            top: "50%",
            transform: "translateY(-50%)",
            color: accentColor,
            fontWeight: 800,
            fontSize: cq(bigSize),
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {balance}
        </span>
      </Canvas>
    );
  }

  if (style === "circle_progress") {
    const target = nextReward?.threshold ?? top ?? 1;
    const frac = isComplete && !nextReward ? 1 : Math.max(0, Math.min(1, balance / (target || 1)));
    const r = 150;
    const cx = BASE_W - 80 - r;
    const circ = 2 * Math.PI * r;
    return (
      <Canvas>
        {leftBlock}
        <div
          style={{
            position: "absolute",
            left: `${(cx / BASE_W) * 100}cqw`,
            top: "50%",
            width: cq(2 * r),
            height: cq(2 * r),
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <circle cx="150" cy="150" r={r} fill="none" stroke={muted} strokeWidth={26} />
            {frac > 0 && (
              <circle
                cx="150"
                cy="150"
                r={r}
                fill="none"
                stroke={accentColor}
                strokeWidth={26}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - frac)}
                transform="rotate(-90 150 150)"
              />
            )}
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
              fontWeight: 800,
              fontSize: cq(90),
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {balance}
          </span>
        </div>
      </Canvas>
    );
  }

  // progress_icons
  const x0 = 110;
  const x1 = BASE_W - 110;
  const trackY = 255;
  const iconR = 46;
  const span = x1 - x0;
  const posPct = (threshold: number) =>
    ((x0 + span * (Math.min(threshold, top || 1) / (top || 1))) / BASE_W) * 100;
  const fillPct = ((x0 + span * (Math.min(balance, top || 1) / (top || 1))) / BASE_W) * 100;

  return (
    <Canvas>
      <span
        style={{
          position: "absolute",
          left: cq(80),
          top: cq(70),
          color: accentColor,
          fontWeight: 800,
          fontSize: cq(58),
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {unit(balance)}
      </span>

      {sorted.length > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              left: `${(x0 / BASE_W) * 100}cqw`,
              right: `${(x0 / BASE_W) * 100}cqw`,
              top: cq(trackY),
              height: cq(10),
              transform: "translateY(-50%)",
              background: muted,
            }}
          />
          {fillPct > (x0 / BASE_W) * 100 && (
            <div
              style={{
                position: "absolute",
                left: `${(x0 / BASE_W) * 100}cqw`,
                width: `${fillPct - (x0 / BASE_W) * 100}cqw`,
                top: cq(trackY),
                height: cq(10),
                transform: "translateY(-50%)",
                background: accentColor,
              }}
            />
          )}
          {sorted.map((reward) => {
            const reached = balance >= reward.threshold;
            const choice = rewardIcons?.[reward.id];
            const iconName = (choice?.type === "preset" ? choice.ref : "gift") as StampIconType;
            return (
              <div
                key={reward.id}
                style={{
                  position: "absolute",
                  left: `${posPct(reward.threshold)}cqw`,
                  top: cq(trackY),
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  style={{
                    width: cq(2 * iconR),
                    height: cq(2 * iconR),
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: reached ? accentColor : backgroundColor,
                    border: reached ? "none" : `${cq(6)} solid ${muted}`,
                  }}
                >
                  <div style={{ width: cq(iconR * 1.1), height: cq(iconR * 1.1), display: "flex" }}>
                    <StampIconSvg
                      icon={iconName}
                      className="w-full h-full"
                      color={reached ? backgroundColor : muted}
                    />
                  </div>
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: cq(iconR + 20),
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: reached ? accentColor : muted,
                    fontWeight: 700,
                    fontSize: cq(44),
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {reward.threshold}
                </span>
              </div>
            );
          })}
        </>
      )}
    </Canvas>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        containerType: "inline-size",
        position: "relative",
        width: "100%",
        aspectRatio: `${BASE_W} / 432`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
