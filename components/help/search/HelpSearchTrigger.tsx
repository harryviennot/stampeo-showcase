"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MagnifyingGlassIcon } from "@/components/icons";
import { HelpSearchDialog } from "./HelpSearchDialog";
import { loadSearchIndex } from "./use-help-search";

const STYLES = {
  // The article and topic pages' breadcrumb row.
  pill: "ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--near-black)] hover:bg-[var(--paper-hover)]",
  // The phone home: a button that looks like the field it opens.
  field:
    "flex h-14 w-full items-center gap-3 rounded-full border border-[var(--border)] bg-white px-5 text-left text-base text-[var(--muted-foreground)] shadow-sm",
} as const;

/** A button that opens the search dialog; the index starts downloading as a finger or pointer nears it. */
export function HelpSearchTrigger({ variant, label }: { variant: keyof typeof STYLES; label: string }) {
  const [open, setOpen] = useState(false);
  const warm = () => {
    loadSearchIndex().catch(() => {});
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={warm}
        onFocus={warm}
        onTouchStart={warm}
        className={STYLES[variant]}
      >
        <MagnifyingGlassIcon aria-hidden className={variant === "pill" ? "h-4 w-4" : "h-5 w-5"} />
        {label}
      </button>
      <HelpSearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** The pill with its own label, for the breadcrumb row. */
export function HelpSearchPill() {
  const t = useTranslations("help.search");
  return <HelpSearchTrigger variant="pill" label={t("open")} />;
}
