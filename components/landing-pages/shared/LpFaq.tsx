import { MarketLink } from "@/components/market/MarketLink";
import { RegionText } from "@/components/market/RegionText";
import { FAQList } from "@/components/ui/FAQList";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import type { FaqItem } from "@/lib/landing-pages/copy/types";
import { marketPath } from "@/lib/markets";
import { LpSection } from "./LpSection";

/** Words in an answer that lead to a page of the US site. */
export interface AnswerLink {
  words: string;
  href: string;
}

/** The tap area of an inline link reaches past its line without changing the text's layout. */
const INLINE_LINK = "relative font-semibold text-[var(--foreground)] underline underline-offset-4 after:absolute after:-inset-x-1 after:-inset-y-3";

/** An answer with the first `words` as a link; its text around the link is printed through `RegionText` like any other answer. */
function LinkedAnswer({ item, link }: Readonly<{ item: FaqItem; link: AnswerLink }>) {
  const { answer } = item;
  const at = answer.indexOf(link.words);
  if (at === -1) return <RegionText raw={answer} />;

  return (
    <>
      <RegionText raw={answer.slice(0, at)} />
      <MarketLink market="us" href={marketPath("us", link.href)} className={INLINE_LINK}>
        {link.words}
      </MarketLink>
      <RegionText raw={answer.slice(at + link.words.length)} />
    </>
  );
}

/**
 * The five questions every page answers, collapsed, and one contact line. A page that brings its own `faq`
 * gets Platform's look: its title centred, the questions as one white table, and the contact line centred under it;
 * `answerLink` turns the given words in an answer into a link.
 */
export function LpFaq({
  faq,
  answerLink,
}: Readonly<{ faq?: { title: string; items: readonly FaqItem[] }; answerLink?: AnswerLink }>) {
  const { title, items } = faq ?? SHARED.faq;
  const own = faq !== undefined;
  const { contact } = SHARED.faq;

  return (
    <LpSection section="faq" size="narrow" title={title} align={own ? "center" : undefined}>
      <FAQList
        items={items.map((item) => ({
          question: item.question,
          answer: answerLink ? <LinkedAnswer item={item} link={answerLink} /> : <RegionText raw={item.answer} />,
        }))}
        table={own}
      />
      <p className={own ? "mt-6 text-center text-base text-[var(--muted-foreground)]" : "mt-8 text-base text-[var(--muted-foreground)]"}>
        {contact.before}{" "}
        <TrackedLink href="/contact" trackAs="faq_contact" className={INLINE_LINK}>
          {contact.link}
        </TrackedLink>
        . {contact.after}
      </p>
    </LpSection>
  );
}
