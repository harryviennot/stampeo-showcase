"use client";

import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons";
import { ScrollReveal } from "../ui/ScrollReveal";
import { LoyaltyCardPreview } from "../ui/LoyaltyCardPreview";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 -z-10 grid-pattern opacity-50" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Content */}
          <ScrollReveal className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              14-day free trial
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
              Loyalty cards your customers{" "}
              <span className="text-[var(--accent)]">actually keep</span>.
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl mx-auto lg:mx-0">
              From signup to first customer scan in under 10 minutes. No app for
              your customers to download, unlimited scans, works offline.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button href="/onboarding" size="lg">
                Start your free trial
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>
          </ScrollReveal>

          {/* Card Preview */}
          <ScrollReveal variant="scale" delay={200} className="relative flex justify-center lg:justify-end items-center">
            <LoyaltyCardPreview />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
