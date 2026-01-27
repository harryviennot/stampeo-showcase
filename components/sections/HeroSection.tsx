"use client";

import Link from "next/link";
import { ScrollReveal } from "../ui/ScrollReveal";
import { LoyaltyCardPreview } from "../ui/LoyaltyCardPreview";

function GeometricDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[var(--accent)]/20 blur-3xl" />
      <div className="absolute bottom-20 right-[5%] w-96 h-96 bg-[var(--accent)]/10 blur-2xl rotate-45">
        <span className="text-[300px] text-[var(--accent)]">★</span>
      </div>
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[var(--stamp-sage)]/30 rounded-full blur-2xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[var(--stamp-coral)]/20 blur-3xl rotate-12" />
    </div>
  );
}

function VerificationBox() {
  return (
    <div className="relative mt-8 bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/5 max-w-[380px] mx-auto">
      <p className="text-sm font-bold mb-4 flex items-center gap-2">
        <span className="text-[var(--accent)]">📷</span>
        <span>Scanned your card? Enter the number:</span>
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="6-digit code"
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] text-sm px-5 h-12 focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none transition-all"
        />
        <button className="bg-[var(--accent)] text-white px-6 rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
          Verify
        </button>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col pt-24">
      <GeometricDecorations />

      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-10 py-12 lg:py-24">
        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Content */}
          <ScrollReveal className="flex flex-col gap-8 order-2 lg:order-1">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--accent)]/10 shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] pulse-dot" />
                <span className="text-sm font-bold tracking-wide">30-day free trial</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                Loyalty cards your customers{" "}
                <span className="text-[var(--accent)]">actually keep.</span>
              </h1>

              <p className="text-lg lg:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                Digital passes that live in their phone wallet. No app to download.
                Stamps update in real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/onboarding"
                className="group flex items-center gap-2 bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--accent)]/25 hover:scale-105 transition-all"
              >
                <span>Get Started</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 bg-white border-2 border-[var(--border)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--muted)] transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Trust icons */}
            <div className="flex items-center gap-6 pt-4 opacity-40">
              <span className="text-3xl">💳</span>
              <span className="text-3xl">📱</span>
              <span className="text-3xl">✨</span>
            </div>
          </ScrollReveal>

          {/* Right Column: 3D Digital Card */}
          <ScrollReveal delay={200} className="flex flex-col order-1 lg:order-2">
            <LoyaltyCardPreview />
            <VerificationBox />
          </ScrollReveal>
        </div>
      </main>
    </section>
  );
}
