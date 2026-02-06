"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { CardDesign } from "@/lib/types/design";
import {
  StampIconSvg,
  StampIconType,
} from "@/components/onboarding/StampIconPicker";
import {
  computeCardColors,
  getInitials,
  calculateStampLayout,
} from "@/lib/card-utils";
import { QRCodeSkeleton } from "@/components/ui/QRCodeSkeleton";

// ============================================================================
// Types
// ============================================================================

export interface WalletCardProps {
  /** Card design configuration */
  design: Partial<CardDesign>;
  /** Number of filled stamps (default: 3 for preview) */
  stamps?: number;
  /** Override organization name from design */
  organizationName?: string;
  /** Show QR code at bottom */
  showQR?: boolean;
  /** QR code URL - if provided, renders a real QR code */
  qrUrl?: string | null;
  /** Whether QR is loading */
  isQRLoading?: boolean;
  /** Show secondary fields section */
  showSecondaryFields?: boolean;
  /** Enable 3D mouse-tracking effect */
  interactive3D?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

interface StampCircleProps {
  readonly isFilled: boolean;
  readonly accentColor: string;
  readonly iconColor: string;
  readonly emptyBg: string;
  readonly emptyBorder: string;
  readonly isLast?: boolean;
  readonly stampIcon: StampIconType;
  readonly rewardIcon: StampIconType;
  readonly sizeClass: string;
  readonly iconSizeClass: string;
}

function StampCircle({
  isFilled,
  accentColor,
  iconColor,
  emptyBg,
  emptyBorder,
  isLast = false,
  stampIcon,
  rewardIcon,
  sizeClass,
  iconSizeClass,
}: StampCircleProps) {
  return (
    <div className="flex justify-center">
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center transition-all duration-300`}
        style={{
          backgroundColor: isFilled ? accentColor : emptyBg,
          border: isFilled ? "none" : `1px solid ${emptyBorder}`,
          boxShadow: isFilled ? `0 4px 12px ${accentColor}40` : "none",
        }}
      >
        {isFilled && (
          <StampIconSvg
            icon={isLast ? rewardIcon : stampIcon}
            className={iconSizeClass}
            color={iconColor}
          />
        )}
      </div>
    </div>
  );
}

interface StampGridProps {
  readonly totalStamps: number;
  readonly filledCount: number;
  readonly colors: ReturnType<typeof computeCardColors>;
  readonly stampIcon: StampIconType;
  readonly rewardIcon: StampIconType;
  readonly containerWidth: number;
  readonly containerHeight: number;
}

export function StampGrid({
  totalStamps,
  filledCount,
  colors,
  stampIcon,
  rewardIcon,
  containerWidth,
  containerHeight,
}: StampGridProps) {
  // Calculate layout using the same algorithm as the backend
  const layout = useMemo(() => {
    return calculateStampLayout(
      totalStamps,
      containerWidth,
      containerHeight,
      8,  // minPadding (scaled for ~375px width container)
      11  // sidePadding (32/3 ≈ 11)
    );
  }, [totalStamps, containerWidth, containerHeight]);

  // Calculate icon size (60% of diameter, matching backend)
  const iconSize = Math.max(layout.radius * 1.2, 12);

  return (
    <div
      className="relative w-full"
      style={{ height: containerHeight }}
    >
      {layout.positions.map((pos) => {
        const isFilled = pos.globalIndex < filledCount;
        const isLast = pos.globalIndex === totalStamps - 1;

        return (
          <div
            key={`stamp-${pos.globalIndex}`}
            className="absolute flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: layout.diameter,
              height: layout.diameter,
              left: pos.centerX - pos.radius,
              top: pos.centerY - pos.radius,
              backgroundColor: isFilled ? colors.accentHex : colors.emptyStampBg,
              border: isFilled ? "none" : `1px solid ${colors.emptyStampBorder}`,
              boxShadow: isFilled ? `0 4px 12px ${colors.accentHex}40` : "none",
            }}
          >
            {isFilled && (
              <div style={{ width: iconSize, height: iconSize }}>
                <StampIconSvg
                  icon={isLast ? rewardIcon : stampIcon}
                  className="w-full h-full"
                  color={colors.iconColorHex}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SecondaryFieldsRowProps {
  fields: Array<{ key?: string; label: string; value: string }>;
  colors: ReturnType<typeof computeCardColors>;
}

function SecondaryFieldsRow({ fields, colors }: SecondaryFieldsRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(14); // Start with text-sm equivalent

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const checkOverflow = () => {
      // Reset to max size first
      setFontSize(14);

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (!container) return;
        const containerWidth = container.offsetWidth;
        const contentWidth = container.scrollWidth;

        if (contentWidth > containerWidth) {
          // Calculate scale factor needed
          const scale = containerWidth / contentWidth;
          const newSize = Math.max(10, Math.floor(14 * scale));
          setFontSize(newSize);
        }
      });
    };

    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [fields]);

  const fieldCount = fields.length;

  return (
    <div className="px-2.5 py-1 overflow-hidden">
      <div
        ref={containerRef}
        className="flex items-start"
        style={{ gap: '8px' }}
      >
        {fields.map((field, i) => {
          const isFirst = i === 0;
          const isLast = i === fieldCount - 1;

          return (
            <div
              key={field.key || i}
              className={`${isFirst ? '' : isLast ? 'ml-auto' : ''}`}
              style={{
                textAlign: isFirst ? 'left' : isLast ? 'right' : 'center',
                flexShrink: isFirst || isLast ? 0 : 1,
              }}
            >
              <div
                className="text-[8px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap"
                style={{ color: colors.mutedTextColor }}
              >
                {field.label}
              </div>
              <div
                className="font-medium transition-colors duration-300 whitespace-nowrap"
                style={{
                  color: colors.textColor,
                  fontSize: `${fontSize}px`,
                }}
              >
                {field.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FakeQRCode({ size = 80 }: { size?: number }) {
  const modules = 21;
  const moduleSize = size / modules;

  const isFinderPattern = (row: number, col: number) => {
    if (row < 7 && col < 7) return true;
    if (row < 7 && col >= modules - 7) return true;
    if (row >= modules - 7 && col < 7) return true;
    return false;
  };

  const isFinderInner = (row: number, col: number) => {
    const checkInner = (
      r: number,
      c: number,
      startR: number,
      startC: number
    ) => {
      const relR = r - startR;
      const relC = c - startC;
      if (relR >= 1 && relR <= 5 && relC >= 1 && relC <= 5) {
        if (relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4) {
          return "black";
        }
        return "white";
      }
      return "black";
    };

    if (row < 7 && col < 7) return checkInner(row, col, 0, 0);
    if (row < 7 && col >= modules - 7)
      return checkInner(row, col, 0, modules - 7);
    if (row >= modules - 7 && col < 7)
      return checkInner(row, col, modules - 7, 0);
    return null;
  };

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  const getModuleColor = (row: number, col: number) => {
    if (row === 6 && col >= 8 && col <= modules - 9) {
      return col % 2 === 0 ? "#000" : "#fff";
    }
    if (col === 6 && row >= 8 && row <= modules - 9) {
      return row % 2 === 0 ? "#000" : "#fff";
    }

    if (isFinderPattern(row, col)) {
      const inner = isFinderInner(row, col);
      return inner === "white" ? "#fff" : "#000";
    }

    if (
      (row === 7 && col < 8) ||
      (col === 7 && row < 8) ||
      (row === 7 && col >= modules - 8) ||
      (col === modules - 8 && row < 8) ||
      (row === modules - 8 && col < 8) ||
      (col === 7 && row >= modules - 8)
    ) {
      return "#fff";
    }

    const seed = row * modules + col;
    return seededRandom(seed) > 0.5 ? "#000" : "#fff";
  };

  const rects = [];
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      const color = getModuleColor(row, col);
      if (color === "#000") {
        rects.push(
          <rect
            key={`${row}-${col}`}
            x={col * moduleSize}
            y={row * moduleSize}
            width={moduleSize}
            height={moduleSize}
            fill="#000"
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" />
      {rects}
    </svg>
  );
}

// ============================================================================
// 3D Effect Hook
// ============================================================================

function use3DEffect(enabled: boolean) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 4;
      const rotateX = ((centerY - y) / centerY) * 4;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setRotate({ x: rotateX, y: rotateY });
      setGlare({ x: glareX, y: glareY, opacity: 1 });
    },
    [enabled]
  );

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }, [enabled]);

  return { cardRef, rotate, glare, handleMouseMove, handleMouseLeave };
}

const STRIP_ASPECT_RATIO = 1125 / 432;

function StampGridContainer({
  totalStamps,
  filledCount,
  colors,
  stampIcon,
  rewardIcon,
}: Omit<StampGridProps, "containerWidth" | "containerHeight">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          // Calculate height based on strip aspect ratio
          const height = width / STRIP_ASPECT_RATIO;
          setDimensions({ width, height });
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);
      updateDimensions(); // Initial calculation

      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        // Use aspect-ratio to maintain proportions
        aspectRatio: `${STRIP_ASPECT_RATIO}`,
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <StampGrid
          totalStamps={totalStamps}
          filledCount={filledCount}
          colors={colors}
          stampIcon={stampIcon}
          rewardIcon={rewardIcon}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
        />
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function WalletCard({
  design,
  stamps = 3,
  organizationName,
  showQR = true,
  qrUrl,
  isQRLoading = false,
  showSecondaryFields = true,
  interactive3D = false,
  className = "",
}: WalletCardProps) {
  const { cardRef, rotate, glare, handleMouseMove, handleMouseLeave } =
    use3DEffect(interactive3D);

  const displayName =
    organizationName || design.organization_name || "Your Business";
  const initials = getInitials(displayName);
  const totalStamps = design.total_stamps ?? 10;
  const colors = computeCardColors(design);

  const stampIcon = (design.stamp_icon || "checkmark") as StampIconType;
  const rewardIcon = (design.reward_icon || "gift") as StampIconType;

  const secondaryFields = design.secondary_fields || [];

  const cardStyle = interactive3D
    ? {
      transformStyle: "preserve-3d" as const,
      transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      transition:
        "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease",
      boxShadow: `
          ${-rotate.y * 1.5}px ${rotate.x * 1.5 + 8}px 24px rgba(0,0,0,0.12),
          0 20px 50px rgba(0,0,0,0.08)
        `,
    }
    : {
      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    };

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={interactive3D ? { perspective: "1200px" } : undefined}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full cursor-pointer rounded-2xl"
        style={cardStyle}
        onMouseMove={interactive3D ? handleMouseMove : undefined}
        onMouseLeave={interactive3D ? handleMouseLeave : undefined}
      >
        {/* Card Content Layer */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-300 p-2"
          style={{
            background: `linear-gradient(135deg, ${colors.bgGradientFrom}, ${colors.bgGradientTo})`,
          }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: colors.isLightBg
                ? "linear-gradient(to bottom right, rgba(255,255,255,0.4), transparent, rgba(0,0,0,0.05))"
                : "linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.2))",
            }}
          />

          {/* Content Layout */}
          <div className="relative h-full px-0 py-0 flex flex-col z-10">
            {/* Header: Logo + Business Name */}
            <div className="flex justify-between items-center px-2.5 py-2">
              <div className="flex items-center gap-2">
                {design.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={design.logo_url}
                    alt={displayName}
                    className="h-8 w-auto max-w-[102px] object-contain transition-all duration-300"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 flex-shrink-0"
                    style={{ backgroundColor: colors.accentHex }}
                  >
                    <span className="text-white font-bold text-xs">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3
                    className="font-semibold text-sm tracking-tight leading-tight truncate transition-colors duration-300"
                    style={{ color: colors.mutedTextColor }}
                  >
                    {displayName}
                  </h3>

                </div>
              </div>
              <div className="text-right items-center">
                <div
                  className="text-[8px] font-bold uppercase tracking-wider transition-colors duration-300"
                  style={{ color: colors.mutedTextColor }}
                >
                  stamps
                </div>
                <div
                  className="text-md font-medium flex items-baseline gap-1 justify-end transition-colors duration-300 leading-tight"
                  style={{ color: colors.textColor }}
                >
                  {stamps} / {totalStamps}
                </div>
              </div>
            </div>

            {/* Stamps Grid */}
            <div className="relative flex items-start justify-center py-2">
              {/* Strip background layer */}
              {design.strip_background_url && (
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{ zIndex: 0 }}
                >
                  <Image
                    src={design.strip_background_url}
                    alt=""
                    fill
                    className="object-cover opacity-40"
                    unoptimized
                  />
                </div>
              )}
              <StampGridContainer
                totalStamps={totalStamps}
                filledCount={stamps}
                colors={colors}
                stampIcon={stampIcon}
                rewardIcon={rewardIcon}
              />
            </div>

            {/* Secondary Fields - horizontal row like real Apple Wallet */}
            {showSecondaryFields && secondaryFields.length > 0 && (
              <SecondaryFieldsRow
                fields={secondaryFields.slice(0, 4)}
                colors={colors}
              />
            )}

            {/* QR Code */}
            {showQR && (
              <div
                className="mt-auto pb-2 flex justify-center"
                style={{ borderColor: colors.emptyStampBorder }}
              >
                <div className="bg-white p-2 rounded-lg">
                  {isQRLoading ? (
                    <QRCodeSkeleton size={100} />
                  ) : qrUrl ? (
                    <QRCodeSVG value={qrUrl} size={100} />
                  ) : (
                    <FakeQRCode size={100} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Glare Effect (3D only) */}
        {interactive3D && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-20"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)`,
              opacity: glare.opacity,
              transition: "opacity 0.5s ease",
            }}
          />
        )}

        {/* Border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30"
          style={{
            boxShadow: `inset 0 0 0 1px ${colors.isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
              }`,
          }}
        />
      </div>
    </div>
  );
}

export default WalletCard;
