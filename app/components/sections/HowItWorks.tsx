"use client";

import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { NumberStamp } from "../stamps/StampIcons";

const steps = [
  {
    step: 1,
    title: "Customer scans QR code",
    description:
      "Display a QR code at your counter or include it on receipts. Customers scan it with their phone camera.",
    color: "#f97316", // coral
  },
  {
    step: 2,
    title: "Downloads pass to wallet",
    description:
      "One tap adds your loyalty card to Apple Wallet or Google Wallet. No app to install, no account to create.",
    color: "#ec4899", // pink
  },
  {
    step: 3,
    title: "Shows pass to employee",
    description:
      "Next visit, customers open their wallet and show you the pass. It's always with them, always ready.",
    color: "#8b5cf6", // violet
  },
  {
    step: 4,
    title: "Employee scans, stamp awarded",
    description:
      "You scan their QR code with the Stampeo app. Stamp added instantly. Simple for everyone.",
    color: "#3b82f6", // blue
  },
  {
    step: 5,
    title: "Customer gets notified",
    description:
      "Their pass updates in real-time with a push notification. They see their progress and feel the reward getting closer.",
    color: "#22c55e", // green
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 lg:py-36 relative bg-[var(--background-subtle)]"
    >
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            The magic moment in 5 steps.
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            From first scan to loyal customer in seconds
          </p>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <ScrollReveal
              key={item.step}
              delay={index * 100}
              className="relative"
            >
              <div className="flex gap-6 sm:gap-8 pb-12 last:pb-0">
                {/* Stamp and connector line */}
                <div className="flex flex-col items-center">
                  <NumberStamp
                    color={item.color}
                    size={48}
                    number={item.step}
                  />
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[var(--border)] mt-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
