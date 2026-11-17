"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "../icons";
import { MarketLink } from "../market/MarketLink";
import type { NavMenuItem } from "@/lib/nav/menu-items";
import { SoonPill } from "./SoonPill";

/** The open dropdown's card: each entry's label (with Soon beside it where the feature is not live) and its quiet second line. */
export function NavDropdownPanel({ items, onNavigate }: Readonly<{ items: NavMenuItem[]; onNavigate: () => void }>) {
  return (
    <div className="w-[264px] bg-white rounded-2xl card-stamp p-2" role="menu">
      {items.map((item) => (
        <MarketLink
          key={item.href}
          market={item.market ?? "int"}
          href={item.href as "/features/design-de-carte"}
          className="block rounded-xl px-3 py-2.5 hover:bg-[var(--cream)] transition-colors"
          onClick={onNavigate}
          role="menuitem"
        >
          <span className={`${item.soon ? "flex items-center gap-2" : "block"} text-sm font-semibold text-[var(--foreground)]`}>
            {item.label}
            {item.soon && <SoonPill />}
          </span>
          {item.description && (
            <span className="block text-xs text-[var(--muted-foreground)] mt-0.5 leading-snug">
              {item.description}
            </span>
          )}
        </MarketLink>
      ))}
    </div>
  );
}

/**
 * A nav menu that is a list of words, not a wall of icons. The label carries
 * the meaning; the description is a quiet second line for the ones that need
 * it. Opens on hover with a short fade and an 8px rise, the same motion the
 * rest of the chrome uses.
 */
export function NavDropdown({
  label,
  items,
  active,
}: {
  label: string;
  items: NavMenuItem[];
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
          active
            ? "text-[var(--accent)]"
            : "text-[var(--foreground)] hover:text-[var(--accent)]"
        }`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {label}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 pt-3 z-50"
          >
            <NavDropdownPanel items={items} onNavigate={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
