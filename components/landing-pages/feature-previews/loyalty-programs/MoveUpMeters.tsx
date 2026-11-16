import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { LEVEL_LOOKS, SILVER_LOOK } from "@/lib/levels/looks";
import type { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";

type MoveUpCopy = (typeof LOYALTY_PROGRAMS_PREVIEW)["moveUp"];

/** The card colour of a level by its name, if it is one of the looks. */
function levelColor(name: string): string | undefined {
  const key = name.toLowerCase();

  return key in LEVEL_LOOKS ? LEVEL_LOOKS[key as keyof typeof LEVEL_LOOKS].background_color : undefined;
}

/** A small swatch in a level's card colour and its name. */
function LevelMark({ name }: Readonly<{ name: string }>) {
  return (
    <span className="inline-flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
      <span aria-hidden className="h-5 w-5 rounded-md ring-1 ring-black/10" style={{ backgroundColor: levelColor(name) }} />
      {name}
    </span>
  );
}

/** The level a customer is on, an arrow, and the one they are moving to. */
function LevelsMoved({ from, to }: Readonly<{ from: string; to: string }>) {
  return (
    <div className="flex items-center gap-3">
      <LevelMark name={from} />
      <ArrowRightIcon size={16} weight="bold" aria-hidden className="text-[var(--muted-foreground)]" />
      <LevelMark name={to} />
    </div>
  );
}

/** The inset the meter sits in: described once by `alt`, with the words under the picture. */
function Meter({ alt, children }: Readonly<{ alt: string; children: ReactNode }>) {
  return (
    <div role="img" aria-label={alt} className="rounded-2xl bg-[var(--background-subtle)] p-5">
      <div aria-hidden>{children}</div>
    </div>
  );
}

/** Progress as words: the count in bold, then what is left. */
function Progress({ progress, caption }: Readonly<{ progress: string; caption: string }>) {
  return (
    <p className="mt-4">
      <span className="block text-base font-semibold text-[var(--foreground)]">{progress}</span>
      <span className="mt-0.5 block text-base text-[var(--muted-foreground)]">{caption}</span>
    </p>
  );
}

/** A small card: Silver and all stamped when `full`, an empty outline when not. */
function MiniCard({ full }: Readonly<{ full: boolean }>) {
  return (
    <div
      className={`grid h-[72px] w-14 grid-cols-2 content-center justify-items-center gap-2 rounded-xl px-3 ${
        full ? "" : "border-2 border-dashed border-[var(--border)] bg-white/60"
      }`}
      style={full ? { backgroundColor: SILVER_LOOK.background_color } : undefined}
    >
      {[0, 1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: full ? SILVER_LOOK.stamp_filled_color : "var(--border)" }}
        />
      ))}
    </div>
  );
}

/** Cards toward the next level: one small card for each one needed, the filled ones first. */
export function MoveStampsMeter({ copy }: Readonly<{ copy: MoveUpCopy["stamps"] }>) {
  return (
    <Meter alt={copy.alt}>
      <LevelsMoved from={copy.level} to={copy.next} />
      <div className="mt-4 flex gap-3">
        {Array.from({ length: copy.needed }, (_, index) => (
          <MiniCard key={index} full={index < copy.filled} />
        ))}
      </div>
      <Progress progress={copy.progress} caption={copy.caption} />
    </Meter>
  );
}

/** Points earned toward the next level: a bar filled to what they have of what is needed. */
export function MovePointsMeter({ copy }: Readonly<{ copy: MoveUpCopy["points"] }>) {
  const share = Math.round((copy.earned / copy.needed) * 100);

  return (
    <Meter alt={copy.alt}>
      <LevelsMoved from={copy.level} to={copy.next} />
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white ring-1 ring-black/5">
        <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: levelColor(copy.next) }} />
      </div>
      <Progress progress={copy.progress} caption={copy.caption} />
    </Meter>
  );
}
