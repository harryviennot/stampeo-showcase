"use client";

import { useTranslations } from "next-intl";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { POINTS_SAMPLES, type PointsSample } from "@/lib/loyalty-samples";

/**
 * v2.0.0 hero — the seven fictional-brand points cards fanned on a warm
 * backdrop. Together they cover all four points strip styles (big_point,
 * image_only, progress_icons, circle_progress).
 */

interface Slot {
  sampleId: string;
  width: number;
  left: number;
  top: number;
  rotate: number;
  z: number;
  /** Back-row cards are slightly faded and unshadowed. */
  backRow?: boolean;
}

// Center-heavy fan: hero card up front, mid cards flanking, small cards
// cropped by the stage edges for depth.
const SLOTS: Slot[] = [
  { sampleId: "restaurant", width: 225, left: 55, top: 85, rotate: -12, z: 20, backRow: true },
  { sampleId: "pace", width: 225, left: 1005, top: 100, rotate: 11, z: 20, backRow: true },
  { sampleId: "ode", width: 195, left: 120, top: 415, rotate: -14, z: 15, backRow: true },
  { sampleId: "ravin", width: 195, left: 1015, top: 425, rotate: 13, z: 15, backRow: true },
  { sampleId: "forme", width: 265, left: 245, top: 215, rotate: -7, z: 30 },
  { sampleId: "salon", width: 265, left: 785, top: 220, rotate: 6, z: 30 },
  { sampleId: "marginalia", width: 310, left: 490, top: 155, rotate: -2, z: 40 },
];

function sampleById(id: string): { sample: PointsSample; index: number } {
  const index = POINTS_SAMPLES.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Unknown points sample "${id}"`);
  return { sample: POINTS_SAMPLES[index], index };
}

export function PointsLaunchScene() {
  // Same per-brand secondary/auxiliary field sets the card-design gallery
  // shows, zipped to POINTS_SAMPLES by index.
  const t = useTranslations("features.design-de-carte.gallery");
  type Field = { label: string; value: string };
  const cardFields = t.raw("cardFields") as {
    points: Array<{ main?: Field[]; aux?: Field[] }>;
  };
  const tc = useTranslations("common");
  const ghostWord = tc("points").toUpperCase(); // POINTS / PUNTOS

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[var(--cream)] to-[#f0efe9]">
      {/* Radial brand glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(249,115,22,0.15) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 85% 90%, rgba(228,198,122,0.28) 0%, transparent 55%)",
        }}
      />

      {/* Ghost typography peeking out of the bottom band, behind the cards */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 text-center font-extrabold tracking-tight text-[var(--foreground)] opacity-[0.06]"
        style={{ fontSize: 235, lineHeight: 1, bottom: -35 }}
      >
        {ghostWord}
      </div>

      {/* Card fan */}
      {SLOTS.map((slot) => {
        const { sample, index } = sampleById(slot.sampleId);
        const fields = cardFields.points[index];
        const design = {
          ...sample.design,
          secondary_fields: (fields?.main ?? []).map((f, k) => ({
            key: `m${k}`,
            ...f,
          })),
          auxiliary_fields: (fields?.aux ?? []).map((f, k) => ({
            key: `a${k}`,
            ...f,
          })),
        };
        return (
          <div
            key={slot.sampleId}
            className={slot.backRow ? "absolute opacity-90" : "absolute"}
            style={{
              width: slot.width,
              left: slot.left,
              top: slot.top,
              zIndex: slot.z,
              transform: `rotate(${slot.rotate}deg)`,
              filter: slot.backRow
                ? "drop-shadow(0 12px 24px rgba(0,0,0,0.12))"
                : "drop-shadow(0 24px 48px rgba(0,0,0,0.18))",
            }}
          >
            <ScaledCardWrapper baseWidth={280} targetWidth={slot.width}>
              <WalletCard
                design={design}
                pointsBalance={sample.pointsBalance}
                pointsRewards={sample.pointsRewards}
                showQR={false}
              />
            </ScaledCardWrapper>
          </div>
        );
      })}

      {/* Grain on top of everything. Inline SVG (not a CSS data-URI
          background): html-to-image mangles url(#id) references inside
          data-URI backgrounds, but serializes real DOM SVG correctly. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] mix-blend-multiply"
        style={{ zIndex: 50 }}
      >
        <filter id="clg-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#clg-noise)" />
      </svg>
    </div>
  );
}
