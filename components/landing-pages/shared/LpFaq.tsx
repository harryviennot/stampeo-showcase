import { FAQList } from "@/components/ui/FAQList";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { RegionText } from "@/components/market/RegionText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSection } from "./LpSection";

/** The five questions every page answers, collapsed, and one contact line. */
export function LpFaq() {
  const { title, items, contact } = SHARED.faq;

  return (
    <LpSection section="faq" size="narrow" title={title}>
      <FAQList items={items.map((item) => ({ question: item.question, answer: <RegionText raw={item.answer} /> }))} />
      <p className="mt-8 text-base text-[var(--muted-foreground)]">
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
