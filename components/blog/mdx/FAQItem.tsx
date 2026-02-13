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
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
      className="not-prose group flex flex-col rounded-xl bg-[var(--cream)] shadow-sm border border-[var(--accent)]/5 px-6 py-4 mt-4 cursor-pointer"
    >
      <div className="flex items-center justify-between gap-6 py-2 text-left">
        <p
          style={{ color: open ? "var(--accent)" : "var(--near-black)" }}
          className="text-lg font-bold leading-normal transition-colors group-hover:text-[var(--accent)]"
        >
          {question}
        </p>
        <div
          style={{ color: open ? "var(--accent)" : "var(--muted-foreground)" }}
          className={`transition-all duration-300 ${open ? "rotate-180" : ""}`}
        >
          <span className="text-xl font-bold">↓</span>
        </div>
      </div>
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
