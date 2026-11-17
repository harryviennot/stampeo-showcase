import { MegaphoneIcon, PhoneIcon, XMarkIcon } from "@/components/icons";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Fact } from "@/lib/landing-pages/copy/types";
import { CARD_SHADOW, CELL_TITLE } from "../../platform/classes";
import { FactList } from "../../shared/FactList";
import { IconTile } from "../../shared/IconTile";
import { LpSection } from "../../shared/LpSection";

const CARD = `rounded-[28px] bg-white p-6 ${CARD_SHADOW} ring-1 lg:p-8`;

/** What texting costs you, each line under a grey cross. */
function Drawbacks({ facts }: Readonly<{ facts: readonly Fact[] }>) {
  return (
    <ul className="flex flex-col gap-3">
      {facts.map((fact) => (
        <li key={fact.text} className="flex items-start gap-3 text-base text-[var(--foreground)]">
          <XMarkIcon size={20} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
          <span className="min-w-0 flex-1 text-pretty">{fact.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Texts against Stampeo campaigns: two white cards, the texting costs on the left and what a campaign does on the right. */
export function TextingSection() {
  const COPY = useLandingCopy().previews.promotionalCampaigns.PROMOTIONAL_CAMPAIGNS_PREVIEW;
  const { sms, stampeo } = COPY.texting;

  return (
    <LpSection
      section="texting"
      eyebrow={COPY.texting.eyebrow}
      title={COPY.texting.title}
      lead={COPY.texting.lead}
      align="center"
    >
      <div className="mx-auto grid max-w-[880px] gap-4 text-left lg:grid-cols-2 lg:gap-6">
        <div className={`${CARD} ring-black/5`}>
          <IconTile tone="subtle">
            <PhoneIcon size={22} weight="duotone" aria-hidden />
          </IconTile>
          <h3 className={`${CELL_TITLE} mt-5`}>{sms.title}</h3>
          <div className="mt-6">
            <Drawbacks facts={sms.facts} />
          </div>
        </div>

        <div className={`${CARD} ring-[var(--accent)]/30`}>
          <IconTile tone="brand">
            <MegaphoneIcon size={22} weight="duotone" aria-hidden />
          </IconTile>
          <h3 className={`${CELL_TITLE} mt-5`}>{stampeo.title}</h3>
          <FactList facts={stampeo.facts} className="mt-6" />
        </div>
      </div>
    </LpSection>
  );
}
