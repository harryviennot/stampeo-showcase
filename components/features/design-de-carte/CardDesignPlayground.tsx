"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Minus, Plus, Sparkle, User } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import {
  StampIconSvg,
  type StampIconType,
} from "@/components/onboarding/StampIconPicker";
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
const THEMES: ColorTheme[] = [
  { bg: "#1c1c1e", accent: "#f97316", icon: "#ffffff", logoUrl: "/themes/forme/logo.svg" },
  { bg: "#F5E6D3", accent: "#8B4513", icon: "#ffffff", logoUrl: "/themes/pulp/logo.svg" },
  { bg: "#1A2332", accent: "#60A5FA", icon: "#ffffff", logoUrl: "/themes/lustre/logo.svg" },
  { bg: "#F8E8F0", accent: "#D4688E", icon: "#ffffff", logoUrl: "/themes/salon/logo.png" },
];

/** Trade-representative subset surfaced in the playground. The full catalog
 *  lives in the dedicated icon-library section below. */
const PLAYGROUND_ICONS: StampIconType[] = [
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

const MAX_REWARDS = 3;

// Points reward ladder for the playground preview (thresholds only; names are
// never rendered by the strip). The balance slider tops out at the last tier
// so visitors can drag all the way to "complete".
const PLAYGROUND_POINTS_REWARDS: RewardTier[] = [
  { id: "r1", name: "a", threshold: 80 },
  { id: "r2", name: "b", threshold: 150 },
  { id: "r3", name: "c", threshold: 300 },
];
const MAX_BALANCE =
  PLAYGROUND_POINTS_REWARDS[PLAYGROUND_POINTS_REWARDS.length - 1].threshold;

const STRIP_STYLES: PointsStripStyle[] = [
  "big_point",
  "circle_progress",
  "progress_icons",
];

export function CardDesignPlayground() {
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
  const [rewards, setRewards] = useState(1);
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

  return (
    <section id="playground" className="py-16 sm:py-24 scroll-mt-24">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-h2 text-[var(--foreground)] mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-lead text-[var(--muted-foreground)] leading-relaxed">
            {t("sectionSubtitle")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Live card preview */}
          <ScrollReveal variant="right" className="flex justify-center">
            <motion.div
              className="w-full max-w-[300px]"
              layout
              animate={complete ? { scale: [1, 1.045, 1] } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ScaledCardWrapper baseWidth={300}>
                <WalletCard
                  design={design}
                  stamps={isPoints ? undefined : shownStamps}
                  pointsBalance={isPoints ? balance : undefined}
                  pointsRewards={isPoints ? PLAYGROUND_POINTS_REWARDS : undefined}
                  showQR={false}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </motion.div>
          </ScrollReveal>

          {/* Controls */}
          <ScrollReveal variant="left">
            <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 space-y-4 shadow-sm">
              {/* Program type: the same card runs stamps or points */}
              <div className="space-y-2.5">
                <ControlLabel>{t("programLabel")}</ControlLabel>
                <Segmented
                  options={[
                    { value: "stamps", label: tc("stamps") },
                    { value: "points", label: tc("points") },
                  ]}
                  value={program}
                  onChange={setProgram}
                />
              </div>

              {/* Icon source: preset library or your own icons */}
              {!isPoints && (
                <Segmented
                  options={[
                    { value: "preset", label: t("modePreset") },
                    { value: "custom", label: t("modeCustom") },
                  ]}
                  value={iconMode}
                  onChange={setIconMode}
                />
              )}

              {/* Theme */}
              <div className="space-y-2.5">
                <ControlLabel>{t("themeLabel")}</ControlLabel>
                <div className="flex items-center gap-3">
                  {THEMES.map((th, index) => (
                    <button
                      key={index}
                      onClick={() => setThemeIndex(index)}
                      className="relative w-10 h-10 rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105"
                      style={{
                        background: th.bg,
                        boxShadow:
                          themeIndex === index
                            ? `0 0 0 2px var(--background), 0 0 0 4px ${th.accent}`
                            : "0 1px 4px rgba(0,0,0,0.12)",
                        transform: themeIndex === index ? "scale(1.08)" : "scale(1)",
                      }}
                      aria-label={themes[index].name}
                      aria-pressed={themeIndex === index}
                    >
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[32%]"
                        style={{ backgroundColor: th.accent }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Points: strip style + draggable balance */}
              {isPoints && (
                <>
                  <div className="space-y-2.5">
                    <ControlLabel>{t("stripLabel")}</ControlLabel>
                    <Segmented
                      options={STRIP_STYLES.map((style) => ({
                        value: style,
                        label: stripStyleLabels[style] ?? style,
                      }))}
                      value={stripStyle}
                      onChange={setStripStyle}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <ControlLabel>{t("balanceLabel")}</ControlLabel>
                      <span className="text-sm font-bold tabular-nums text-[var(--foreground)]">
                        {balance}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={MAX_BALANCE}
                      step={5}
                      value={balance}
                      onChange={(e) => setBalance(Number(e.target.value))}
                      aria-label={t("balanceLabel")}
                      className="w-full accent-[var(--accent)] cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Stamp icon — preset library */}
              {!isPoints && iconMode === "preset" && (
                <div className="space-y-2.5">
                  <ControlLabel>{t("iconLabel")}</ControlLabel>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(38px,1fr))] gap-2">
                    {PLAYGROUND_ICONS.map((id) => {
                      const active = iconId === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setIconId(id)}
                          className="w-[38px] h-[38px] flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 mx-auto"
                          style={{
                            backgroundColor: active ? theme.accent : "var(--muted)",
                          }}
                          aria-label={id}
                          aria-pressed={active}
                        >
                          <StampIconSvg
                            icon={id}
                            className="w-[18px] h-[18px]"
                            color={active ? "#ffffff" : "var(--muted-foreground)"}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stamp icon — your own (pick one of our demo PNGs, no upload) */}
              {!isPoints && iconMode === "custom" && (
                <>
                  <div className="space-y-2.5">
                    <ControlLabel>{t("customIconLabel")}</ControlLabel>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-2">
                      {PLAYGROUND_CUSTOM_ICONS.map((icon) => {
                        const active = customIcon.id === icon.id;
                        return (
                          <button
                            key={icon.id}
                            onClick={() => setCustomIcon(icon)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--muted)] transition-transform duration-200 hover:scale-105 mx-auto"
                            style={{
                              boxShadow: active
                                ? `0 0 0 2px white, 0 0 0 4px ${theme.accent}`
                                : "inset 0 0 0 1px var(--border)",
                            }}
                            aria-label={icon.id}
                            aria-pressed={active}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`${icon.base}.${icon.ext}`}
                              alt=""
                              className="w-7 h-7 object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <ControlLabel>{t("arrangementLabel")}</ControlLabel>
                    <Segmented
                      options={[
                        { value: "straight", label: arrangements.straight },
                        { value: "staggered", label: arrangements.staggered },
                        { value: "overlap", label: arrangements.overlap },
                      ]}
                      value={arrangement}
                      onChange={setArrangement}
                    />
                  </div>
                </>
              )}

              {/* Stamps: drag to fill the card (mirrors the points balance slider) */}
              {!isPoints && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <ControlLabel>{tc("stamps")}</ControlLabel>
                    <span className="text-sm font-bold tabular-nums text-[var(--foreground)]">
                      {shownStamps}/{totalStamps}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={totalStamps}
                    step={1}
                    value={shownStamps}
                    onChange={(e) => setStamps(Number(e.target.value))}
                    aria-label={tc("stamps")}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>
              )}

              {/* Personalization */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => setShowName((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors"
                  style={
                    showName
                      ? { backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }
                      : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                  }
                  aria-pressed={showName}
                >
                  <User className="w-4 h-4" weight="bold" />
                  {t("nameToggle")}
                </button>

                {!isPoints && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-2.5 py-1.5">
                    <span className="text-sm font-semibold text-[var(--muted-foreground)] pl-1">
                      {t("rewardsToggle")}
                    </span>
                    <Stepper
                      value={rewards}
                      min={0}
                      max={MAX_REWARDS}
                      onChange={setRewards}
                      decLabel={t("rewardsDecrease")}
                      incLabel={t("rewardsIncrease")}
                    />
                  </div>
                )}

                <motion.button
                  type="button"
                  onClick={surprise}
                  whileTap={{ scale: 0.95, rotate: -2 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 px-3.5 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
                >
                  <Sparkle className="w-4 h-4" weight="fill" />
                  {t("shuffle")}
                </motion.button>
              </div>

              <p className="text-sm text-[var(--muted-foreground)] pt-1">
                {t("hint")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="inline-flex w-full rounded-xl bg-[var(--muted)] p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
            style={
              active
                ? {
                    backgroundColor: "white",
                    color: "var(--foreground)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }
                : { color: "var(--muted-foreground)" }
            }
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  decLabel: string;
  incLabel: string;
}

function Stepper({ value, min, max, onChange, decLabel, incLabel }: StepperProps) {
  const btn =
    "w-7 h-7 flex items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-sm transition-opacity disabled:opacity-30 hover:bg-[var(--accent)] hover:text-white";
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={btn}
        aria-label={decLabel}
      >
        <Minus className="w-3.5 h-3.5" weight="bold" />
      </button>
      <span className="w-4 text-center text-sm font-bold text-[var(--foreground)] tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={btn}
        aria-label={incLabel}
      >
        <Plus className="w-3.5 h-3.5" weight="bold" />
      </button>
    </div>
  );
}
