"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MenuIcon, XMarkIcon } from "../icons";
import { useAuth } from "@/lib/supabase/auth-provider";
import { StampeoLogo } from "../logo";
import type { User } from "@supabase/supabase-js";

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
          Sign out
        </button>
        <Link
          href={appUrl}
          className="flex items-center justify-center h-10 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
        >
          Dashboard
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
        Log in
      </Link>
      <Link
        href="/onboarding"
        className="flex items-center justify-center h-10 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95"
      >
        Get Started
      </Link>
    </>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();

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

  const navItems = ["Features", "Pricing", "FAQ"];

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
            {navItems.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
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
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-[var(--accent)]/10">
                {user ? (
                  <>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-3 text-sm text-left font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                    >
                      Sign out
                    </button>
                    <Link
                      href={appUrl}
                      className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/onboarding"
                      className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
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
