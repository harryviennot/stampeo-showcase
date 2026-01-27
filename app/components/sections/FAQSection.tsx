"use client";

import { Container } from "../ui/Container";
import { ChevronDownIcon } from "../icons";

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "Start using Stampeo immediately with full access to all features. No credit card required to begin. At the end of 14 days, choose a plan that fits your business or downgrade to limited functionality.",
  },
  {
    question: "Do my customers need to download an app?",
    answer:
      "No. The card goes straight into Apple Wallet or Google Wallet, which are already on their phone. One tap and they're done — no app store, no account creation, no friction.",
  },
  {
    question: "Can I use Stampeo across multiple locations?",
    answer:
      "Yes, with the Pro plan. You can manage multiple locations from a single dashboard, with separate analytics and scanner accounts per location. Geofencing lets you send location-based notifications.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Yes. Customers can show their pass without an internet connection — the QR code is stored locally on their device. When your scanner reconnects, all stamps sync automatically.",
  },
  {
    question: "What equipment do I need?",
    answer:
      "Just your phone. The Stampeo scanner app works on any modern smartphone — no special hardware required. Point your camera at the customer's QR code, and you're done.",
  },
  {
    question: "Can I customize the card design?",
    answer:
      "Absolutely. Add your logo, choose your colors, set your reward structure, and include back-of-card info like hours, website, or social links. Your card should represent your brand.",
  },
  {
    question: "How do I cancel?",
    answer:
      "Cancel anytime from your dashboard. No cancellation fees, no long-term contracts. Your customers keep their passes until they expire or you choose to deactivate them.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-36 relative bg-[var(--background-subtle)]">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group clean-card rounded-2xl overflow-hidden"
              >
                <summary className="p-6 cursor-pointer list-none flex items-center justify-between gap-4 text-left font-semibold text-lg text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors duration-200">
                  <span>{faq.question}</span>
                  <div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--border)] transition-colors">
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-300 group-open:rotate-180" />
                  </div>
                </summary>
                <div className="px-6 pb-6 text-[var(--muted-foreground)] leading-relaxed -mt-2">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
