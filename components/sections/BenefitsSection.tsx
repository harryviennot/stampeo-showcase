"use client";

import { Container } from "../ui/Container";
import {
  DevicePhoneMobileIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartIcon,
  UserGroupIcon,
  SparklesIcon,
} from "../icons";
import { ScrollReveal } from "../ui/ScrollReveal";

const customerBenefits = [
  {
    icon: DevicePhoneMobileIcon,
    title: "Always in their pocket",
    description: "No app to install, no card to forget",
  },
  {
    icon: BellIcon,
    title: "Real-time updates",
    description:
      "Instant notifications when they earn stamps or unlock rewards",
  },
  {
    icon: ShieldCheckIcon,
    title: "Works offline",
    description: "Cards sync automatically when connected",
  },
];

const businessBenefits = [
  {
    icon: ChartIcon,
    title: "See every visit",
    description: "Track every customer, every stamp, every reward claimed",
  },
  {
    icon: UserGroupIcon,
    title: "Know your regulars",
    description: "See who's one stamp away from coming back",
  },
  {
    icon: SparklesIcon,
    title: "Your brand, your way",
    description: "Design cards that look like your brand, not a template",
  },
];

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="py-20 sm:py-28 lg:py-36 relative"
    >
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
            Why Stampeo
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            Simple for them.{" "}
            <span className="text-[var(--muted-foreground)]">
              Powerful for you.
            </span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Customer benefits */}
          <ScrollReveal variant="left" className="clean-card rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#3b82f6] rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                For your customers
              </h3>
            </div>
            <div className="space-y-6">
              {customerBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-[var(--muted)] transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--muted)] rounded-xl flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Business benefits */}
          <ScrollReveal variant="right" delay={150} className="clean-card rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                For you
              </h3>
            </div>
            <div className="space-y-6">
              {businessBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-[var(--muted)] transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--muted)] rounded-xl flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
