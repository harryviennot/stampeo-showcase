"use client";

import { Container } from "../ui/Container";
import { ChevronDownIcon } from "../icons";

const faqs = [
  {
    question: "Do my customers need to download an app?",
    answer:
      "No. The card goes straight into Apple Wallet or Google Wallet, which are already on their phone. One tap and they're done — no app store, no account creation, no friction.",
  },
  {
    question: "What do I need to scan the cards?",
    answer:
      "Just your phone. Our scanner works in any browser — no special hardware required. Open the scanner, point at the customer's card, and you're done.",
  },
  {
    question: "Can I customize the card design?",
    answer:
      "Yes — your logo, colors, reward structure, and back-of-card info (hours, website, social links). Your card should look like your brand, not a generic template.",
  },
  {
    question: "What if a customer doesn't have Apple or Google Wallet?",
    answer:
      "They can still access their card via a web link. It works on any device with a browser, though the wallet experience is smoother for most customers.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-36 relative">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-700 text-sm font-medium mb-6 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30 dark:text-blue-400">
              Got questions?
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group premium-card rounded-2xl overflow-hidden"
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
