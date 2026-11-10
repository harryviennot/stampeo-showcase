import { Children, isValidElement, type ReactNode } from "react";
import { headingId, withoutTrailingPeriod } from "@/lib/compare/page/format";
import { SideCard, sideOrder, type Side } from "./SideCard";

interface Strength {
  /** The bold lead of a paragraph, drawn as the card's title; null for a block with no lead. */
  lead: ReactNode | null;
  body: ReactNode;
}

type Element = { children?: ReactNode };

/** The blocks of a strengths section as cards: a paragraph that opens with bold text is a lead and its words. */
function strengthsOf(children: ReactNode): Strength[] {
  return Children.toArray(children).flatMap((child): Strength[] => {
    if (typeof child === "string" && child.trim() === "") return [];
    if (isValidElement<Element>(child) && child.type === "p") {
      const [first, ...rest] = Children.toArray(child.props.children);
      if (isValidElement<Element>(first) && first.type === "strong") {
        const [start, ...more] = rest;
        const body = typeof start === "string" ? [start.replace(/^\s+/, ""), ...more] : rest;
        return [{ lead: first.props.children, body }];
      }
    }
    return [{ lead: null, body: child }];
  });
}

/** One product's strengths: the section's heading, then a soft card for each bold-lead paragraph. */
export function Strengths({ side, title, children }: { side: Side; title?: string; children: ReactNode }) {
  const id = title ? headingId(title) : undefined;

  return (
    <section data-strengths={side} aria-labelledby={id} className={`not-prose ${sideOrder(side)}`}>
      {title && (
        <h2 id={id} className="text-h2 text-balance text-[var(--near-black)]">
          {title}
        </h2>
      )}
      <div className="mt-6 space-y-4">
        {strengthsOf(children).map(({ lead, body }, index) => (
          <SideCard key={index} side={side} tone="soft">
            {lead !== null && <h3 className="text-h3 text-[var(--near-black)]">{typeof lead === "string" ? withoutTrailingPeriod(lead) : lead}</h3>}
            <div className={`text-base leading-relaxed text-[var(--near-black)]/80 ${lead !== null ? "mt-2" : ""}`}>{body}</div>
          </SideCard>
        ))}
      </div>
    </section>
  );
}

/** The two sections side by side from the desktop up, the competitor's on the left. */
export function StrengthsPair({ children }: { children: ReactNode }) {
  return <div className="not-prose grid gap-12 lg:grid-cols-2 lg:gap-10">{children}</div>;
}
