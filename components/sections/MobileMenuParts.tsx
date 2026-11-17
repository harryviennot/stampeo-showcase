"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { motion, type Variants } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { handleMenuKey, inertWhileOpen } from "@/lib/dom/modal";
import { FEATURE_ITEMS } from "@/lib/features";
import { FEATURE_PREVIEWS, featureLink, isComingSoon } from "@/lib/landing-pages/preview-nav";
import type { PreviewSlug } from "@/lib/landing-pages/pages";
import type { Market } from "@/lib/markets";
import { isCurrentPath, menuMotion, type MenuMotion } from "@/lib/nav/mobile-menu";
import { TrackedLink } from "../ui/TrackedLink";
import { MOBILE_MENU_ID } from "./MenuBurger";

/** A link of the menu: `market` is the market a path belongs to, and without one next-intl prefixes the locale. */
export interface MenuLink {
  href: string;
  label: string;
  market?: Market;
  /** The registry page the link opens, when it is a preview: opening it is reported to PostHog. */
  preview?: PreviewSlug;
}

/** What the sheet menu is given. */
export interface MenuProps {
  onClose: () => void;
  /** The header's button: the first Tab stop, and where focus goes on Escape. */
  burgerRef: RefObject<HTMLButtonElement | null>;
  /** The page's path without its locale, to mark the entry you are on. */
  pathname: string;
  /** Loyalty and Pricing. */
  navItems: MenuLink[];
  /** Blog, What's new, About and Contact. */
  resourceItems: MenuLink[];
  signedIn: boolean;
  appUrl: string;
  onSignOut: () => void;
  /** The language control, where the page has more than one language: the header's own, drawn in a row. */
  language?: ReactNode;
}

/** One feature of the Product menu with everything a tile or a row prints. */
export interface FeatureEntry {
  key: string;
  Icon: (typeof FEATURE_ITEMS)[number]["Icon"];
  href: string;
  market: Market;
  label: string;
  description: string;
  soon: boolean;
  current: boolean;
  /** The registry page the entry opens. */
  preview: PreviewSlug;
}

/** The Product menu's six features, linked as the header links them, with their one-line descriptions. */
export function useFeatureEntries(pathname: string): FeatureEntry[] {
  const t = useTranslations("common.nav");
  const locale = useLocale();

  return FEATURE_ITEMS.map(({ key, canonicalSlug, Icon }) => {
    const { href, market } = featureLink(canonicalSlug, locale);

    return {
      key,
      Icon,
      href,
      market,
      label: t(`featuresItems.${key}.label`),
      description: t(`featuresItems.${key}.description`),
      soon: isComingSoon(canonicalSlug),
      current: isCurrentPath(pathname, href),
      preview: FEATURE_PREVIEWS[canonicalSlug],
    };
  });
}

/** The menu's timing for this reader. */
export function useMotion(): MenuMotion {
  return menuMotion(usePrefersReducedMotion());
}

/** An open menu makes the page behind it inert, focuses its first `data-menu-first` entry, and keeps Tab and Escape. */
function useMenuDialog(menu: RefObject<HTMLElement | null>, burger: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const release = inertWhileOpen([document.querySelector("main"), document.querySelector("footer")]);

    menu.current?.querySelector<HTMLElement>("[data-menu-first]")?.focus({ preventScroll: true });
    return release;
  }, [menu]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => handleMenuKey(event, burger.current, menu.current, document.activeElement);

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu, burger]);
}

/** A group of the menu: it rises into place after the group before it. */
export function MenuGroup({ className = "", children }: Readonly<{ className?: string; children: ReactNode }>) {
  const { rise, enter } = useMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: -rise },
    visible: { opacity: 1, y: 0, transition: { duration: enter, ease: "easeOut" } },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

/** The full-screen layer under the header bar: a modal dialog that fades in, its `MenuGroup`s staggering, and scrolls by itself. */
export function MenuDialog({
  burgerRef,
  className = "",
  children,
}: Readonly<{ burgerRef: RefObject<HTMLElement | null>; className?: string; children: ReactNode }>) {
  const { enter, exit, stagger } = useMotion();
  const menu = useRef<HTMLDivElement>(null);
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: enter, ease: "easeOut", staggerChildren: stagger } },
    exit: { opacity: 0, transition: { duration: exit } },
  };

  useMenuDialog(menu, burgerRef);

  return (
    <motion.div
      ref={menu}
      id={MOBILE_MENU_ID}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${MOBILE_MENU_ID}-title`}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ height: "calc(100dvh - 100%)" }}
      className={`absolute inset-x-0 top-full overflow-x-hidden bg-[var(--cream)] lg:hidden ${className}`}
    >
      <h2 id={`${MOBILE_MENU_ID}-title`} className="sr-only">
        Menu
      </h2>
      {children}
    </motion.div>
  );
}

/** The small grey label over a group of the menu. */
export const MENU_LABEL = "text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]";

/** Log in beside Get started (a keycap), or Sign out beside Dashboard: 48px pills in a bar at the foot of the menu; the main action gets the wider pill and never wraps. */
export function MenuBottomBar({
  onClose,
  signedIn,
  appUrl,
  onSignOut,
  className = "",
}: Readonly<Pick<MenuProps, "onClose" | "signedIn" | "appUrl" | "onSignOut"> & { className?: string }>) {
  const t = useTranslations("common.auth");
  const pill = "flex h-12 items-center justify-center rounded-full px-3 text-[15px] font-bold whitespace-nowrap min-[360px]:px-4";
  const quiet = `${pill} flex-1 keycap keycap-flat bg-white text-[var(--foreground)]`;
  const primary = `${pill} flex-[1.3] keycap bg-[var(--accent)] text-white`;

  return (
    <div className={`border-t border-[var(--border)] bg-[var(--cream)] ${className}`}>
      <div className="mx-auto flex max-w-2xl gap-2.5 px-4 pt-3 pb-[calc(15px+env(safe-area-inset-bottom))]">
        {signedIn ? (
          <>
            <button type="button" onClick={onSignOut} className={quiet}>
              {t("signOut")}
            </button>
            <Link href={appUrl} className={primary}>
              {t("dashboard")}
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" onClick={onClose} className={quiet}>
              {t("logIn")}
            </Link>
            <TrackedLink trackAs="header_mobile" href="/onboarding" onClick={onClose} className={primary}>
              {t("getStarted")}
            </TrackedLink>
          </>
        )}
      </div>
    </div>
  );
}
