"use client";

import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CaretRightIcon } from "../icons";
import { MarketLink } from "../market/MarketLink";
import { isCurrentPath } from "@/lib/nav/mobile-menu";
import {
  MENU_LABEL,
  MenuBottomBar,
  MenuDialog,
  MenuGroup,
  useFeatureEntries,
  type FeatureEntry,
  type MenuLink,
  type MenuProps,
} from "./MobileMenuParts";
import { SoonPill } from "./SoonPill";

/** A feature as a small tile: its icon, its name and its one line, then Soon where the feature is coming; the current page is orange. */
function FeatureTile({ entry, first, onClose }: Readonly<{ entry: FeatureEntry; first: boolean; onClose: () => void }>) {
  const { Icon, label, description, soon, current, href, market } = entry;

  return (
    <MarketLink
      market={market}
      href={href as "/features/design-de-carte"}
      onClick={onClose}
      aria-current={current ? "page" : undefined}
      data-menu-first={first ? "" : undefined}
      className={`relative flex min-h-[72px] items-start gap-2 rounded-2xl border-[1.5px] p-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
        current ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--near-black)] bg-white active:bg-[var(--accent)]/5"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-[1.2] font-semibold text-[var(--foreground)]">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-[1.3] text-[var(--muted-foreground)]">{description}</span>
        {soon && <SoonPill className="mt-1 inline-block" />}
      </span>
    </MarketLink>
  );
}

/** Loyalty and Pricing: a large row with a hairline under it and a chevron. */
function BigRow({ href, label, market, onClose, active }: Readonly<MenuLink & { onClose: () => void; active: boolean }>) {
  return (
    <MarketLink
      market={market ?? "int"}
      href={href as "/features/design-de-carte"}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-14 items-center justify-between border-b border-[var(--border)] text-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] ${
        active ? "text-[var(--accent)]" : "text-[var(--foreground)] active:text-[var(--accent)]"
      }`}
    >
      {label}
      <CaretRightIcon size={18} weight="bold" aria-hidden className="text-[var(--muted-foreground)]" />
    </MarketLink>
  );
}

/** The index sheet: every feature as a tile, Loyalty and Pricing as rows, the resources in two columns; Log in and Get started stay in a bar at its foot. */
function MenuSheet({ onClose, burgerRef, pathname, navItems, resourceItems, signedIn, appUrl, onSignOut, language }: MenuProps) {
  const t = useTranslations("common.nav");
  const entries = useFeatureEntries(pathname);

  return (
    <MenuDialog burgerRef={burgerRef} className="flex flex-col overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-6">
        <MenuGroup>
          <p className={MENU_LABEL}>{t("product")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {entries.map((entry, index) => (
              <FeatureTile key={entry.key} entry={entry} first={index === 0} onClose={onClose} />
            ))}
          </div>
        </MenuGroup>

        <MenuGroup className="mt-5 border-t border-[var(--border)]">
          {navItems.map((item) => (
            <BigRow key={item.href} {...item} onClose={onClose} active={isCurrentPath(pathname, item.href)} />
          ))}
        </MenuGroup>

        <MenuGroup className="mt-6">
          <p className={MENU_LABEL}>{t("resources")}</p>
          <div className="mt-1 grid grid-cols-2 gap-x-4">
            {resourceItems.map((item) => (
              <MarketLink
                key={item.href}
                market={item.market ?? "int"}
                href={item.href as "/blog"}
                onClick={onClose}
                aria-current={isCurrentPath(pathname, item.href) ? "page" : undefined}
                className="flex min-h-12 items-center text-[17px] font-medium text-[var(--foreground)] transition-colors active:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]"
              >
                {item.label}
              </MarketLink>
            ))}
          </div>
        </MenuGroup>

        {language && <MenuGroup className="mt-4">{language}</MenuGroup>}
      </div>

      <MenuBottomBar onClose={onClose} signedIn={signedIn} appUrl={appUrl} onSignOut={onSignOut} className="sticky bottom-0" />
    </MenuDialog>
  );
}

/** The phone menu, open or closed: the index sheet. */
export function MobileMenu({ open, ...props }: MenuProps & Readonly<{ open: boolean }>) {
  return <AnimatePresence>{open && <MenuSheet {...props} />}</AnimatePresence>;
}
