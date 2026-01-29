"use client";

import { ScrollReveal } from "../ui/ScrollReveal";
import Link from "next/link";

const faqs = [
  {
    question: "How long is the free trial?",
    answer:
      "30 days, no credit card required. You get full access to all features during the trial, allowing you to experience the complete platform before deciding.",
  },
  {
    question: "Do my customers need to download an app?",
    answer:
      "No, Stampeo works directly through the web browser or can be added to digital wallets like Apple Wallet or Google Pay. Zero friction for your customers.",
  },
  {
    question: "What equipment do I need?",
    answer:
      "Any device with an internet connection. You can use a tablet, smartphone, or even a laptop at your POS to manage stamps and rewards.",
  },
  {
    question: "Can I customize the card design?",
    answer:
      "Yes! You can customize colors, logo, stamps, and rewards to match your brand perfectly. Our editor is intuitive and reflects changes in real-time.",
  },
  {
    question: "How do customers get stamped?",
    answer:
      "Customers simply scan a unique QR code displayed at your checkout, or you can scan their digital card. Both methods are fast and secure.",
  },
  {
    question: "What happens when I cancel?",
    answer:
      "You can cancel at any time. Your data will be held for 30 days if you change your mind, after which it will be permanently deleted. No hidden fees.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Decoration: Top Right Stamp */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-[var(--accent)]/5 stamp-decoration pointer-events-none" />
      <div className="absolute top-20 -right-20 w-48 h-48 bg-[var(--accent)]/10 stamp-decoration rotate-12 pointer-events-none" />

      <div className="max-w-[840px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <ScrollReveal className="mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)] text-lg font-medium">
            Everything you need to know about setting up your digital loyalty program.
          </p>
        </ScrollReveal>

        {/* Accordion List */}
        <ScrollReveal delay={200} className="flex flex-col gap-5">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group flex flex-col rounded-xl bg-[var(--cream)] shadow-sm border border-[var(--accent)]/5 px-6 py-4"
              open={faq.question === "How long is the free trial?" || faq.question === "Can I customize the card design?"}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                <p className="text-lg font-bold leading-normal group-hover:text-[var(--accent)] transition-colors">
                  {faq.question}
                </p>
                <div className="text-[var(--muted-foreground)] transition-transform duration-300 group-open:rotate-180 group-open:text-[var(--accent)]">
                  <span className="text-xl font-bold">↓</span>
                </div>
              </summary>
              <div className="pt-2 pb-4">
                <p className="text-[var(--muted-foreground)] text-base font-medium leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </ScrollReveal>

        {/* CTA Section inside FAQ */}
        <ScrollReveal delay={400} className="mt-20 p-10 bg-[var(--foreground)] rounded-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
          <h3 className="text-white text-3xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            We&apos;re here to help you grow your business and build lasting customer relationships.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/onboarding"
              className="bg-[var(--accent)] hover:brightness-110 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
            >
              Contact Support
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
