"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ArrowRightIcon, CaretLeftIcon, CaretRightIcon } from "../icons";
import { MarketLink } from "../market/MarketLink";
import { marketPath } from "@/lib/markets";
import { drillFocusSelector, type DrillScreen } from "@/lib/nav/mobile-menu";
import { MenuBottomBar, MenuDialog, useFeatureEntries, type FeatureEntry, type MenuLink, type MenuProps } from "./MobileMenuParts";
import { SoonPill } from "./SoonPill";

/** The featured tile's card is a heavy client component and only this menu shows it, so it loads when the menu does. */
const FeaturedCard = dynamic(() => import("./MenuFeaturedCard"), { ssr: false });

type Screen = DrillScreen;

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]";

/** One screen of the drill-down: another slides in from the right over it (no movement under reduced motion); a screen not shown is inert. */
function DrillScreen({ id, shown, children }: Readonly<{ id: Screen; shown: boolean; children: ReactNode }>) {
  const hidden = id === "root" ? "-translate-x-1/4 opacity-0" : "translate-x-full";

  return (
    <div
      data-drill-screen={id}
      inert={!shown}
      className={`absolute inset-0 overflow-y-auto overscroll-contain bg-[var(--cream)] px-4 pt-3 pb-28 transition-[transform,opacity] duration-[280ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
        shown ? "translate-x-0 opacity-100" : hidden
      }`}
    >
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}

/** The way back from a screen to the menu. */
function BackButton({ onBack }: Readonly<{ onBack: () => void }>) {
  return (
    <button
      type="button"
      onClick={onBack}
      data-drill-first=""
      className={`-ml-1 flex min-h-12 items-center gap-1.5 rounded-lg pr-3 text-[15px] font-semibold text-[var(--foreground)] ${FOCUS}`}
    >
      <CaretLeftIcon size={18} weight="bold" aria-hidden />
      Menu
    </button>
  );
}

/** A feature on the Product screen: its icon, its name, one grey line, and Soon where it is not live. */
function FeatureRow({ entry, onClose }: Readonly<{ entry: FeatureEntry; onClose: () => void }>) {
  const { Icon, label, description, soon, current, href, market } = entry;

  return (
    <MarketLink
      market={market}
      href={href as "/features/design-de-carte"}
      onClick={onClose}
      aria-current={current ? "page" : undefined}
      className={`flex min-h-14 items-center gap-3 rounded-xl py-2 ${FOCUS} ${current ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[17px] leading-tight font-semibold">
          {label}
          {soon && <SoonPill />}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-[var(--muted-foreground)]">{description}</span>
      </span>
    </MarketLink>
  );
}

/** A top-level row: a link, or a button that slides in a screen (with the chevron that says so). */
const ROW = `flex min-h-14 w-full items-center justify-between text-2xl font-semibold text-[var(--foreground)] ${FOCUS}`;

/** The drill-down: four large rows, with Product and Resources sliding their lists in; Log in and Get started are pinned at the foot. */
export function MobileMenuDrill({ onClose, burgerRef, featureLinks, pathname, navItems, resourceItems, signedIn, appUrl, onSignOut, language }: MenuProps) {
  const t = useTranslations("common.nav");
  const entries = useFeatureEntries(featureLinks, pathname);
  const [screen, setScreen] = useState<Screen>("root");
  const menu = useRef<HTMLDivElement>(null);
  const opener = useRef<Screen>("root");

  // Focus follows the screen: the new screen's way back, or the row that opened the one just closed.
  useEffect(() => {
    const root = menu.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(drillFocusSelector(screen, opener.current));

    target?.focus({ preventScroll: true });
  }, [screen]);

  const open = (next: Screen) => {
    opener.current = next;
    setScreen(next);
  };
  const featuresHref = marketPath("us", "/landing-pages/features");

  return (
    <MenuDialog burgerRef={burgerRef}>
      <div ref={menu} className="relative h-full">
        <DrillScreen id="root" shown={screen === "root"}>
          <button type="button" data-drill-root="" data-menu-first="" data-drill-opens="product" onClick={() => open("product")} className={ROW}>
            {t("product")}
            <CaretRightIcon size={20} weight="bold" aria-hidden className="text-[var(--muted-foreground)]" />
          </button>
          {navItems.map((item: MenuLink) => (
            <MarketLink key={item.href} market={item.market ?? "int"} href={item.href as "/features/design-de-carte"} data-drill-root="" onClick={onClose} className={ROW}>
              {item.label}
            </MarketLink>
          ))}
          <button type="button" data-drill-root="" data-drill-opens="resources" onClick={() => open("resources")} className={ROW}>
            {t("resources")}
            <CaretRightIcon size={20} weight="bold" aria-hidden className="text-[var(--muted-foreground)]" />
          </button>
          {language && <div className="mt-4">{language}</div>}
        </DrillScreen>

        <DrillScreen id="product" shown={screen === "product"}>
          <BackButton onBack={() => setScreen("root")} />
          <MarketLink
            market="us"
            href={featuresHref as "/features/design-de-carte"}
            onClick={onClose}
            className={`card-stamp mt-2 flex min-h-[88px] items-center gap-3 rounded-[20px] bg-white p-3 ${FOCUS}`}
          >
            <FeaturedCard />
            <span className="flex flex-1 items-center justify-between gap-2 text-[17px] font-semibold text-[var(--foreground)]">
              See every feature
              <ArrowRightIcon size={18} weight="bold" aria-hidden className="shrink-0 text-[var(--accent)]" />
            </span>
          </MarketLink>
          <div className="mt-3 flex flex-col">
            {entries.map((entry) => (
              <FeatureRow key={entry.key} entry={entry} onClose={onClose} />
            ))}
          </div>
        </DrillScreen>

        <DrillScreen id="resources" shown={screen === "resources"}>
          <BackButton onBack={() => setScreen("root")} />
          <div className="mt-2 flex flex-col">
            {resourceItems.map((item) => (
              <MarketLink key={item.href} market={item.market ?? "int"} href={item.href as "/blog"} onClick={onClose} className={`${ROW} text-xl`}>
                {item.label}
              </MarketLink>
            ))}
          </div>
        </DrillScreen>

        <MenuBottomBar onClose={onClose} signedIn={signedIn} appUrl={appUrl} onSignOut={onSignOut} className="absolute inset-x-0 bottom-0" />
      </div>
    </MenuDialog>
  );
}
