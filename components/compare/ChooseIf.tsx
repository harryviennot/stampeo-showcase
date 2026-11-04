import type { ReactNode } from "react";
import { COPY } from "@/lib/compare/page/copy";
import type { Market } from "@/lib/compare/types";

type Side = "competitor" | "stampeo";

/** One of the two "Choose X if" cards, under its own heading. The competitor's card comes first at every width. */
export function ChooseIf({
  side,
  competitor,
  market,
  title,
  children,
}: {
  side: Side;
  competitor: string;
  market: Market;
  /** A heading the writer put above the card; otherwise the market's "Choose X if". */
  title?: string;
  children: ReactNode;
}) {
  const copy = COPY[market].chooseIf;
  const id = `choose-${side}`;

  return (
    <section
      aria-labelledby={id}
      data-choose-if={side}
      className={`not-prose blog-card-3d hover:transform-none! hover:shadow-[0_3px_0_var(--near-black)]! rounded-2xl bg-white p-5 sm:p-6 ${
        side === "competitor" ? "order-1" : "order-2"
      }`}
    >
      <h2 id={id} className="text-h3 text-[var(--near-black)]">
        {title ?? (side === "competitor" ? copy.competitor(competitor) : copy.stampeo)}
      </h2>
      <div className="mt-3 text-base leading-relaxed text-[var(--near-black)]/80 [&_li]:my-1.5 [&_li]:pl-1 [&_li::marker]:text-[var(--accent)] [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

/** The two cards side by side from the tablet up and stacked on a phone. */
export function ChooseIfPair({ children }: { children: ReactNode }) {
  return (
    <div data-choose-if-pair className="not-prose my-8 grid gap-4 md:grid-cols-2 md:gap-6">
      {children}
    </div>
  );
}
