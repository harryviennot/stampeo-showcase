"use client";

import { useState } from "react";
import { ScrollReveal } from "../ui/ScrollReveal";

const customerBenefits = [
  {
    icon: "💳",
    title: "Always in their pocket",
    description: "Lives in Apple Wallet or Google Wallet. No app to find or open at the counter.",
  },
  {
    icon: "📡",
    title: "Works offline",
    description: "No internet needed to show their card at checkout. Works reliably anywhere.",
  },
  {
    icon: "🔔",
    title: "Instant updates",
    description: "Real-time push notifications when they earn stamps or unlock exclusive rewards.",
  },
];

const businessBenefits = [
  {
    icon: "⚡",
    title: "Setup in 10 minutes",
    description: "No hardware required. Design your card, share a link, and start collecting stamps today.",
  },
  {
    icon: "📊",
    title: "Track everything",
    description: "See who visits, how often, and what drives them back. Data you can actually use.",
  },
  {
    icon: "🚀",
    title: "Unlimited scans",
    description: "No per-scan fees. Your team can stamp as many customers as walk through the door.",
  },
];

export function BenefitsSection() {
  const [activeTab, setActiveTab] = useState<"customers" | "business">("customers");

  const benefits = activeTab === "customers" ? customerBenefits : businessBenefits;

  return (
    <section className="relative py-24 lg:py-32">
      {/* Floating Geometric Decorations */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-[var(--accent)]/10" />
        <div className="absolute top-[40%] right-[5%] w-24 h-24 rotate-45 bg-[var(--stamp-coral)]/10 rounded-lg" />
        <div className="absolute bottom-20 left-[15%] w-40 h-40 rounded-full border-4 border-[var(--accent)]/5" />
        <div className="absolute top-[15%] right-[20%] w-16 h-16 bg-[var(--stamp-sage)]/10 rounded-full" />
        <div className="absolute bottom-[30%] right-[15%] w-28 h-28 bg-[var(--stamp-sand)]/10 rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight px-4 pb-3">
            Works for everyone
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl px-4">
            A seamless experience designed for modern shoppers and growing businesses.
          </p>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal delay={100} className="flex justify-center px-4 py-8 mb-4">
          <div className="flex h-14 w-full max-w-md items-center justify-center rounded-full bg-[var(--accent)]/5 p-1.5 border border-[var(--accent)]/10">
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-6 transition-all duration-300 text-base font-bold leading-normal ${
                activeTab === "customers"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--accent)]/70 hover:text-[var(--accent)]"
              }`}
            >
              <span className="truncate">For Your Customers</span>
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-6 transition-all duration-300 text-base font-bold leading-normal ${
                activeTab === "business"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--accent)]/70 hover:text-[var(--accent)]"
              }`}
            >
              <span className="truncate">For Your Business</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Benefit Cards */}
        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
          {benefits.map((benefit, index) => (
            <div
              key={`${activeTab}-${index}`}
              className="group relative flex flex-col gap-6 p-8 bg-[var(--cream)] rounded-xl shadow-xl shadow-[var(--accent)]/5 border border-white/50 transition-transform duration-300 hover:-translate-y-2"
            >
              {/* Corner Decoration */}
              <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <span className="text-8xl">✦</span>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <span className="text-3xl">{benefit.icon}</span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold leading-tight">{benefit.title}</h3>
                <p className="text-[var(--muted-foreground)] text-base font-medium leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
