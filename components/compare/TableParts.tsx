import type { Side } from "@/lib/compare/page/rows";

/** The words the table draws around its rows. */
export interface TableLabels {
  /** The label column's heading, read by screen readers only. */
  criterion: string;
  caption: string;
}

export interface Names {
  competitor: string;
  stampeo: string;
}

/** Stampeo's column, tinted like the highlighted plan of the pricing table. */
export const STAMPEO_TINT = "bg-[var(--accent)]/5";

/** Every other row tinted, as the pricing table stripes its rows. */
export const rowTint = (index: number) => (index % 2 === 0 ? "bg-[var(--muted)]/30" : "");

/** A product's short answer, with its note under it when it has one. */
export function ShortValue({ side }: { side: Side }) {
  return (
    <>
      <span className="block text-sm leading-snug font-medium break-words text-[var(--near-black)]">{side.short}</span>
      {side.note && <span className="mt-0.5 block text-xs leading-snug break-words text-[var(--muted-foreground)]">{side.note}</span>}
    </>
  );
}
