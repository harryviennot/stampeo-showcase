"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function FAQItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setHeight(node.scrollHeight);
  }, []);

  // Re-measure on window resize
  const innerRef = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      contentRef(node);
    },
    [contentRef],
  );

  useEffect(() => {
    const onResize = () => {
      if (innerRef.current) setHeight(innerRef.current.scrollHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="not-prose group flex flex-col rounded-xl bg-[var(--cream)] shadow-sm border border-[var(--accent)]/5 px-6 py-4 mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center justify-between gap-6 py-2 text-left"
      >
        <p className="text-lg font-bold leading-normal group-hover:text-[var(--accent)] transition-colors">
          {question}
        </p>
        <div
          className={`text-[var(--muted-foreground)] transition-transform duration-300 ${open ? "rotate-180 text-[var(--accent)]" : ""}`}
        >
          <span className="text-xl font-bold">↓</span>
        </div>
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
        style={{
          maxHeight: open ? `${height}px` : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div
          ref={setRefs}
          className="pt-2 pb-4 text-[var(--muted-foreground)] text-base font-medium leading-relaxed"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
