"use client";

import { Link } from "@/i18n/navigation";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { CenterCarousel } from "../ui/CenterCarousel";
import { ArrowRightIcon, CheckIcon } from "../icons";
import type { StampIconType } from "@/components/onboarding/StampIconPicker";
import type {
  CustomStampConfig,
  PointsStripStyle,
  RewardTier,
} from "@/lib/types/design";

export type SectorTheme = {
  engine: "stamp" | "points";
  // Outer "business-card" frame that holds the wallet card + story.
  cardBg: string;
  cardText: string;
  cardMuted: string;
  /** Reads on cardBg: engine label, checkmark, arrow. Distinct from the
      wallet's own accent so a near-black wallet stamp never leaks onto a
      dark frame. */
  accent: string;
  accentPill: string;
  // Wallet card itself (a real, hand-designed card, not a random palette).
  walletBg: string;
  /** Stamp fill (stamp engine) / points progress accent (points engine). */
  walletAccent: string;
  walletIcon: string;
  /** Value text (foreground_color). Falls back to auto contrast when unset. */
  walletText?: string;
  /** Label text (label_color): org name, field labels, STAMPS/POINTS. */
  walletLabel?: string;
  /** Wordmark logo shown in the card header; carries the brand, so we leave
      the org-name text empty to avoid doubling it up. */
  walletLogoUrl?: string;
  walletOrgName?: string;
  // stamp engine
  walletStamps?: number;
  /** Filled slots to preview. Defaults to ~60% so a fresh card reads as
      "in progress"; set to walletStamps to show the reward slot filled. */
  walletFilled?: number;
  walletStampIcon?: StampIconType;
  /** Icon on the final (reward) slot — e.g. a gift. */
  walletRewardIcon?: StampIconType;
  /** Custom uploaded icons (mutually exclusive with walletStampIcon). */
  customStampConfig?: CustomStampConfig;
  // points engine
  pointsStripStyle?: PointsStripStyle;
  pointsRewards?: RewardTier[];
  pointsBalance?: number;
  /** Solid strip canvas behind the strip image (strip_background_color). */
  stripBgColor?: string;
  /** Strip artwork/photo (strip_background_url). */
  stripImageUrl?: string;
  /** 0-100. Defaults to 40 (soft watermark); 100 makes the image the strip. */
  stripImageOpacity?: number;
};

export type SectorSlide = {
  name: string;
  quote: string;
  reward: string;
  advantage: string;
  link: string;
  linkLabel: string;
  /** Per-sector wallet-card fields (reward, cardholder name, next reward…):
      first renders left-aligned, last right-aligned, like Apple Wallet. */
  fields?: Array<{ label: string; value: string }>;
  theme: SectorTheme;
};

function SlideCard({
  slide,
  engineLabels,
}: {
  slide: SectorSlide;
  engineLabels: { stamp: string; points: string };
}) {
  const { theme } = slide;
  const isPoints = theme.engine === "points";
  const secondaryFields = (slide.fields ?? []).map((f, i) => ({
    key: `f${i}`,
    label: f.label,
    value: f.value,
  }));

  return (
    <Link
      href={slide.link as "/blog/carte-fidelite-cafe"}
      className="group flex h-full flex-col overflow-hidden rounded-3xl md:grid md:grid-cols-2"
      style={{ backgroundColor: theme.cardBg, color: theme.cardText }}
    >
      {/* Card art */}
      <div className="flex items-center justify-center px-6 pt-10 pb-6 md:py-14">
        <div
          className="transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.03]"
          style={{ transform: "rotate(-3deg)" }}
        >
          <div className="w-[240px] md:w-[290px]">
            <ScaledCardWrapper baseWidth={280}>
              <WalletCard
                design={
                  isPoints
                    ? {
                        card_type: "points",
                        points_strip_style: theme.pointsStripStyle,
                        background_color: theme.walletBg,
                        foreground_color: theme.walletText,
                        label_color: theme.walletLabel,
                        progress_accent_color: theme.walletAccent,
                        icon_color: theme.walletIcon,
                        organization_name: theme.walletOrgName,
                        logo_url: theme.walletLogoUrl,
                        strip_background_color: theme.stripBgColor,
                        strip_background_url: theme.stripImageUrl,
                        strip_background_opacity: theme.stripImageOpacity,
                        secondary_fields: secondaryFields,
                      }
                    : {
                        background_color: theme.walletBg,
                        foreground_color: theme.walletText,
                        label_color: theme.walletLabel,
                        stamp_filled_color: theme.walletAccent,
                        icon_color: theme.walletIcon,
                        stamp_icon: theme.walletStampIcon,
                        reward_icon: theme.walletRewardIcon,
                        stamp_icon_mode: theme.customStampConfig
                          ? "custom"
                          : "preset",
                        custom_stamp_config: theme.customStampConfig,
                        total_stamps: theme.walletStamps,
                        organization_name: theme.walletOrgName,
                        logo_url: theme.walletLogoUrl,
                        secondary_fields: secondaryFields,
                      }
                }
                stamps={
                  isPoints
                    ? undefined
                    : theme.walletFilled ??
                      Math.floor((theme.walletStamps ?? 10) * 0.6)
                }
                pointsBalance={isPoints ? theme.pointsBalance : undefined}
                pointsRewards={isPoints ? theme.pointsRewards : undefined}
                showQR={false}
              />
            </ScaledCardWrapper>
          </div>
        </div>
      </div>

      {/* Sector story */}
      <div className="flex flex-1 flex-col gap-3 px-6 pb-8 pt-2 md:gap-4 md:justify-center md:py-12 md:pl-0 md:pr-12">
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: theme.accent }}
        >
          {isPoints ? engineLabels.points : engineLabels.stamp}
        </span>
        <h3 className="text-h3">
          {slide.name}
        </h3>
        <span
          className="inline-flex self-start items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: theme.accentPill, color: theme.cardText }}
        >
          {slide.reward}
        </span>
        <p
          className="text-sm md:text-base leading-relaxed italic"
          style={{ color: theme.cardMuted }}
        >
          « {slide.quote} »
        </p>
        <p
          className="hidden md:flex items-center gap-2 text-sm font-semibold"
          style={{ color: theme.cardMuted }}
        >
          <CheckIcon
            className="w-4 h-4 shrink-0"
            weight="bold"
            style={{ color: theme.accent }}
          />
          {slide.advantage}
        </p>
        <span
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all md:mt-2"
          style={{ color: theme.cardText }}
        >
          {slide.linkLabel}
          <ArrowRightIcon className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Edge-to-edge, infinitely looping sector carousel: the centered slide is in
 * focus, its neighbors peek in from both sides scaled down and darkened, and
 * it auto-advances every 4s (pausing on hover/interaction and off-screen).
 */
export function SectorCarousel({
  slides,
  engineLabels,
  controls,
}: {
  slides: SectorSlide[];
  engineLabels: { stamp: string; points: string };
  controls: { prev: string; next: string };
}) {
  return (
    <CenterCarousel
      items={slides.map((slide) => ({
        key: slide.name,
        label: slide.name,
        node: <SlideCard slide={slide} engineLabels={engineLabels} />,
      }))}
      // Mobile: one full-width card inside page margins (the padded track),
      // no neighbor peek. From md up: edge-to-edge with neighbors peeking in.
      slideClassName="w-full md:w-[76%] lg:w-[920px] xl:w-[1000px]"
      trackClassName="px-5 md:px-0"
      prevLabel={controls.prev}
      nextLabel={controls.next}
      autoPlayMs={6000}
    />
  );
}
