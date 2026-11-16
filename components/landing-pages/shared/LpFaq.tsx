import { FAQList } from "@/components/ui/FAQList";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { RegionText } from "@/components/market/RegionText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import type { FaqItem } from "@/lib/landing-pages/copy/types";
import { LpSection } from "./LpSection";

/**
 * The five questions every page answers, collapsed, and one contact line. A page that brings its own `faq`
 * gets Platform's look: its title centred, the questions as one white table framed in ink, and the contact
 * line centred under it.
 */
export function LpFaq({
  faq,
}: Readonly<{ faq?: { title: string; items: readonly FaqItem[] } }>) {
  const { title, items } = faq ?? SHARED.faq;
  const own = faq !== undefined;
  const { contact } = SHARED.faq;

  return (
    <LpSection
      section="faq"
      size="narrow"
      title={title}
      align={own ? "center" : undefined}
    >
      <FAQList
        items={items.map((item) => ({ question: item.question, answer: <RegionText raw={item.answer} /> }))}
        table={own}
      />
      <p className={own ? "mt-6 text-center text-base text-[var(--muted-foreground)]" : "mt-8 text-base text-[var(--muted-foreground)]"}>
        {contact.before}{" "}
        <TrackedLink
          href="/contact"
          trackAs="faq_contact"
          className="inline-flex min-h-11 items-center font-semibold text-[var(--foreground)] underline underline-offset-4"
        >
          {contact.link}
        </TrackedLink>
        . {contact.after}
      </p>
    </LpSection>
  );
}
