import { useState } from "react";
import { useTranslations } from "next-intl";
import type { StampIconType } from "@/components/onboarding/StampIconPicker";
import {
  customConfigFor,
  PLAYGROUND_CUSTOM_ICONS,
  type PlaygroundCustomIcon,
} from "@/lib/custom-stamp-presets";
import type {
  CardDesign,
  CustomStampArrangement,
  PointsStripStyle,
  RewardTier,
} from "@/lib/types/design";

interface ColorTheme {
  bg: string;
  accent: string;
  icon: string;
  /** Brand-bank wordmark whose colors read on this theme's background. */
  logoUrl: string;
}

/** Colour themes; names come from i18n so they stay localized. Each theme
 *  carries a brand-bank logo picked for legibility on its background, so the
 *  preview card never looks like a blank template. */
export const THEMES: ColorTheme[] = [
  { bg: "#1c1c1e", accent: "#f97316", icon: "#ffffff", logoUrl: "/themes/forme/logo.svg" },
  { bg: "#F5E6D3", accent: "#8B4513", icon: "#ffffff", logoUrl: "/themes/pulp/logo.svg" },
  { bg: "#1A2332", accent: "#60A5FA", icon: "#ffffff", logoUrl: "/themes/lustre/logo.svg" },
  { bg: "#F8E8F0", accent: "#D4688E", icon: "#ffffff", logoUrl: "/themes/salon/logo.png" },
];

/** Trade-representative subset surfaced in the playground. The full catalog
 *  lives in the dedicated icon-library section below. */
export const PLAYGROUND_ICONS: StampIconType[] = [
  "coffee",
  "bread",
  "tea",
  "food",
  "shopping",
  "flower",
  "scissors",
  "paw",
  "heart",
  "star",
  "crown",
  "gift",
];

export const MAX_REWARDS = 3;

// Points reward ladder for the playground preview (thresholds only; names are
// never rendered by the strip). The balance slider tops out at the last tier
// so visitors can drag all the way to "complete".
export const PLAYGROUND_POINTS_REWARDS: RewardTier[] = [
  { id: "r1", name: "a", threshold: 80 },
  { id: "r2", name: "b", threshold: 150 },
  { id: "r3", name: "c", threshold: 300 },
];
export const MAX_BALANCE =
  PLAYGROUND_POINTS_REWARDS[PLAYGROUND_POINTS_REWARDS.length - 1].threshold;

export const STRIP_STYLES: PointsStripStyle[] = [
  "big_point",
  "circle_progress",
  "progress_icons",
];

/**
 * The playground's state and the card design it draws, shared by the full and
 * the compact playground. `rewards` is how many banked rewards the card starts with.
 */
export function usePlayground({ rewards: initialRewards }: Readonly<{ rewards: number }>) {
  const t = useTranslations("features.design-de-carte.custom.playground");
  const tc = useTranslations("common");
  const themes = t.raw("themes") as Array<{ name: string; orgName: string }>;

  const arrangements = t.raw("arrangements") as Record<
    CustomStampArrangement,
    string
  >;
  const stripStyleLabels = t.raw("stripStyles") as Record<string, string>;

  const [program, setProgram] = useState<"stamps" | "points">("stamps");
  const [iconMode, setIconMode] = useState<"preset" | "custom">("preset");
  const [themeIndex, setThemeIndex] = useState(0);
  const [iconId, setIconId] = useState<StampIconType>("coffee");
  const [customIcon, setCustomIcon] = useState<PlaygroundCustomIcon>(
    PLAYGROUND_CUSTOM_ICONS[0]
  );
  const [arrangement, setArrangement] =
    useState<CustomStampArrangement>("staggered");
  const [showName, setShowName] = useState(true);
  const [rewards, setRewards] = useState(initialRewards);
  const [stripStyle, setStripStyle] = useState<PointsStripStyle>("big_point");
  const [balance, setBalance] = useState(120);
  const [stamps, setStamps] = useState(5);

  const isPoints = program === "points";
  const theme = THEMES[themeIndex];
  const totalStamps = iconMode === "custom" ? 10 : 8;
  const shownStamps = Math.min(stamps, totalStamps);
  // A filled card (or a maxed balance) gives the preview a small spring pulse.
  const complete = isPoints ? balance >= MAX_BALANCE : shownStamps >= totalStamps;

  const pick = <T,>(arr: readonly T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const surprise = () => {
    setThemeIndex(Math.floor(Math.random() * THEMES.length));
    if (isPoints) {
      setStripStyle(pick(STRIP_STYLES));
      setBalance(Math.floor((Math.random() * MAX_BALANCE) / 5) * 5);
    } else if (Math.random() < 0.4) {
      setIconMode("custom");
      setCustomIcon(pick(PLAYGROUND_CUSTOM_ICONS));
      setArrangement(pick(["straight", "staggered", "overlap"] as const));
      setStamps(1 + Math.floor(Math.random() * 10));
    } else {
      setIconMode("preset");
      setIconId(pick(PLAYGROUND_ICONS));
      setStamps(1 + Math.floor(Math.random() * 8));
    }
  };

  const secondaryFields: Array<{ key: string; label: string; value: string }> = [];
  if (showName) {
    secondaryFields.push({
      key: "member",
      label: t("memberLabel"),
      value: t("memberName"),
    });
  }
  if (isPoints) {
    secondaryFields.push({
      key: "reward",
      label: t("rewardLabel"),
      value: t("pointsRewardValue"),
    });
  } else if (rewards > 0) {
    // When rewards are banked, the counter takes over the reward slot so the
    // card never shows "Récompense" and "Récompenses" side by side.
    secondaryFields.push({
      key: "rewards",
      label: t("rewardsLabel"),
      value: t("rewardsValue", { count: rewards }),
    });
  } else {
    secondaryFields.push({
      key: "reward",
      label: t("rewardLabel"),
      value: t("rewardValue"),
    });
  }

  const design: Partial<CardDesign> = isPoints
    ? {
        organization_name: "",
        logo_url: theme.logoUrl,
        card_type: "points",
        points_strip_style: stripStyle,
        background_color: theme.bg,
        progress_accent_color: theme.accent,
        icon_color: theme.icon,
        secondary_fields: secondaryFields,
      }
    : {
        organization_name: "",
        logo_url: theme.logoUrl,
        background_color: theme.bg,
        stamp_filled_color: theme.accent,
        icon_color: theme.icon,
        reward_icon: "gift",
        total_stamps: totalStamps,
        secondary_fields: secondaryFields,
        ...(iconMode === "custom"
          ? {
              stamp_icon_mode: "custom" as const,
              custom_stamp_config: customConfigFor(customIcon, {
                arrangement,
                empty_mode: "greyscale",
                empty_opacity: 60,
              }),
            }
          : { stamp_icon: iconId }),
      };

  return {
    t,
    tc,
    themes,
    arrangements,
    stripStyleLabels,
    program,
    setProgram,
    iconMode,
    setIconMode,
    themeIndex,
    setThemeIndex,
    iconId,
    setIconId,
    customIcon,
    setCustomIcon,
    arrangement,
    setArrangement,
    showName,
    setShowName,
    rewards,
    setRewards,
    stripStyle,
    setStripStyle,
    balance,
    setBalance,
    setStamps,
    isPoints,
    theme,
    totalStamps,
    shownStamps,
    complete,
    surprise,
    design,
  };
}

export type Playground = ReturnType<typeof usePlayground>;
