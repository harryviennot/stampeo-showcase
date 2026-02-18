"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDownIcon } from "../icons";
import { useAuth } from "@/lib/supabase/auth-provider";
import { StampeoLogo } from "../logo";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { FEATURE_ITEMS } from "@/lib/features";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { PromoBanner } from "./PromoBanner";

function DesktopAuthButtons({
  loading,
  user,
  appUrl,
  onSignOut,
}: Readonly<{
  loading: boolean;
  user: User | null;
  appUrl: string;
  onSignOut: () => void;
}>) {
  const t = useTranslations();

  if (loading) {
    return <div className="w-20 h-9 bg-[var(--muted)] animate-pulse rounded-full" />;
  }

  if (user) {
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
      <Link
        href="/onboarding"
        className="flex items-center justify-center h-9 px-4 bg-[var(--accent)] text-white text-xs font-bold rounded-full hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
      >
        {t("common.auth.getStarted")}
      </Link>
    </>
  );
}

function FeaturesDropdown() {
  const t = useTranslations("common.nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFeatureActive = pathname.startsWith("/features/");

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
        className={`flex items-center gap-1 text-sm font-semibold transition-colors ${isFeatureActive
          ? "text-[var(--accent)]"
          : "text-[var(--foreground)] hover:text-[var(--accent)]"
          }`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {t("features")}
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
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
          >
            <div
              className="w-[520px] bg-white rounded-2xl shadow-xl border border-[var(--accent)]/10 p-4 grid grid-cols-2 gap-1"
              role="menu"
            >
              {FEATURE_ITEMS.map(({ key, slug, Icon }) => (
                <Link
                  key={slug}
                  href={`/features/${slug}` as "/features/design-de-carte"}
                  className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--accent)]/5 transition-colors"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {t(`featuresItems.${key}.label`)}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-snug">
                      {t(`featuresItems.${key}.description`)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileFeaturesAccordion({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const t = useTranslations("common.nav");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {t("features")}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-2 space-y-0.5">
              {FEATURE_ITEMS.map(({ key, slug, Icon }) => (
                <Link
                  key={slug}
                  href={`/features/${slug}` as "/features/design-de-carte"}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[var(--accent)]/5 transition-colors"
                  onClick={onNavigate}
                >
                  <Icon className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {t(`featuresItems.${key}.label`)}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();
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

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) closeMobileMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  const handleSignOut = async () => {
    await signOut();
    closeMobileMenu();
  };

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItems = [
    { label: t("common.nav.foundingProgram"), href: "/programme-fondateur" },
    { label: t("common.nav.pricing"), href: "/#pricing" },
    ...(locale === "fr"
      ? [{ label: t("common.nav.blog"), href: "/blog" }]
      : []),
    { label: t("common.nav.contact"), href: "/contact" },
  ];

  const BANNER_STORAGE_KEY = "stampeo_promo_banner_dismissed";
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
    if (!dismissed) {
      setBannerVisible(true);
    } else {
      const elapsed = Date.now() - Number(dismissed);
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (elapsed > ONE_DAY) {
        localStorage.removeItem(BANNER_STORAGE_KEY);
        setBannerVisible(true);
      }
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <PromoBanner visible={bannerVisible} onDismiss={dismissBanner} />
        <div
          className={`transition-all duration-300 border-b ${scrolled
            ? "bg-[var(--cream)]/80 backdrop-blur-md border-[var(--accent)]/10 shadow-sm"
            : "bg-transparent border-transparent"
            }`}
        >
          <nav className="relative flex items-center justify-between px-4 lg:px-10 lg:py-5 py-3 max-w-[1400px] mx-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
                <StampeoLogo />
                <span className="text-2xl font-bold gradient-text">
                  Stampeo
                </span>
              </div>
            </Link>

            {/* Desktop navigation — centered via flex */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-9">
              <FeaturesDropdown />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-2 text-sm font-semibold transition-colors whitespace-nowrap ${isActive(item.href)
                    ? "text-[var(--accent)]"
                    : "text-[var(--foreground)] hover:text-[var(--accent)]"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <DesktopAuthButtons
                loading={loading}
                user={user}
                appUrl={appUrl}
                onSignOut={handleSignOut}
              />
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:hidden overflow-hidden border-t border-[var(--accent)]/10 bg-[var(--cream)]"
              >
                <div className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <MobileFeaturesAccordion onNavigate={closeMobileMenu} />
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive(item.href)
                          ? "text-[var(--accent)] bg-[var(--accent)]/5"
                          : "text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
                          }`}
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--accent)]/10">
                      <LanguageSwitcher />
                    </div>
                    <div className="flex flex-col gap-2">
                      {user ? (
                        <>
                          <button
                            onClick={handleSignOut}
                            className="px-4 py-3 text-sm text-left font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                          >
                            {t("common.auth.signOut")}
                          </button>
                          <Link
                            href={appUrl}
                            className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                          >
                            {t("common.auth.dashboard")}
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                            onClick={closeMobileMenu}
                          >
                            {t("common.auth.logIn")}
                          </Link>
                          <Link
                            href="/onboarding"
                            className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                            onClick={closeMobileMenu}
                          >
                            {t("common.auth.getStarted")}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <div
        className="transition-all duration-300"
        style={{ height: bannerVisible ? 40 : 0 }}
      />
    </>
  );
}
