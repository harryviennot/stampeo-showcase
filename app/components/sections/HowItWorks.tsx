"use client";

import { Container } from "../ui/Container";
import { PaletteIcon, WalletIcon, QRCodeIcon } from "../icons";
import { ScrollReveal } from "../ui/ScrollReveal";

const steps = [
  {
    step: 1,
    title: "Design your card",
    description:
      "Choose stamps or points. Add your logo, colors, and reward. Include your hours, website, or a message on the back.",
    icon: PaletteIcon,
    gradient: "from-violet-400 to-purple-500",
    shadow: "shadow-violet-500/30",
  },
  {
    step: 2,
    title: "Customers add it instantly",
    description:
      "A QR code or link — one tap, and your card is in their wallet. No app, no account, no friction.",
    icon: WalletIcon,
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/30",
  },
  {
    step: 3,
    title: "Scan and reward",
    description:
      "Use the Stampeo scanner to add stamps or points. Customers get a notification, you get the data.",
    icon: QRCodeIcon,
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/30",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 lg:py-36 relative"
    >
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-amber-700 text-sm font-medium mb-6 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800/30 dark:text-amber-400">
            Simple setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Live in three steps.
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            Get your digital loyalty card up and running in minutes
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 150} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[var(--border)] to-transparent" />
              )}

              <div className="premium-card rounded-3xl p-8 h-full">
                {/* Step number badge */}
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold text-sm flex items-center justify-center">
                  {item.step}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-8 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  {item.title}
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
