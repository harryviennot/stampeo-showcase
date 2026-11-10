import type { ReactNode } from "react";
import { CTAButton } from "@/components/ui/CTAButton";
import { COPY } from "@/lib/compare/page/copy";
import type { Market } from "@/lib/compare/types";
import { SideCard, type Side } from "./SideCard";

/** One of the two "Choose X if" cards, under its own heading. Stampeo's ends with the sign-up button. */
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
  const copy = COPY[market];
  const id = `choose-${side}`;

  return (
    <SideCard as="section" side={side} tone="ink" aria-labelledby={id} data-choose-if={side}>
      <h2 id={id} className="text-h3 text-[var(--near-black)]">
        {title ?? (side === "competitor" ? copy.chooseIf.competitor(competitor) : copy.chooseIf.stampeo)}
      </h2>
      <div className="mt-3 text-base leading-relaxed text-[var(--near-black)]/80 [&_li]:my-1.5 [&_li]:pl-1 [&_li::marker]:text-[var(--accent)] [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      {side === "stampeo" && (
        <div className="mt-auto pt-6">
          <CTAButton label={copy.cta.button} size="md" trackAs="comparison_cta" className="w-full" />
        </div>
      )}
    </SideCard>
  );
}

/** The two cards side by side from the desktop up and stacked on a phone. */
export function ChooseIfPair({ children }: { children: ReactNode }) {
  return (
    <div data-choose-if-pair className="not-prose my-8 grid gap-4 lg:grid-cols-2 lg:gap-6">
      {children}
    </div>
  );
}
