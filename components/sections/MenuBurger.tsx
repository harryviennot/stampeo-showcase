"use client";

import type { RefObject } from "react";

/** The id of the open menu: the burger's `aria-controls`. */
export const MOBILE_MENU_ID = "mobile-menu";

/** The phone menu's button: 44px to tap, the burger and the X cross-fading (an instant swap under reduced motion). */
export function MenuBurger({
  open,
  onToggle,
  buttonRef,
}: Readonly<{ open: boolean; onToggle: () => void; buttonRef: RefObject<HTMLButtonElement | null> }>) {
  const layer = "absolute inset-0 flex items-center justify-center transition-opacity duration-150 motion-reduce:transition-none";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={MOBILE_MENU_ID}
      aria-label={open ? "Close menu" : "Open menu"}
      className="relative -my-0.5 -mr-0.5 h-11 w-11 shrink-0 rounded-full text-[var(--foreground)] transition-colors hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] lg:hidden"
    >
      <span aria-hidden className={`${layer} ${open ? "opacity-0" : "opacity-100"}`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </span>
      <span aria-hidden className={`${layer} ${open ? "opacity-100" : "opacity-0"}`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    </button>
  );
}
