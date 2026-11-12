import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Sparkle, User } from "@phosphor-icons/react";
import { StampIconSvg } from "@/components/onboarding/StampIconPicker";
import { PLAYGROUND_CUSTOM_ICONS } from "@/lib/custom-stamp-presets";
import {
  MAX_BALANCE,
  MAX_REWARDS,
  PLAYGROUND_ICONS,
  STRIP_STYLES,
  THEMES,
  type Playground,
} from "./usePlayground";

export function ControlLabel({ children }: { children: ReactNode }) {
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

/** Program type: the same card runs stamps or points. */
export function ProgramControl({ p: { t, tc, program, setProgram } }: { p: Playground }) {
  return (
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
  );
}

/** Icon source: preset library or your own icons. */
export function IconModeControl({ p: { t, iconMode, setIconMode } }: { p: Playground }) {
  return (
    <Segmented
      options={[
        { value: "preset", label: t("modePreset") },
        { value: "custom", label: t("modeCustom") },
      ]}
      value={iconMode}
      onChange={setIconMode}
    />
  );
}

/** The colour themes as swatches; `touch` makes them 44px to tap. */
export function ThemeControl({
  p: { t, themes, themeIndex, setThemeIndex },
  touch = false,
}: {
  p: Playground;
  touch?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <ControlLabel>{t("themeLabel")}</ControlLabel>
      <div className={touch ? "flex items-center gap-3 py-1" : "flex items-center gap-3"}>
        {THEMES.map((th, index) => (
          <button
            key={index}
            onClick={() => setThemeIndex(index)}
            className={
              touch
                ? "relative w-11 h-11 rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105"
                : "relative w-10 h-10 rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105"
            }
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
  );
}

/** Points: strip style and a draggable balance. */
export function PointsControl({
  p: { t, stripStyleLabels, stripStyle, setStripStyle, balance, setBalance },
}: {
  p: Playground;
}) {
  return (
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
  );
}

/** Stamp icon, preset library; `touch` lays the twelve icons in two even rows with 44px targets. */
export function PresetIconControl({
  p: { t, theme, iconId, setIconId },
  touch = false,
}: {
  p: Playground;
  touch?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <ControlLabel>{t("iconLabel")}</ControlLabel>
      <div
        className={
          touch
            ? "grid grid-cols-6 gap-2"
            : "grid grid-cols-[repeat(auto-fill,minmax(38px,1fr))] gap-2"
        }
      >
        {PLAYGROUND_ICONS.map((id) => {
          const active = iconId === id;
          return (
            <button
              key={id}
              onClick={() => setIconId(id)}
              className={
                touch
                  ? "relative w-[38px] h-[38px] flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 mx-auto after:absolute after:-inset-[3px] after:content-['']"
                  : "w-[38px] h-[38px] flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 mx-auto"
              }
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
  );
}

/** Stamp icon, your own: pick one of our demo PNGs, no upload. */
export function CustomIconControl({
  p: { t, theme, arrangements, customIcon, setCustomIcon, arrangement, setArrangement },
}: {
  p: Playground;
}) {
  return (
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
  );
}

/** Stamps: drag to fill the card (mirrors the points balance slider). */
export function StampsControl({ p: { tc, shownStamps, totalStamps, setStamps } }: { p: Playground }) {
  return (
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
  );
}

/** Personalization: the first name on the card, banked rewards, and "Surprise me". */
export function PersonalizationControl({
  p: { t, isPoints, showName, setShowName, rewards, setRewards, surprise },
}: {
  p: Playground;
}) {
  return (
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
  );
}
