import type { Side } from "@/lib/compare/page/rows";

/** The words the table's client parts draw, passed as plain text. */
export interface TableLabels {
  /** The label column's heading, read by screen readers only. */
  criterion: string;
  caption: string;
  source: string;
  showAll: string;
  hideAll: string;
}

export interface Names {
  competitor: string;
  stampeo: string;
}

/** Stampeo's column, tinted like the highlighted plan of the pricing table. */
export const STAMPEO_TINT = "bg-[var(--accent)]/5";

/** Every other row tinted, as the pricing table stripes its rows. */
export const rowTint = (index: number) => (index % 2 === 0 ? "bg-[var(--muted)]/30" : "");

/** A product's short answer, with the tax line under it when the row has one. */
export function ShortValue({ side }: { side: Side }) {
  return (
    <>
      <span className="block text-sm leading-snug font-medium break-words text-[var(--near-black)]">{side.short}</span>
      {side.taxLine && <span className="mt-0.5 block text-xs leading-snug break-words text-[var(--muted-foreground)]">{side.taxLine}</span>}
    </>
  );
}

/** The link to the page a competitor's value was read on. */
export function SourceLink({ source, label }: { source: NonNullable<Side["source"]>; label: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener nofollow"
      className="inline-flex min-h-11 items-center gap-1 font-medium text-[var(--accent)] underline-offset-4 hover:underline"
    >
      {label}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> ({source.title})</span>
    </a>
  );
}

/** What a row shows when opened, for one product: the full sentence when it says more than the short answer, and where a competitor's value was read. */
export function SideDetail({ side, sourceLabel }: { side: Side; sourceLabel: string }) {
  return (
    <>
      {side.detail && <span className="block">{side.detail}</span>}
      {side.source && <SourceLink source={side.source} label={sourceLabel} />}
    </>
  );
}
