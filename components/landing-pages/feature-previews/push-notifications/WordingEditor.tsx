"use client";

import { useEffect, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { LandingCopy } from "@/lib/landing-pages/copy/bundle";
import { fill } from "@/lib/landing-pages/format";
import {
  TYPING_MS,
  sampleValues,
  parseWording,
  typedSteps,
  wordingSteps,
  wordingView,
  type WordingMode,
  type WordingPart,
} from "@/lib/landing-pages/previews/wording-editor";
import { CARD_SHADOW } from "../../platform/classes";
import { LockScreenSlice } from "./LockScreenSlice";

const LABEL = "text-[13px] font-semibold text-[var(--muted-foreground)]";

/** The editor's white card: a soft shadow and a hairline ring, as the toggle card's. */
const SURFACE = `rounded-[32px] bg-white ${CARD_SHADOW} ring-1 ring-black/5`;

/** The editor's words (the notifications preview's `editor`). */
export type EditorCopy = LandingCopy["previews"]["pushNotifications"]["PUSH_NOTIFICATIONS_PREVIEW"]["editor"];

function Variable({ name }: Readonly<{ name: string }>) {
  return (
    <span className="inline-block rounded-md bg-[var(--muted)] px-1.5 py-0.5 align-baseline text-[13px] leading-none font-medium text-[var(--muted-foreground)]">{`{${name}}`}</span>
  );
}

function Field({ parts, typing, label }: Readonly<{ parts: WordingPart[]; typing: boolean; label: string }>) {
  return (
    <div
      role="textbox"
      aria-readonly="true"
      aria-multiline="true"
      aria-label={label}
      className="mt-2 min-h-[92px] rounded-xl border border-[var(--border)] bg-[var(--blog-bg)]/60 px-4 py-3 text-base leading-7 text-[var(--foreground)]"
    >
      {parts.map((part, index) =>
        part.kind === "text" ? <span key={index}>{part.text}</span> : <Variable key={index} name={part.name} />,
      )}
      {typing && <span aria-hidden className="ml-px inline-block h-[1.15em] w-0.5 translate-y-[3px] animate-pulse bg-[var(--foreground)]" />}
    </div>
  );
}

function Switch({ label, on, onToggle }: Readonly<{ label: string; on: boolean; onToggle: () => void }>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex min-h-14 w-full items-center justify-between gap-4 px-4 text-left text-base font-semibold text-[var(--foreground)]"
    >
      <span>{label}</span>
      <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`}>
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none ${on ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}

/**
 * The dashboard's message editor on a clean white card. Ready-made is the default stamp message; Your words types a
 * message with variables in, and the lock screen beside it follows. Three message switches, each toggled independently.
 * `sender` is the sample shop, `timeAgo` the time on the notification and `alt` what the lock screen is for a screen
 * reader (`{sender}` and `{message}` filled in).
 */
export function WordingEditor({
  copy,
  sender,
  timeAgo,
  alt,
}: Readonly<{ copy: EditorCopy; sender: string; timeAgo: string; alt: string }>) {
  const { toggle, previewLabel, messageLabel, ready, own, switches } = copy;
  // The notification's height is held at its longest wording, so typing never moves what is under it.
  const longest = [ready.text, own.preview].reduce((widest, text) => (text.length > widest.length ? text : widest));
  const ownSteps = wordingSteps(parseWording(own.text));
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<WordingMode>("ready");
  const [steps, setSteps] = useState(0);
  const [on, setOn] = useState<boolean[]>(() => switches.map(() => true));

  useEffect(() => {
    if (mode !== "own" || reducedMotion) return;
    const startedAt = performance.now();
    const timer = setInterval(() => {
      const typed = typedSteps(performance.now() - startedAt, ownSteps);
      setSteps(typed);
      if (typed >= ownSteps) clearInterval(timer);
    }, TYPING_MS);
    return () => clearInterval(timer);
  }, [mode, reducedMotion, ownSteps]);

  const choose = (next: WordingMode) => {
    if (next === mode) return;
    setMode(next);
    setSteps(next === "own" ? typedSteps(0, ownSteps, reducedMotion) : 0);
  };

  const view = wordingView({ mode, steps, ready: ready.text, own: own.text, values: sampleValues(copy.sampleValues) });

  return (
    <div className={`mx-auto max-w-[1040px] p-6 text-left sm:p-10 lg:p-12 ${SURFACE}`}>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
        <div className="lg:col-span-7">
          <p className={LABEL}>{toggle.label}</p>
          <Segmented
            size="lg"
            ariaLabel={toggle.label}
            className="mt-2 sm:max-w-[340px]"
            options={[
              { value: "ready", label: toggle.ready },
              { value: "own", label: toggle.own },
            ]}
            value={mode}
            onChange={choose}
          />
          <p className={`mt-6 ${LABEL}`}>{messageLabel}</p>
          <Field parts={view.parts} typing={view.typing} label={messageLabel} />
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col">
          <p className={LABEL}>{previewLabel}</p>
          <LockScreenSlice
            banner={{ sender, body: view.banner }}
            alt={fill(alt, { sender, message: mode === "own" ? own.preview : ready.text })}
            timeAgo={timeAgo}
            reserve={longest}
            className="mt-2 lg:flex-1"
          />
        </div>

        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] lg:col-span-7">
          {switches.map((label, index) => (
            <li key={label}>
              <Switch
                label={label}
                on={on[index]}
                onToggle={() => setOn((current) => current.map((value, at) => (at === index ? !value : value)))}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
