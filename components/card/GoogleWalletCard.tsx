"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CardDesign, RewardTier } from "@/lib/types/design";
import type { StampIconType } from "@/components/onboarding/StampIconPicker";
import { PointsStrip } from "@/components/card/PointsStrip";
import { FakeQRCode, StampGrid } from "@/components/card/WalletCard";
import { computeCardColors, getInitials, rgbToHex } from "@/lib/card-utils";

export interface GoogleWalletCardProps {
  /** Card design configuration */
  design: Partial<CardDesign>;
  /** Number of filled stamps (default: 3 for preview) */
  stamps?: number;
  /** Override total stamps from program (instead of design) */
  totalStamps?: number;
  /** Override organization name from design */
  organizationName?: string;
  /** Additional class names */
  className?: string;
  /** Points programs (design.card_type === 'points'): sample balance + ladder. */
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
}

/** Google's recommended hero image, 1032×336. */
const HERO_ASPECT_RATIO = 1032 / 336;

/** The strip image's opacity: image_only shows it raw, the other modes dim it to the stored percentage. */
function stripImageOpacity(design: Partial<CardDesign>): number {
  if (design.stamp_icon_mode === "image_only") return 1;
  return (design.strip_background_opacity ?? 40) / 100;
}

/**
 * A loyalty pass as Google Wallet shows it: one scrolling card, no flip. The
 * round logo and the business's name, the pass title, the stamps or points,
 * the fields in two columns, the QR code, then the stamps hero at the bottom.
 * Ported from web's preview, front only; fields print as given, and its words
 * are text, not headings, since the pass is a picture on the page.
 */
export function GoogleWalletCard({
  design,
  stamps = 3,
  totalStamps: totalStampsProp,
  organizationName,
  className = "",
  pointsBalance,
  pointsRewards,
}: GoogleWalletCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heroWidth, setHeroWidth] = useState(0);
  const t = useTranslations("common");

  const displayName = organizationName || design.organization_name || "Your Business";
  const initials = getInitials(displayName);
  const totalStamps = totalStampsProp ?? design.total_stamps ?? 10;
  const colors = computeCardColors(design);
  const isPoints = design.card_type === "points";
  const pointsAccent = design.progress_accent_color ? rgbToHex(design.progress_accent_color) : colors.accentHex;
  const stripBgHex = design.strip_background_color ? rgbToHex(design.strip_background_color) : colors.bgHex;

  const stampIcon = (design.stamp_icon || "checkmark") as StampIconType;
  const rewardIcon = (design.reward_icon || "gift") as StampIconType;
  const customConfig = design.stamp_icon_mode === "custom" ? design.custom_stamp_config : null;
  const secondaryFields = design.secondary_fields ?? [];
  const auxiliaryFields = design.auxiliary_fields ?? [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateWidth = () => setHeroWidth(container.offsetWidth);
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);
    updateWidth();
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{
        backgroundColor: colors.bgHex,
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header: round logo + business name */}
      <div className="px-4 py-4 flex items-center gap-3">
        {design.logo_url ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {/* The name is printed beside it, so the logo is decorative. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={design.logo_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: colors.accentHex }}
          >
            <span className="text-white font-bold text-base">{initials}</span>
          </div>
        )}
        <p className="font-medium text-base" style={{ color: colors.textColor }}>
          {displayName}
        </p>
      </div>

      {/* Pass title */}
      <div className="px-4 pb-3">
        <p className="text-2xl font-light text-wrap" style={{ color: colors.textColor }}>
          {design.description || "Loyalty Card"}
        </p>
      </div>

      {/* Stamps / points */}
      <div className="px-4 py-2">
        <p className="text-xs uppercase font-medium mb-1" style={{ color: colors.mutedTextColor }}>
          {isPoints ? t("points") : t("stamps")}
        </p>
        <p className="text-sm font-normal" style={{ color: colors.textColor }}>
          {isPoints ? (pointsBalance ?? 0) : `${stamps} / ${totalStamps}`}
        </p>
      </div>

      {/* Secondary fields: two columns */}
      {secondaryFields.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-2 gap-4">
          {secondaryFields.slice(0, 4).map((field, i) => (
            <div key={field.key || i}>
              <p className="text-xs font-medium mb-0.5" style={{ color: colors.mutedTextColor }}>
                {field.label ? field.label.charAt(0).toUpperCase() + field.label.slice(1) : field.label}
              </p>
              <p className="text-sm font-medium" style={{ color: colors.textColor }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Auxiliary fields: two columns */}
      {auxiliaryFields.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-2 gap-4">
          {auxiliaryFields.slice(0, 4).map((field, i) => (
            <div key={field.key || i}>
              <p className="text-xs uppercase tracking-wider font-medium mb-0.5" style={{ color: colors.mutedTextColor }}>
                {field.label}
              </p>
              <p className="text-sm font-medium" style={{ color: colors.textColor }}>
                {field.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* QR code, centred */}
      <div className="px-4 pt-4 pb-2 flex flex-col items-center">
        <div className="bg-white p-3 rounded-xl">
          <FakeQRCode size={100} />
        </div>
      </div>

      {/* Stamps hero at the bottom */}
      <div className="relative pb-1" style={{ backgroundColor: stripBgHex }}>
        {design.strip_background_url && (
          <div className="absolute inset-0 overflow-hidden rounded-b-[28px]">
            <Image
              src={design.strip_background_url}
              alt=""
              fill
              className="object-cover"
              style={{
                opacity: isPoints
                  ? design.points_strip_style === "image_only"
                    ? 1
                    : (design.strip_background_opacity ?? 40) / 100
                  : stripImageOpacity(design),
              }}
              unoptimized
            />
          </div>
        )}

        <div className="relative">
          {isPoints ? (
            <PointsStrip
              style={design.points_strip_style ?? "big_point"}
              balance={pointsBalance ?? 0}
              rewards={pointsRewards ?? []}
              rewardIcons={design.points_reward_icons}
              accentColor={pointsAccent}
              backgroundColor={stripBgHex}
            />
          ) : (
            // The hero's height is held from the first paint; the stamps are laid out once its width is known.
            <div className="relative w-full" style={{ aspectRatio: HERO_ASPECT_RATIO }}>
              {design.stamp_icon_mode !== "image_only" && heroWidth > 0 && (
                <StampGrid
                  totalStamps={totalStamps}
                  filledCount={stamps}
                  colors={colors}
                  stampIcon={stampIcon}
                  rewardIcon={rewardIcon}
                  customConfig={customConfig}
                  containerWidth={heroWidth}
                  containerHeight={heroWidth / HERO_ASPECT_RATIO}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleWalletCard;
