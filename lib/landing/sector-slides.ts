import type { StampIconType } from "@/components/onboarding/StampIconPicker";
import type {
  CardDesign,
  CustomStampConfig,
  PointsRewardIcons,
  PointsStripStyle,
  RewardTier,
} from "../types/design";
import { formatMoney } from "../pricing";

export type SectorTheme = {
  /** Stable brand id, used by tests and as a readable reference in the data. */
  id: string;
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
  /** Per-reward milestone icons on a progress_icons strip; unset = gift. */
  pointsRewardIcons?: PointsRewardIcons;
  pointsBalance?: number;
  /** Solid strip canvas behind the strip image (strip_background_color). */
  stripBgColor?: string;
  /** Strip artwork/photo (strip_background_url). */
  stripImageUrl?: string;
  /** 0-100. Defaults to 40 (soft watermark); 100 makes the image the strip. */
  stripImageOpacity?: number;
};

/** One sector's copy, as `landing.sectorCards.sectors[i]` holds it. */
export type SectorCopy = {
  name: string;
  quote: string;
  reward: string;
  advantage: string;
  /** Wallet-card fields: first renders left-aligned, last right-aligned. */
  fields?: Array<{ label: string; value: string }>;
  link: string;
  linkLabel: string;
};

/** `{m<amount>}` in sector copy: that whole amount in the page's currency. */
const MONEY_TOKEN = /\{m(\d+)\}/g;

/** Fills a sector's money tokens in `currency` as `locale` writes it, so /us
 *  quotes "$10 off" where /en quotes "€10 off". */
export function fillSectorMoney(
  sector: SectorCopy,
  currency: string,
  locale: string
): SectorCopy {
  const fill = (text: string) =>
    text.replace(MONEY_TOKEN, (_, amount: string) =>
      formatMoney(Number(amount), currency, locale)
    );
  return {
    ...sector,
    name: fill(sector.name),
    quote: fill(sector.quote),
    reward: fill(sector.reward),
    advantage: fill(sector.advantage),
    linkLabel: fill(sector.linkLabel),
    ...(sector.fields && {
      fields: sector.fields.map((f) => ({ label: fill(f.label), value: fill(f.value) })),
    }),
  };
}

/** Pairs catalog sectors with their themes by catalog index, then lays them
 *  out in display order. A slot whose sector or theme is missing is skipped,
 *  so a short catalog drops slides instead of pairing copy with the wrong card. */
export function orderSectorSlides<S>(
  sectors: S[],
  themes: SectorTheme[],
  order: readonly number[]
): Array<S & { theme: SectorTheme }> {
  return order.flatMap((index) => {
    const sector = sectors[index];
    const theme = themes[index];
    return sector && theme ? [{ ...sector, theme }] : [];
  });
}

/** The WalletCard design for a sector slide. Fields render first-left,
 *  last-right, like Apple Wallet. */
export function sectorWalletDesign(
  theme: SectorTheme,
  fields: Array<{ label: string; value: string }>
): Partial<CardDesign> {
  const secondaryFields = fields.map((f, i) => ({
    key: `f${i}`,
    label: f.label,
    value: f.value,
  }));

  if (theme.engine === "points") {
    return {
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
      ...(theme.pointsRewardIcons ? { points_reward_icons: theme.pointsRewardIcons } : {}),
    };
  }

  return {
    background_color: theme.walletBg,
    foreground_color: theme.walletText,
    label_color: theme.walletLabel,
    stamp_filled_color: theme.walletAccent,
    icon_color: theme.walletIcon,
    stamp_icon: theme.walletStampIcon,
    reward_icon: theme.walletRewardIcon,
    stamp_icon_mode: theme.customStampConfig ? "custom" : "preset",
    custom_stamp_config: theme.customStampConfig,
    total_stamps: theme.walletStamps,
    organization_name: theme.walletOrgName,
    logo_url: theme.walletLogoUrl,
    secondary_fields: secondaryFields,
  };
}
