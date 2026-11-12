"use client";

import { useState, type ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Segmented } from "@/components/ui/Segmented";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { HeadStartBars, type HeadStartChoice } from "./HeadStartBars";

/** The card is drawn at 300px and shrunk to 240px below `sm`. */
const CARD = { width: 300, height: 385, narrowTo: 240 };

/**
 * One choice, three things that follow it: the card (empty, or with its two
 * welcome stamps), the lit bar of the study, and the tab. The cards come in
 * already drawn, so both are in the server HTML and the toggle only decides
 * which one shows. On a phone the order is heading, toggle, card, bars; from
 * `lg` the card sits beside the words.
 */
export function HeadStartToggle({
  heading,
  emptyCard,
  headStartCard,
  cta,
  initial = "headStart",
}: Readonly<{
  heading: ReactNode;
  emptyCard: ReactNode;
  headStartCard: ReactNode;
  cta?: ReactNode;
  initial?: HeadStartChoice;
}>) {
  const [selected, setSelected] = useState<HeadStartChoice>(initial);
  const { toggle, title, empty, withHeadStart } = OUTCOMES.headStart;
  const sources = [...new Set([empty.source, withHeadStart.source])];
  const cards = [
    { key: "empty", node: emptyCard },
    { key: "headStart", node: headStartCard },
  ] as const;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-8">
      <ScrollReveal className="lg:col-start-1 lg:row-start-1 lg:self-end">{heading}</ScrollReveal>

      <ScrollReveal delay={100} className="lg:col-start-1 lg:row-start-2">
        <Segmented
          size="lg"
          ariaLabel={title}
          value={selected}
          onChange={setSelected}
          options={[
            { value: "empty", label: toggle.empty },
            { value: "headStart", label: toggle.headStart },
          ]}
          className="max-w-md [&>button]:px-2 [&>button]:text-sm [&>button]:leading-tight"
        />
      </ScrollReveal>

      <ScrollReveal
        delay={150}
        variant="scale"
        className="flex justify-center lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:items-center"
      >
        <div className="grid">
          {cards.map(({ key, node }) => (
            <div
              key={key}
              data-card={key}
              inert={key !== selected}
              className={`col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none ${
                key === selected ? "opacity-100" : "opacity-0"
              }`}
            >
              <ScaledBox width={CARD.width} height={CARD.height} narrowTo={CARD.narrowTo} breakpoint="sm">
                {node}
              </ScaledBox>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100} className="max-w-md lg:col-start-1 lg:row-start-3">
        <HeadStartBars selected={selected} />
        {sources.map((source) => (
          <p key={source} className="mt-5 max-w-md text-pretty text-sm text-[var(--muted-foreground)]">
            {source}
          </p>
        ))}
      </ScrollReveal>

      {cta && (
        <ScrollReveal className="lg:col-start-1 lg:row-start-4 lg:self-start">{cta}</ScrollReveal>
      )}
    </div>
  );
}
