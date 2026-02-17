"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  MenuIcon,
  XMarkIcon,
  ChevronDownIcon,
  PaletteIcon,
  CameraIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
  StarIcon,
} from "../icons";
import { useAuth } from "@/lib/supabase/auth-provider";
import { StampeoLogo } from "../logo";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import type { User } from "@supabase/supabase-js";

const FEATURES_DROPDOWN_ITEMS = [
  { key: "designDeCarte", slug: "design-de-carte", Icon: PaletteIcon },
  { key: "scannerMobile", slug: "scanner-mobile", Icon: CameraIcon },
  { key: "notificationsPush", slug: "notifications-push", Icon: BellIcon },
  { key: "analytiques", slug: "analytiques", Icon: ChartIcon },
  { key: "geolocalisation", slug: "geolocalisation", Icon: MapPinIcon },
  { key: "programmeFondateur", slug: "programme-fondateur", Icon: StarIcon },
] as const;

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
    return <div className="w-24 h-10 bg-[var(--muted)] animate-pulse rounded-xl" />;
  }

  if (user) {
    return (
      <>
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
        >
          {t("common.auth.signOut")}
        </button>
        <Link
          href={appUrl}
          className="flex items-center justify-center h-10 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
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
        className="px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
      >
        {t("common.auth.logIn")}
      </Link>
      <Link
        href="/onboarding"
        className="flex items-center justify-center h-10 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
      >
        {t("common.auth.getStarted")}
      </Link>
    </>
  );
}

function FeaturesDropdown() {
  const t = useTranslations("common.nav");
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

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        {t("features")}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className="w-[520px] bg-white rounded-2xl shadow-xl border border-[var(--accent)]/10 p-4 grid grid-cols-2 gap-1">
            {FEATURES_DROPDOWN_ITEMS.map(({ key, slug, Icon }) => (
              <Link
                key={slug}
                href={`/features/${slug}` as "/features/design-de-carte"}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--accent)]/5 transition-colors"
                onClick={() => setOpen(false)}
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
        </div>
      )}
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
      >
        {t("features")}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pl-4 pb-2 space-y-0.5">
          {FEATURES_DROPDOWN_ITEMS.map(({ key, slug, Icon }) => (
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
      )}
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();
  const t = useTranslations();
  const locale = useLocale();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: t("common.nav.pricing"), href: "#pricing" },
    { label: t("common.nav.faq"), href: "#faq" },
    ...(locale === "fr"
      ? [{ label: t("common.nav.blog"), href: "/blog" }]
      : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`transition-all duration-300 border-b ${scrolled
          ? "bg-[var(--cream)]/80 backdrop-blur-md border-[var(--accent)]/10 shadow-sm"
          : "bg-transparent border-transparent"
          }`}
      >
        <nav className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
              <StampeoLogo />
              <span className="text-2xl font-bold gradient-text">
                Stampeo
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-9">
            <FeaturesDropdown />
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <DesktopAuthButtons
              loading={loading}
              user={user}
              appUrl={appUrl}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 border-t border-[var(--accent)]/10 bg-[var(--cream)]">
            <div className="flex flex-col gap-1">
              <MobileFeaturesAccordion onNavigate={() => setMobileMenuOpen(false)} />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
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
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("common.auth.logIn")}
                    </Link>
                    <Link
                      href="/onboarding"
                      className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("common.auth.getStarted")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
