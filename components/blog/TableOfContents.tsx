"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const t = useTranslations("blog");
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const initialized = useRef(false);

  const initHeadings = useCallback(() => {
    if (initialized.current) return;
    const article = document.querySelector("article");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: Heading[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: parseInt(el.tagName[1]),
    }));
    initialized.current = true;
    setHeadings(items);
  }, []);

  useEffect(() => {
    requestAnimationFrame(initHeadings);
  }, [initHeadings]);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article");
      if (!article) return;
      const elements = article.querySelectorAll("h2, h3");
      let currentId = "";
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          currentId = el.id;
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h4 className="text-sm font-bold mb-3 text-[var(--foreground)]">
        {t("tableOfContents")}
      </h4>
      <ul className="border-l-2 border-[var(--border)] space-y-0.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 16}px` }}
              className={`block py-1.5 -ml-[2px] border-l-2 transition-colors ${
                activeId === heading.id
                  ? "border-[var(--accent)] text-[var(--accent)] font-medium"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
