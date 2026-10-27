"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/icons";

interface Section {
  id: string;
  text: string;
}

/**
 * "On this page" folded above a long article on a phone: a native `details`,
 * filled from the article's `##` headings once the page has loaded. Closed, it
 * is one 44px row; a long concept page runs thousands of pixels on a phone.
 */
export function PhoneToc() {
  const t = useTranslations("help.article");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    // After the first paint, so the article's headings (and their ids) are in the DOM.
    const frame = requestAnimationFrame(() => {
      const headings = document.querySelectorAll("article.help-prose h2");
      setSections(Array.from(headings, (el) => ({ id: el.id, text: el.textContent ?? "" })).filter((s) => s.id));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <details
      ref={detailsRef}
      className="group mt-6 rounded-xl border border-[var(--border)] bg-[var(--paper)] lg:hidden"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 font-semibold text-[var(--near-black)] [&::-webkit-details-marker]:hidden">
        <span>{t("onThisPage")}</span>
        <ChevronDownIcon
          aria-hidden
          className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180"
        />
      </summary>
      <ul className="border-t border-[var(--border)] py-1">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={() => detailsRef.current?.removeAttribute("open")}
              className="flex min-h-11 items-center px-4 py-2 text-sm text-[var(--near-black)] hover:bg-[var(--paper-hover)]"
            >
              {section.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
