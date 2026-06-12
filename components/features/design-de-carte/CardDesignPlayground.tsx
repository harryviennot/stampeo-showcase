"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Minus, Plus, User } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import {
  StampIconSvg,
  type StampIconType,
} from "@/components/onboarding/StampIconPicker";
import type { CardDesign } from "@/lib/types/design";

interface ColorTheme {
  bg: string;
  accent: string;
  icon: string;
}

/** Colour-only themes. Names + business names come from i18n so they stay
 *  localized; the playground swaps all three card colours at once. */
const THEMES: ColorTheme[] = [
  { bg: "#1c1c1e", accent: "#f97316", icon: "#ffffff" },
  { bg: "#F5E6D3", accent: "#8B4513", icon: "#ffffff" },
  { bg: "#1A2332", accent: "#60A5FA", icon: "#ffffff" },
  { bg: "#F8E8F0", accent: "#D4688E", icon: "#ffffff" },
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

export function CardDesignPlayground() {
  const t = useTranslations("features.design-de-carte.custom.playground");
  const themes = t.raw("themes") as Array<{ name: string; orgName: string }>;

  const [themeIndex, setThemeIndex] = useState(0);
  const [iconId, setIconId] = useState<StampIconType>("coffee");
  const [showName, setShowName] = useState(true);
  const [rewards, setRewards] = useState(1);

  const theme = THEMES[themeIndex];
  const themeT = themes[themeIndex];

  const secondaryFields: Array<{ key: string; label: string; value: string }> = [];
  if (showName) {
    secondaryFields.push({
      key: "member",
      label: t("memberLabel"),
      value: t("memberName"),
    });
  }
  // When rewards are banked, the counter takes over the reward slot so the
  // card never shows "Récompense" and "Récompenses" side by side.
  if (rewards > 0) {
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

  const design: Partial<CardDesign> = {
    organization_name: themeT.orgName,
    background_color: theme.bg,
    stamp_filled_color: theme.accent,
    icon_color: theme.icon,
    stamp_icon: iconId,
    reward_icon: "gift",
    total_stamps: 8,
    secondary_fields: secondaryFields,
  };

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("sectionSubtitle")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Live card preview */}
          <ScrollReveal variant="right" className="flex justify-center">
            <motion.div
              className="w-full max-w-[300px]"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ScaledCardWrapper baseWidth={300}>
                <WalletCard
                  design={design}
                  stamps={5}
                  showQR={false}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </motion.div>
          </ScrollReveal>

          {/* Controls */}
          <ScrollReveal variant="left">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 space-y-5 shadow-sm">
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

              {/* Stamp icon */}
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
