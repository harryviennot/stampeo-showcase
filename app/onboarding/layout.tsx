import type { Metadata } from "next";
import Link from "next/link";

import { StampeoLogo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Get Started - Stampeo",
  description: "Set up your digital loyalty card in minutes",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Minimal header with just logo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <Link href="/" className="inline-block group">
          <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
            <StampeoLogo />
            <span className="text-2xl font-bold gradient-text ">
              Stampeo
            </span>
          </div>
        </Link>
      </header>

      {/* Main content */}
      <main className="pt-20 pb-12 px-4">{children}</main>
    </div>
  );
}
