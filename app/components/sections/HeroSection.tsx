"use client";

import { PremiumCard } from "../ui/PremiumCard";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons";
import { ScrollReveal } from "../ui/ScrollReveal";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 -z-10 grid-pattern opacity-50" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Content */}
          <ScrollReveal variant="blur" className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-amber-700 text-sm font-medium mb-8 shadow-sm dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800/30 dark:text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Now available for free
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
              Loyalty cards your customers{" "}
              <span className="gradient-text">actually keep</span>.
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stampeo lets your customers store their loyalty card in Apple
              Wallet or Google Wallet — no app to download, no card to lose. You
              scan, they earn, they come back.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button href="#" size="lg">
                Create your card free
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>

            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              No credit card required • Setup in 2 minutes
            </p>
          </ScrollReveal>

          {/* Premium Card Display */}
          <ScrollReveal variant="scale" delay={200} className="relative flex justify-center lg:justify-end items-center h-full min-h-[400px]">
            {/* Background Glow specific to the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-200/40 via-orange-100/40 to-transparent blur-3xl -z-10 rounded-full animate-pulse-slow" />

            <PremiumCard />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
