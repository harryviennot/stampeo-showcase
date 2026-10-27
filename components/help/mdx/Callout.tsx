import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { InfoIcon, WarningIcon } from "@/components/icons";

type CalloutType = "note" | "warning";

const BOX: Record<CalloutType, string> = {
  note: "border-[var(--border)] bg-[var(--blog-bg-alt)]",
  warning: "border-[var(--accent)] bg-[var(--accent-light)]",
};

/** A remark set apart from the steps: a note on a quiet rule, a warning on the accent. */
export function Callout({ type = "note", children }: { type?: CalloutType; children: ReactNode }) {
  const t = useTranslations("help.callout");
  const box = BOX[type];
  const Icon = type === "warning" ? WarningIcon : InfoIcon;

  return (
    <aside
      className={`my-6 rounded-r-xl border-l-4 px-5 py-4 text-[0.95em] [&>*:last-child]:mb-0 [&>div+*]:mt-0 ${box}`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--near-black)]">
        <Icon aria-hidden className="h-4 w-4" weight="bold" />
        {t(type)}
      </div>
      {children}
    </aside>
  );
}
