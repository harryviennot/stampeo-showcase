"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useHasSession } from "@/lib/auth/use-has-session";
import { StampeoLogo } from "../logo";
import { TrackedLink } from "../ui/TrackedLink";
import { lockBodyScroll } from "@/lib/dom/body-scroll-lock";
import { PromoBanner } from "./PromoBanner";
import { PROMO_BANNER_ENABLED } from "@/lib/pricing";
import type { Market } from "@/lib/markets";
import { MarketLink } from "../market/MarketLink";
import { holdPageWhileOpen, isCurrentPath } from "@/lib/nav/mobile-menu";
import { pageMenuItems, productMenuItems } from "@/lib/nav/menu-items";
import { NavDropdown } from "./NavDropdown";
import { AccordionMenu } from "./MobileMenuAccordion";
import { SheetMenu } from "./SheetMenu";

function DesktopAuthButtons({
  signedIn,
  appUrl,
  onSignOut,
}: Readonly<{
  signedIn: boolean;
  appUrl: string;
  onSignOut: () => void;
}>) {
  const t = useTranslations();

  if (signedIn) {
    return (
      <>
        <button
          onClick={onSignOut}
          className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
        >
          {t("common.auth.signOut")}
        </button>
        <Link
          href={appUrl}
          className="flex items-center justify-center h-9 px-4 bg-[var(--accent)] text-white text-xs font-bold rounded-full hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
        >
          {t("common.auth.dashboard")}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
      >
        {t("common.auth.logIn")}
      </Link>
      <TrackedLink
        trackAs="header"
        href="/onboarding"
        className="flex items-center justify-center h-9 px-4 bg-[var(--accent)] text-white text-xs font-bold rounded-full hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
      >
        {t("common.auth.getStarted")}
      </TrackedLink>
    </>
  );
}

/** `mobileMenu` is the phone menu the bar draws: the accordion panel, or the full-screen sheet. */
export function Header({
  market = "int",
  mobileMenu = "accordion",
}: Readonly<{ market?: Market; mobileMenu?: "accordion" | "sheet" }>) {
  const PhoneMenu = mobileMenu === "sheet" ? SheetMenu : AccordionMenu;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const signedIn = useHasSession();
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The open menu holds the page: no scroll behind it, and Escape closes it.
  useEffect(
    () => (mobileMenuOpen ? holdPageWhileOpen({ lock: lockBodyScroll, target: document, onClose: closeMobileMenu }) : undefined),
    [mobileMenuOpen, closeMobileMenu],
  );

  const handleSignOut = async () => {
    await signOut();
    closeMobileMenu();
  };

  const isActive = (href: string) => isCurrentPath(pathname, href);

  const productItems = productMenuItems(t, locale);
  const { navItems, resourceItems } = pageMenuItems(t, locale, market);

  const BANNER_STORAGE_KEY = "stampeo_promo_banner_dismissed";

  const bannerShouldShow = useSyncExternalStore(
    // subscribe — listen for storage changes (e.g. dismiss in another tab)
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    // getSnapshot — check localStorage
    () => {
      const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
      if (!dismissed) return true;
      const elapsed = Date.now() - Number(dismissed);
      if (elapsed > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(BANNER_STORAGE_KEY);
        return true;
      }
      return false;
    },
    // getServerSnapshot — always false on server
    () => false
  );

  const [bannerDismissed, setBannerDismissed] = useState(false);
  // PROMO_BANNER_ENABLED is off since the founding program closed. The spacer
  // below reads the same flag, so the header offset collapses with it.
  const bannerVisible = PROMO_BANNER_ENABLED && bannerShouldShow && !bannerDismissed;

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <PromoBanner visible={bannerVisible} onDismiss={dismissBanner} />
        <PhoneMenu
          open={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onClose={closeMobileMenu}
          scrolled={scrolled}
          pathname={pathname}
          navItems={navItems}
          resourceItems={resourceItems}
          signedIn={signedIn}
          appUrl={appUrl}
          onSignOut={handleSignOut}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
              <StampeoLogo />
              <span className="text-2xl font-bold text-[var(--foreground)]">
                Stampeo
              </span>
            </div>
          </Link>

          {/* Desktop navigation — full row only from xl: below that the FR/ES
              labels overflow into the logo and auth buttons, so the burger
              menu stays on through lg.
              Absolutely centered rather than a flex child: the auth buttons
              are wider than the logo, so justify-between would push the links
              left of the page centre. */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 lg:absolute lg:inset-y-0 lg:left-1/2 lg:-translate-x-1/2">
            <NavDropdown
              label={t("common.nav.product")}
              items={productItems}
              active={pathname.startsWith("/features/")}
            />
            {navItems.map((item) => (
              <MarketLink
                key={item.href}
                market={item.market}
                href={item.href}
                className={`py-2 text-sm font-semibold transition-colors whitespace-nowrap ${isActive(item.href)
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:text-[var(--accent)]"
                  }`}
              >
                {item.label}
              </MarketLink>
            ))}
            <NavDropdown
              label={t("common.nav.resources")}
              items={resourceItems}
              active={resourceItems.some((r) => isActive(r.href))}
            />
          </div>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <DesktopAuthButtons
              signedIn={signedIn}
              appUrl={appUrl}
              onSignOut={handleSignOut}
            />
          </div>
        </PhoneMenu>
      </header>
      <div
        className="transition-all duration-300"
        style={{ height: bannerVisible ? 40 : 0 }}
      />
    </>
  );
}
