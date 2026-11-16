import type { CSSProperties } from "react";

/** Each figure leans a little its own way, as the homepage's do, so a row of them never lines up like type. */
const TILTS = [-2, 1.5, -1, 2];

/** One figure: its handwritten value over its label, and the study it comes from when it is a measurement. */
interface Figure {
  value: string;
  label: string;
  source?: string;
}

/**
 * The figures written by hand, in the homepage's ink, each over its label: one column on a phone, a row
 * from `sm`. Four figures run two across from `sm` and four across from `lg`, a little smaller there so the widest
 * still fits its column. A `source` on a figure prints under that figure; the `source` of the row is printed once
 * under all of them, for a row that is someone's measurement.
 */
export function NumberFigures({
  items,
  source,
}: Readonly<{ items: Figure[]; source?: string }>) {
  const four = items.length > 3;
  const figures = (
    <ul
      className={`grid gap-8 text-center ${four ? "sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4" : "sm:grid-cols-3 sm:gap-6"}`}
    >
      {items.map((item, index) => (
        <li
          key={item.label}
          className={`flex flex-col items-center${four ? " [--figure:clamp(3.5rem,2.2rem+4vw,6rem)] lg:[--figure:clamp(3rem,5.6vw,5.5rem)]" : ""}`}
        >
          <p
            className="ink-figure whitespace-nowrap"
            style={
              {
                fontSize: four ? "var(--figure)" : "clamp(3.5rem, 2.2rem + 4vw, 6rem)",
                transform: `rotate(${TILTS[index % TILTS.length]}deg)`,
              } as CSSProperties
            }
          >
            {item.value}
          </p>
          <p className={`mt-2 text-lead text-[var(--muted-foreground)] sm:mt-3${four ? " text-balance" : ""}`}>{item.label}</p>
          {item.source && (
            <p className="mt-3 max-w-[18rem] text-sm text-pretty text-[var(--muted-foreground)]">{item.source}</p>
          )}
        </li>
      ))}
    </ul>
  );

  if (!source) return figures;

  return (
    <>
      {figures}
      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">{source}</p>
    </>
  );
}
