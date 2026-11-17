import type { ReactNode } from "react";
import type { FeatureLinks } from "@/lib/landing-pages/preview-nav";
import type { Market } from "@/lib/markets";
import type { NavMenuItem } from "@/lib/nav/menu-items";

/** What the header hands to whichever phone menu it draws. */
export interface PhoneMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  /** Whether the page has scrolled: the bar turns to frosted cream. */
  scrolled: boolean;
  featureLinks: FeatureLinks;
  /** The market of the page: a preview a feature link leads to stays inside it. */
  market: Market;
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

/** The header bar: the page's links and the phone menu's button on one row, and the panel under it if the menu draws one. */
export function HeaderBar({
  scrolled,
  extra = "",
  burger,
  below,
  children,
}: Readonly<{ scrolled: boolean; extra?: string; burger: ReactNode; below?: ReactNode; children: ReactNode }>) {
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
      {below}
    </div>
  );
}
