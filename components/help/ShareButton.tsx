"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, ShareIcon } from "@/components/icons";
import { shareLink } from "@/lib/help/share/share";

const COPIED_FOR_MS = 2000;

/** Sends the page's link with the phone's share sheet, or copies it and says so for two seconds. */
export function ShareButton({ title }: { title: string }) {
  const t = useTranslations("help.share");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onClick() {
    const url = `${window.location.origin}${window.location.pathname}`;
    const outcome = await shareLink(
      { title, url },
      {
        share: typeof navigator.share === "function" ? (data) => navigator.share(data) : undefined,
        copy: (text) => navigator.clipboard.writeText(text),
      }
    );
    if (outcome !== "copied") return;

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_FOR_MS);
  }

  const Icon = copied ? CheckIcon : ShareIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--near-black)] hover:bg-[var(--paper-hover)]"
    >
      <Icon aria-hidden className="h-4 w-4" weight="bold" />
      {t("share")}
      <span aria-live="polite" className={copied ? "text-[var(--muted-foreground)]" : "sr-only"}>
        {copied ? t("copied") : ""}
      </span>
    </button>
  );
}
