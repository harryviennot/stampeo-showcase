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

// Hand-mirrored from web/src/components/card/PointsStrip.tsx (which mirrors the
// backend points_strip_generator.py 1125x432 canvas). Keep the two in sync —
// same draw radii, same marker spacing, same label offsets.
const BASE_W = 1125;
const cq = (px: number) => `${(px * 100) / BASE_W}cqw`;

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as [number, number, number];
}

/** Blend a toward b by t (0..1) — matches `_blend` in the backend generator. */
function mix(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  const c = A.map((x, i) => Math.round(x + (B[i] - x) * t));
  return `#${c.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/** Non-overlapping x-positions for reward markers along the track. Markers
 *  start at their proportional position (threshold / top) then get pushed apart
 *  so consecutive centers are at least `gap` apart, where
 *  `gap = max(discGap, halfWidth[i-1] + halfWidth[i] + labelPad)` — so neither
 *  discs nor numeric labels collide. Overflow past the right edge is pulled left
 *  (clamped to x0). MUST mirror space_reward_positions in the backend generator. */
function spaceRewardPositions(
  thresholds: number[],
  x0: number,
  x1: number,
  top: number,
  halfWidths: number[],
  discGap: number,
  labelPad = 10,
): number[] {
  const n = thresholds.length;
  if (n === 0) return [];
  const t = top || 1;
  const pos = thresholds.map((th) => x0 + (x1 - x0) * (Math.min(th, t) / t));
  const gap = (i: number) => Math.max(discGap, halfWidths[i - 1] + halfWidths[i] + labelPad);
  for (let i = 1; i < n; i++) {
    if (pos[i] - pos[i - 1] < gap(i)) pos[i] = pos[i - 1] + gap(i);
  }
  if (pos[n - 1] > x1) {
    pos[n - 1] = x1;
    for (let i = n - 2; i >= 0; i--) {
      if (pos[i + 1] - pos[i] < gap(i + 1)) pos[i] = pos[i + 1] - gap(i + 1);
    }
    if (pos[0] < x0) pos[0] = x0;
  }
  return pos;
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

  // Shared left block (big_point + circle_progress): OBJECTIVE / next pts /
  // NEXT → after pts, or the stacked CARD COMPLETED state.
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
    // Shrink the number as it gets longer so it stays inside the right half,
    // approximating the backend's fit-to-width behaviour.
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
    // Ring fraction = balance / next objective (backend: value / next_threshold).
    const target = nextReward?.threshold ?? top ?? 1;
    const frac = isComplete && !nextReward ? 1 : Math.max(0, Math.min(1, balance / (target || 1)));
    const r = 150; // layout radius — sizes the box footprint
    const stroke = 26;
    // Draw the ring on a smaller radius so the stroke stays fully inside the
    // 300x300 viewBox. Drawing at r=150 with a 26px stroke pushes the outer
    // edge to 163 and the top/bottom of the ring get clipped by the viewBox
    // (preview-only artefact — the backend strip already insets it).
    const drawR = r - stroke / 2; // 137
    const cx = BASE_W - 80 - r; // 895 on the base canvas
    const circ = 2 * Math.PI * drawR;
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
            <circle cx="150" cy="150" r={drawR} fill="none" stroke={muted} strokeWidth={stroke} />
            {frac > 0 && (
              <circle
                cx="150"
                cy="150"
                r={drawR}
                fill="none"
                stroke={accentColor}
                strokeWidth={stroke}
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

  if (style === "image_only") {
    // The uploaded strip image IS the strip — the WalletCard renders it behind
    // this component at full opacity, so there's nothing to draw on top.
    return <Canvas />;
  }

  // progress_icons — balance top-left, horizontal milestone track. Markers start
  // at their proportional position (threshold / top) then get spaced apart so
  // close thresholds (and their labels) don't overlap. x0 matches the balance
  // text inset (80) so the track lines up with it.
  const x0 = 80;
  const x1 = BASE_W - 80;
  const trackY = 255;
  const iconR = 46;
  const span = x1 - x0;
  const fillPct = ((x0 + span * (Math.min(balance, top || 1) / (top || 1))) / BASE_W) * 100;

  const thresholds = sorted.map((r) => r.threshold);
  // Approximate label width from digit count (no text metrics in cqw); the
  // generated wallet strip measures exactly. Label font is 44 base units.
  const halfWidths = thresholds.map((th) => (String(th).length * 44 * 0.55) / 2);
  const positions = spaceRewardPositions(
    thresholds, x0, x1, top || 1, halfWidths, 2 * iconR + 12, 10,
  );

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
          {/* base track (muted) */}
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
          {/* filled track (accent) up to balance */}
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
          {sorted.map((reward, i) => {
            const reached = balance >= reward.threshold;
            const choice = rewardIcons?.[reward.id];
            const iconName = (choice?.type === "preset" ? choice.ref : "gift") as StampIconType;
            return (
              <div
                key={reward.id}
                style={{
                  position: "absolute",
                  left: `${(positions[i] / BASE_W) * 100}cqw`,
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
                  <div
                    style={{
                      width: cq(iconR * 1.1),
                      height: cq(iconR * 1.1),
                      display: "flex",
                    }}
                  >
                    <StampIconSvg
                      icon={iconName}
                      className="w-full h-full"
                      color={reached ? backgroundColor : muted}
                    />
                  </div>
                </div>
                <span
                  style={{
                    // Sit fully below the icon disc (height = 2*iconR) with a
                    // small gap. iconR+20 placed the label inside the disc's
                    // lower third, colliding with the glyph.
                    position: "absolute",
                    top: cq(2 * iconR + 14),
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

/** Strip canvas: a container-query box at the 1125:432 strip aspect so all
 *  child `cqw` units resolve against the rendered width. Transparent so the
 *  WalletCard's strip background color / image shows through. */
function Canvas({ children }: { children?: React.ReactNode }) {
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
