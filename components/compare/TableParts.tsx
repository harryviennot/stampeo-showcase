import type { ComponentType } from "react";
import { DevicePhoneMobileIcon, Gift, PriceTagIcon, QRCodeIcon } from "@/components/icons";
import type { Side } from "@/lib/compare/page/rows";
import type { RowGroupId } from "@/lib/compare/types";

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
