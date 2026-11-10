import { Children, isValidElement, type ReactNode } from "react";
import { withoutTrailingColon } from "@/lib/compare/page/format";
import type { Side } from "./SideCard";

/** A reason written on its own line compiles to one paragraph; inside a row it is drawn as that row's text, not a block. */
function reasonOf(children: ReactNode): ReactNode {
  const blocks = Children.toArray(children).filter((child) => !(typeof child === "string" && child.trim() === ""));
  const only = blocks[0];
  return blocks.length === 1 && isValidElement<{ children?: ReactNode }>(only) && only.type === "p" ? only.props.children : children;
}

/** One type of shop, why it suits one of the two products, and a neutral pill naming that product. */
export function Fit({ side, name, shop, children }: { side: Side; name: string; shop: string; children: ReactNode }) {
  const reason = reasonOf(children);
  const hasReason = Children.toArray(reason).some((part) => !(typeof part === "string" && part.trim() === ""));

  return (
    <li data-fit={side} className="flex flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8">
      <div className="min-w-0">
        <p className="font-semibold text-[var(--near-black)]">{withoutTrailingColon(shop)}</p>
        {hasReason && <p className="mt-1 leading-snug text-[var(--muted-foreground)]">{reason}</p>}
      </div>
      <span
        data-pick
        className="inline-flex h-7 w-fit shrink-0 items-center rounded-full border border-[var(--border)] bg-[var(--background-subtle)] px-3 text-sm"
      >
        {name}
      </span>
    </li>
  );
}

/** The shop types as one list in a white panel. */
export function FitList({ children }: { children: ReactNode }) {
  return <ul className="not-prose my-6 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white">{children}</ul>;
}
