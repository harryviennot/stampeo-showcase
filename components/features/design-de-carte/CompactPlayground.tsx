"use client";

import {
  PointsControl,
  PresetIconControl,
  ProgramControl,
  StampsControl,
  ThemeControl,
} from "./playground/controls";
import { PlaygroundBody } from "./playground/PlaygroundBody";
import { usePlayground } from "./playground/usePlayground";

/**
 * The card playground as the body of a page's own section: the card and the
 * controls without a section or heading of their own, and without the controls
 * that make the panel tall (first name, rewards, "Surprise me", your own
 * icons), so on a phone the card stays in view while you tap. Its card shows
 * the QR code like a real pass, and its swatches and icons are 44px to tap.
 */
export function CompactPlayground() {
  const p = usePlayground({ rewards: 0 });

  return (
    <PlaygroundBody
      p={p}
      className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      cardClassName="w-full max-w-[240px] lg:max-w-[300px]"
      panelClassName="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm"
      showQR
    >
      <ProgramControl p={p} />
      <ThemeControl p={p} touch />
      {p.isPoints && <PointsControl p={p} />}
      {!p.isPoints && <PresetIconControl p={p} touch />}
      {!p.isPoints && <StampsControl p={p} />}
    </PlaygroundBody>
  );
}
