import type { ReactNode } from "react";
import type { NavMenuItem } from "@/lib/nav/menu-items";

/** What the header hands to the phone menu. */
export interface PhoneMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  /** Whether the page has scrolled: the bar turns to frosted cream. */
  scrolled: boolean;
  /** The page's path without its locale, to mark the entry you are on. */
  pathname: string;
  /** Loyalty and Pricing. */
  navItems: NavMenuItem[];
  /** Blog, What's new, About and Contact. */
  resourceItems: NavMenuItem[];
  signedIn: boolean;
  appUrl: string;
  onSignOut: () => void;
  /** The bar's content: the logo, the desktop links and the sign-in buttons. */
  children: ReactNode;
}

/** The header bar: the page's links and the phone menu's button on one row. */
export function HeaderBar({
  scrolled,
  extra = "",
  burger,
  children,
}: Readonly<{ scrolled: boolean; extra?: string; burger: ReactNode; children: ReactNode }>) {
  return (
    <div
      className={`transition-all duration-300 border-b ${scrolled
        ? "bg-[var(--cream)]/80 backdrop-blur-md border-[var(--accent)]/10 shadow-sm"
        : "bg-transparent border-transparent"
        }${extra}`}
    >
      <nav className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 lg:py-5 py-3 max-w-[1360px] mx-auto">
        {children}
        {burger}
      </nav>
    </div>
  );
}
