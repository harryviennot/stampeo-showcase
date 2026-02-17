"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import type { CardDesign } from "@/lib/types/design";
import type { StampIconType } from "@/components/onboarding/StampIconPicker";

interface ColorTheme {
  bg: string;
  accent: string;
  icon: string;
  stampIcon: StampIconType;
}

const THEMES: ColorTheme[] = [
  { bg: "#1c1c1e", accent: "#f97316", icon: "#ffffff", stampIcon: "coffee" },
  { bg: "#F5E6D3", accent: "#8B4513", icon: "#ffffff", stampIcon: "heart" },
  { bg: "#1A2332", accent: "#60A5FA", icon: "#ffffff", stampIcon: "star" },
  { bg: "#F8E8F0", accent: "#D4688E", icon: "#ffffff", stampIcon: "flower" },
];

export function CardColorDemo() {
  const t = useTranslations("features.design-de-carte.custom.colorDemo");
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = THEMES[activeIndex];
  const themeTranslations = t.raw("themes") as Array<{ name: string; orgName: string }>;
  const themeT = themeTranslations[activeIndex];

  const design: Partial<CardDesign> = {
    organization_name: themeT.orgName,
    background_color: theme.bg,
    stamp_filled_color: theme.accent,
    icon_color: theme.icon,
    stamp_icon: theme.stampIcon,
    reward_icon: "gift",
    total_stamps: 8,
    secondary_fields: [
      { key: "reward", label: t("rewardLabel"), value: t("rewardValue") },
      { key: "member", label: t("memberLabel"), value: "Sophie M." },
    ],
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Card preview with smooth color transition */}
      <motion.div
        className="w-full max-w-[280px]"
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ScaledCardWrapper baseWidth={280}>
          <WalletCard
            design={design}
            stamps={5}
            showQR={false}
            interactive3D={true}
          />
        </ScaledCardWrapper>
      </motion.div>

      {/* Color swatches */}
      <div className="flex items-center gap-3">
        {THEMES.map((th, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className="group relative flex flex-col items-center gap-2"
            aria-label={themeTranslations[index].name}
          >
            <div className="relative">
              {/* Swatch pair: bg + accent */}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 overflow-hidden"
                style={{
                  background: th.bg,
                  boxShadow:
                    activeIndex === index
                      ? `0 0 0 2px var(--background), 0 0 0 4px ${th.accent}`
                      : "0 2px 8px rgba(0,0,0,0.1)",
                  transform: activeIndex === index ? "scale(1.1)" : "scale(1)",
                }}
              >
                {/* Accent accent stripe */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[30%]"
                  style={{ backgroundColor: th.accent }}
                />
              </div>
            </div>
            <span
              className="text-xs font-medium transition-colors"
              style={{
                color:
                  activeIndex === index
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {themeTranslations[index].name}
            </span>
          </button>
        ))}
      </div>

      {/* Hint text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeIndex}
          className="text-sm text-[var(--muted-foreground)] text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {t("hint")}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
