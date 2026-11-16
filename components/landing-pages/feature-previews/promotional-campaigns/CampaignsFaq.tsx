import { MarketLink } from "@/components/market/MarketLink";
import { FAQList } from "@/components/ui/FAQList";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { marketPath } from "@/lib/markets";
import { LpSection } from "../../shared/LpSection";

/** The words in an answer that lead to the pricing page. */
const PRICING_WORDS = "see pricing";

/** An answer as written, with `see pricing` as a link to the US pricing page; its tap area reaches past the line with no change to the text. */
function Answer({ text }: Readonly<{ text: string }>) {
  const at = text.indexOf(PRICING_WORDS);
  if (at === -1) return text;

  return (
    <>
      {text.slice(0, at)}
      <MarketLink
        market="us"
        href={marketPath("us", "/pricing")}
        className="relative font-semibold text-[var(--foreground)] underline underline-offset-4 after:absolute after:-inset-x-1 after:-inset-y-3"
      >
        {PRICING_WORDS}
      </MarketLink>
      {text.slice(at + PRICING_WORDS.length)}
    </>
  );
}

/** The page's own questions as one white table, one answer linking to pricing, and the contact line under it. */
export function CampaignsFaq() {
  const { contact } = SHARED.faq;

  return (
    <LpSection section="faq" size="narrow" title={COPY.faq.title} align="center">
      <FAQList table items={COPY.faq.items.map(({ question, answer }) => ({ question, answer: <Answer text={answer} /> }))} />
      <p className="mt-6 text-center text-base text-[var(--muted-foreground)]">
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
