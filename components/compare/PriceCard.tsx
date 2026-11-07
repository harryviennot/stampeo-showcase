import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { withoutClosingPunctuation, withoutTrailingColon } from "@/lib/compare/page/format";
import { SideCard, type Side } from "./SideCard";

type WithChildren = { children?: ReactNode };

/** A list item's words without the ";" or "." that ends them: the MDX writes the prices as one sentence, the card draws one price per line. */
function bareLine(children: ReactNode): ReactNode {
  const parts = Children.toArray(children);
  let end = parts.length - 1;
  while (end >= 0 && typeof parts[end] === "string" && (parts[end] as string).trim() === "") end--;
  const last = parts[end];

  if (typeof last === "string") return [...parts.slice(0, end), withoutClosingPunctuation(last)];
  if (isValidElement<WithChildren>(last) && last.type === "p") {
    return [...parts.slice(0, end), cloneElement(last, undefined, bareLine(last.props.children))];
  }
  return children;
}

/** The card's content with every list line drawn bare; paragraphs keep their punctuation. */
function withBareLines(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<WithChildren>(child)) return child;
    if (child.type === "li") return cloneElement(child, undefined, bareLine(child.props.children));
    if (child.type === "ul" || child.type === "ol") return cloneElement(child, undefined, withBareLines(child.props.children));
    return child;
  });
}

/** One product's prices in a soft card: its name above, one price per line. */
export function PriceCard({ side, name, title, children }: { side: Side; name: string; title?: string; children: ReactNode }) {
  return (
    <SideCard side={side} tone="soft" data-price-card={side}>
      <p className={`text-xs font-semibold ${side === "stampeo" ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"}`}>
        {title ? withoutTrailingColon(title) : name}
      </p>
      <div className="mt-3 text-base leading-relaxed text-[var(--near-black)]/80 [&_li]:py-1 [&_li]:text-lg [&_li]:text-balance [&_li]:leading-snug [&_li]:font-semibold [&_li]:text-[var(--near-black)] [&_p+p]:mt-3 [&_ul]:list-none [&_ul]:p-0">
        {withBareLines(children)}
      </div>
    </SideCard>
  );
}

/** The two price cards side by side from the desktop up and stacked on a phone. */
export function PriceCardPair({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid gap-4 lg:grid-cols-2 lg:gap-6">{children}</div>;
}
