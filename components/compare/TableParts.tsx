import type { ComponentType } from "react";
import { DevicePhoneMobileIcon, Gift, PriceTagIcon, QRCodeIcon } from "@/components/icons";
import { COPY } from "@/lib/compare/page/copy";
import type { Side } from "@/lib/compare/page/rows";
import type { Market, RowGroupId } from "@/lib/compare/types";

const GROUP_ICONS: Record<RowGroupId, ComponentType<{ className?: string; weight?: "regular" | "bold" | "duotone" }>> = {
  customer: DevicePhoneMobileIcon,
  program: Gift,
  counter: QRCodeIcon,
  price: PriceTagIcon,
};

/** The accent-tinted square that marks a theme. */
export function GroupChip({ group }: { group: RowGroupId }) {
  const Icon = GROUP_ICONS[group];

  return (
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
      <Icon className="h-5 w-5" weight="duotone" />
    </span>
  );
}

/** The link to the page a competitor's value was read on. */
export function SourceLink({ source, market }: { source: NonNullable<Side["source"]>; market: Market }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener nofollow"
      className="inline-flex min-h-11 items-center gap-1 font-medium text-[var(--accent)] underline-offset-4 hover:underline"
    >
      {COPY[market].source}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> ({source.title})</span>
    </a>
  );
}

/** What sits under a short answer: the full sentence when it says more, and where a competitor's value was read. */
export function SideDetail({ side, market }: { side: Side; market: Market }) {
  if (!side.detail && !side.source) return null;

  return (
    <>
      {side.detail && <span className="block">{side.detail}</span>}
      {side.source && <SourceLink source={side.source} market={market} />}
    </>
  );
}
