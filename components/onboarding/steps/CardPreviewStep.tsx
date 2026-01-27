"use client";

import { OnboardingStore } from "@/hooks/useOnboardingStore";

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

// Check if color needs dark text for accessibility (WCAG AA requires 4.5:1 for normal text)
function needsDarkText(bgHex: string): boolean {
  const luminance = getLuminance(bgHex);
  // If background is bright (luminance > 0.4), use dark text
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

export function CardPreviewStep({
  store,
  onNext,
  onBack,
}: CardPreviewStepProps) {
  const { data, updateCardDesign } = store;
  const { cardDesign } = data;

  // Calculate button styles based on accent color
  const accentColor = cardDesign.accentColor;
  const gradientFrom = adjustBrightness(accentColor, 20);
  const gradientTo = adjustBrightness(accentColor, -20);
  const hoverFrom = adjustBrightness(accentColor, 10);
  const hoverTo = adjustBrightness(accentColor, -30);
  const textColor = needsDarkText(accentColor) ? "#1a1a1a" : "#ffffff";
  const shadowColor = `${accentColor}40`; // 25% opacity

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Customize your card
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Choose colors that match your brand, or skip for now
        </p>
      </div>

      {/* Color Pickers */}
      <div className="space-y-6 mb-8">
        {/* Background Color */}
        <fieldset>
          <legend className="block text-sm font-medium text-[var(--foreground)] mb-3">
            Card Background
          </legend>
          <div className="flex flex-wrap gap-3">
            {backgroundColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => updateCardDesign({ backgroundColor: color.value })}
                className={`
                  w-12 h-12 rounded-xl transition-all duration-200
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
                w-12 h-12 rounded-xl cursor-pointer transition-all duration-200
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
              <svg className="w-5 h-5 text-white drop-shadow pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
        </fieldset>

        {/* Accent Color */}
        <fieldset>
          <legend className="block text-sm font-medium text-[var(--foreground)] mb-3">
            Accent Color
          </legend>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => updateCardDesign({ accentColor: color.value })}
                className={`
                  w-12 h-12 rounded-xl transition-all duration-200
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
                w-12 h-12 rounded-xl cursor-pointer transition-all duration-200
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
              <svg className="w-5 h-5 text-white drop-shadow pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Info note */}
      <div className="text-center mb-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          You can always edit your card design later in the dashboard
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
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
          onClick={onNext}
          className="flex-1 py-3.5 px-4 font-semibold rounded-full hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 transition-all duration-200"
          style={{
            background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            color: textColor,
            // Using CSS custom property for hover - handled via onMouseEnter/Leave or we rely on the transition
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
          Continue
        </button>
      </div>
    </div>
  );
}
