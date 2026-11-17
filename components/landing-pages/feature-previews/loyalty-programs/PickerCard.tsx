"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LandingCopy } from "@/lib/landing-pages/copy/bundle";
import { PICKER_TOTAL, suggestProgram } from "@/lib/landing-pages/previews/loyalty-picker";
import { CARD_SHADOW } from "../../platform/classes";
import { PickerQuestion, type PaneState } from "./PickerQuestion";
import { PickerResult } from "./PickerResult";

/** The picker's words: its questions, the suggestions and the line about levels. */
export type PickerCopy = Omit<LandingCopy["previews"]["loyaltyPrograms"]["LOYALTY_PROGRAMS_PREVIEW"]["picker"], "eyebrow" | "title" | "lead">;

/** How long the chosen option stays highlighted before the next question comes in. */
const FLASH_MS = 250;

const pane = (index: number, step: number): PaneState => (index < step ? "past" : index === step ? "active" : "future");

/**
 * The quiz in one white card: four questions one at a time, then the suggestion. The card keeps its height
 * between questions, the result is announced politely, and focus follows the visitor to the next heading.
 */
export function PickerCard({ copy, cards, cta }: Readonly<{ copy: PickerCopy; cards: Readonly<{ stamps: ReactNode; points: ReactNode }>; cta: string }>) {
  const [choices, setChoices] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const moved = useRef(false);
  const step = choices.length;
  const done = step >= PICKER_TOTAL;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // After the visitor's own move, the next question's heading (or the result's) takes the focus, so Tab goes on from there.
  useEffect(() => {
    if (moved.current) root.current?.querySelector<HTMLElement>("[data-focus]")?.focus({ preventScroll: true });
  }, [step]);

  const choose = (option: number) => {
    if (flash !== null) return;
    moved.current = true;
    setFlash(option);
    timer.current = window.setTimeout(() => {
      setChoices((previous) => [...previous, option]);
      setFlash(null);
    }, FLASH_MS);
  };

  const restart = () => {
    window.clearTimeout(timer.current);
    moved.current = true;
    setFlash(null);
    setChoices([]);
  };

  return (
    <div
      ref={root}
      className={`mx-auto max-w-[720px] rounded-[32px] bg-white p-6 text-left ${CARD_SHADOW} ring-1 ring-black/5 sm:p-10`}
    >
      {!done && (
        <div className="grid">
          {copy.questions.map((item, index) => (
            <PickerQuestion
              key={item.question}
              progress={copy.progress.replace("{current}", String(index + 1)).replace("{total}", String(PICKER_TOTAL))}
              question={item.question}
              options={item.options}
              state={pane(index, step)}
              selected={index === step ? flash : null}
              onChoose={choose}
            />
          ))}
        </div>
      )}
      <div aria-live="polite">
        {done && <PickerResult copy={copy} suggestion={suggestProgram(choices)} cards={cards} cta={cta} onRestart={restart} />}
      </div>
    </div>
  );
}
