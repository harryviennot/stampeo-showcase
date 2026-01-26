"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { MenuIcon, XMarkIcon } from "../icons";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className={`mx-4 mt-4 sm:mx-6 lg:mx-8 transition-all duration-500 ${scrolled ? "mx-2 sm:mx-4 lg:mx-6" : ""}`}>
        <div className={`glass-premium rounded-2xl px-4 sm:px-6 transition-all duration-500 ${scrolled ? "shadow-glass-scrolled" : ""}`}>
          <nav className="flex items-center justify-between h-14 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg text-[var(--foreground)]">
                Stampeo
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-1">
              {["How it works", "Benefits", "Pricing", "FAQ"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] rounded-lg transition-all duration-200"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="#"
                className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Log in
              </Link>
              <Button href="#" size="default">
                Get started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
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
            <div className="md:hidden py-4 border-t border-[var(--border)]">
              <div className="flex flex-col gap-1">
                {["How it works", "Benefits", "Pricing", "FAQ"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="px-4 py-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-[var(--border)]">
                  <Link
                    href="#"
                    className="px-4 py-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Log in
                  </Link>
                  <Button href="#" size="default" className="mx-4">
                    Get started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
