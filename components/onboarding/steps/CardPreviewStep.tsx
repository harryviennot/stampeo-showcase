"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "@phosphor-icons/react/dist/ssr";
import { OnboardingStore } from "@/hooks/useOnboardingStore";
import { SubstepDots } from "../SubstepDots";
import { AssetUploadSubstep } from "./AssetUploadSubstep";

interface CardPreviewStepProps {
  store: OnboardingStore;
  onNext: () => void;
  onBack: () => void;
}

// Predefined color palette for quick selection
const backgroundColors = [
  { name: "Dark", value: "#1c1c1e" },
  { name: "Navy", value: "#1a237e" },
  { name: "Forest", value: "#1b5e20" },
  { name: "Wine", value: "#4a1c40" },
  { name: "Slate", value: "#37474f" },
  { name: "Cream", value: "#f5f0e8" },
];

const accentColors = [
  { name: "Terracotta", value: "#f97316" },
  { name: "Gold", value: "#d4a853" },
  { name: "Coral", value: "#e57373" },
  { name: "Teal", value: "#26a69a" },
  { name: "Purple", value: "#7e57c2" },
  { name: "Blue", value: "#42a5f5" },
];


// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate relative luminance for WCAG contrast
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Check if color needs dark text for accessibility
function needsDarkText(bgHex: string): boolean {
  const luminance = getLuminance(bgHex);
  return luminance > 0.4;
}

// Adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.min(255, Math.max(0, r + percent));
  const newG = Math.min(255, Math.max(0, g + percent));
  const newB = Math.min(255, Math.max(0, b + percent));
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, "0")}`;
}

// Animation variants for substep transitions
const substepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "tween" as const,
      ease: "easeInOut" as const,
      duration: 0.3,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: {
      type: "tween" as const,
      ease: "easeInOut" as const,
      duration: 0.3,
    },
  }),
};

export function CardPreviewStep({
  store,
  onNext,
  onBack,
}: CardPreviewStepProps) {
  const { data, updateCardDesign } = store;
  const { cardDesign } = data;

  const [substep, setSubstep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(0);

  const goToSubstep = (target: 1 | 2) => {
    setDirection(target > substep ? 1 : -1);
    setSubstep(target);
  };

  // Calculate button styles based on accent color
  const accentColor = cardDesign.accentColor;
  const gradientFrom = adjustBrightness(accentColor, 20);
  const gradientTo = adjustBrightness(accentColor, -20);
  const hoverFrom = adjustBrightness(accentColor, 10);
  const hoverTo = adjustBrightness(accentColor, -30);
  const textColor = needsDarkText(accentColor) ? "#1a1a1a" : "#ffffff";
  const shadowColor = `${accentColor}40`;

  const handleBack = () => {
    if (substep === 1) {
      onBack();
    } else {
      goToSubstep(1);
    }
  };

  const handleContinue = () => {
    if (substep === 1) {
      goToSubstep(2);
    } else {
      onNext();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Customize your card
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          {substep === 1
            ? "Add your logo and choose a stamp icon"
            : "Choose colors that match your brand"}
        </p>
      </div>

      {/* Substep indicator */}
      <SubstepDots current={substep} total={2} />

      {/* Animated substep content */}
      <div className="min-h-[280px] relative">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={substep}
            custom={direction}
            variants={substepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {substep === 1 ? (
              <AssetUploadSubstep store={store} />
            ) : (
              <ColorPickerSubstep
                cardDesign={cardDesign}
                updateCardDesign={updateCardDesign}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info note */}
      <div className="text-center mb-6 mt-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          You can always edit your card design later in the dashboard
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="py-3.5 px-6 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-full hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3.5 px-4 border border-[var(--border)] text-[var(--muted-foreground)] font-medium rounded-full hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all duration-200"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 px-4 font-semibold rounded-full hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 transition-all duration-200"
          style={{
            background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            color: textColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(to right, ${hoverFrom}, ${hoverTo})`;
            e.currentTarget.style.boxShadow = `0 10px 25px -5px ${shadowColor}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {substep === 1 ? "Next" : "Continue"}
        </button>
      </div>
    </div>
  );
}

// Color Picker Substep Component
interface ColorPickerSubstepProps {
  cardDesign: {
    backgroundColor: string;
    accentColor: string;
  };
  updateCardDesign: (updates: Partial<{ backgroundColor: string; accentColor: string }>) => void;
}

function ColorPickerSubstep({ cardDesign, updateCardDesign }: ColorPickerSubstepProps) {
  return (
    <div className="space-y-6">
      {/* Background Color */}
      <fieldset>
        <legend className="block text-sm font-medium text-[var(--foreground)] mb-3">
          Card Background
        </legend>
        <div className="flex flex-wrap gap-2">
          {backgroundColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateCardDesign({ backgroundColor: color.value })}
              className={`
                w-11 h-11 rounded-xl transition-all duration-200
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
                ${cardDesign.backgroundColor === color.value
                  ? "ring-2 ring-[var(--accent)] ring-offset-2 scale-110"
                  : "ring-1 ring-black/10"
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Select ${color.name} background color`}
            />
          ))}
          {/* Custom color input */}
          <div
            className={`
              w-11 h-11 rounded-xl cursor-pointer transition-all duration-200
              hover:scale-110 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2
              flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-400
              ring-1 ring-black/10 relative
            `}
            title="Custom color"
          >
            <input
              type="color"
              value={cardDesign.backgroundColor}
              onChange={(e) => updateCardDesign({ backgroundColor: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              aria-label="Custom background color"
            />
            <Palette className="w-5 h-5 text-white drop-shadow pointer-events-none" weight="bold" />
          </div>
        </div>
      </fieldset>

      {/* Accent Color */}
      <fieldset>
        <legend className="block text-sm font-medium text-[var(--foreground)] mb-3">
          Accent Color
        </legend>
        <div className="flex flex-wrap gap-2">
          {accentColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateCardDesign({ accentColor: color.value })}
              className={`
                w-11 h-11 rounded-xl transition-all duration-200
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
                ${cardDesign.accentColor === color.value
                  ? "ring-2 ring-[var(--accent)] ring-offset-2 scale-110"
                  : "ring-1 ring-black/10"
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Select ${color.name} accent color`}
            />
          ))}
          {/* Custom color input */}
          <div
            className={`
              w-11 h-11 rounded-xl cursor-pointer transition-all duration-200
              hover:scale-110 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2
              flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-400
              ring-1 ring-black/10 relative
            `}
            title="Custom color"
          >
            <input
              type="color"
              value={cardDesign.accentColor}
              onChange={(e) => updateCardDesign({ accentColor: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              aria-label="Custom accent color"
            />
            <Palette className="w-5 h-5 text-white drop-shadow pointer-events-none" weight="bold" />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
