"use client";

import Link from "next/link";
import { ScrollReveal } from "../ui/ScrollReveal";

export function FinalCTASection() {
  return (
    <section className="relative stamp-pattern flex flex-col items-center justify-center px-6 py-24 md:py-32 lg:py-48 text-center overflow-hidden">
      {/* Decorative Stamp Shapes */}
      <div className="stamp-shape top-10 left-10 md:left-20 text-[var(--accent)]">
        <span className="text-7xl">★</span>
      </div>
      <div className="stamp-shape top-32 left-32 hidden lg:block text-[var(--stamp-coral)]">
        <span className="text-6xl">⬠</span>
      </div>
      <div className="stamp-shape top-1/4 left-1/4 opacity-10 text-[var(--stamp-sand)]">
        <span className="text-9xl">●</span>
      </div>

      <div className="stamp-shape bottom-20 left-10 md:left-40 text-[var(--stamp-sage)]">
        <span className="text-8xl">⬡</span>
      </div>
      <div className="stamp-shape bottom-40 left-10 hidden md:block text-[var(--accent)]">
        <span className="text-5xl">■</span>
      </div>

      <div className="stamp-shape top-12 right-12 md:right-24 text-[var(--stamp-coral)]">
        <span className="text-8xl">●</span>
      </div>
      <div className="stamp-shape top-48 right-1/4 hidden lg:block text-[var(--stamp-sage)]">
        <span className="text-6xl">★</span>
      </div>

      <div className="stamp-shape bottom-16 right-16 md:right-32 text-[var(--stamp-sand)]">
        <span className="text-9xl">⬠</span>
      </div>
      <div className="stamp-shape bottom-1/3 right-10 hidden md:block text-[var(--accent)]">
        <span className="text-7xl">⬡</span>
      </div>

      {/* Central Content */}
      <ScrollReveal className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05]">
          Ready to turn visitors{" "}
          <br className="hidden md:block" />
          into <span className="text-[var(--accent)]">regulars?</span>
        </h2>

        <div className="flex flex-col items-center gap-6">
          <Link
            href="/onboarding"
            className="group flex min-w-[280px] md:min-w-[340px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 md:h-20 px-10 bg-[var(--accent)] text-white text-lg md:text-xl font-extrabold leading-normal tracking-wide shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <span>Start Your 30-Day Free Trial</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[var(--muted-foreground)] text-sm md:text-base font-medium flex items-center gap-2">
              <span className="text-[var(--stamp-sage)]">✓</span>
              <span>No credit card required.</span>
              <span className="mx-1 text-[var(--border)]">•</span>
              <span>Setup in under 10 minutes.</span>
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
