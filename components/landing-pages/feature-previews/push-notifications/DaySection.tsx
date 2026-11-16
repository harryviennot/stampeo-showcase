import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { NumberStamp } from "@/components/stamps/StampIcons";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { SAMPLE_BUSINESS } from "@/lib/landing-pages/copy/shared";
import type { Banner } from "@/lib/landing-pages/copy/types";
import type { CardDesign } from "@/lib/types/design";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { aurevoDesign } from "../../shared/AurevoCard";
import { LpSection, EYEBROW } from "../../shared/LpSection";
import { AUREVO } from "../../shared/samples";
import { lpBanner } from "../../shared/banner";

type Key = (typeof COPY.day.nodes)[number]["key"];

const TOTAL = AUREVO.design.total_stamps ?? 8;

/** What the card shows at each step: the 5th stamp the banner counts, the full card, a fresh one once the reward is claimed, and the next level's card with its name in the header. */
const AT_STEP: Record<Key, { stamps: number; headerLabel?: string }> = {
  stamp: { stamps: 5 },
  reward: { stamps: TOTAL },
  redeemed: { stamps: 0 },
  level: { stamps: 1, headerLabel: "Silver" },
};

/** The four steps of one customer's card, each with the card as it stands. */
export function dayNodes() {
  return COPY.day.nodes.map((node) => ({ ...node, ...AT_STEP[node.key] }));
}

/** A card is laid out 300px wide and cut at 227px: its header and its stamps, as the Wallet app cuts a card. */
const CARD_LAYOUT = { width: 300, cut: 227 };
/** It is shown 148px wide, and 200px from `lg`. */
const CARD_SHOWN = { narrowTo: 148, to: 200 };
const CARD_CUT = "h-full overflow-hidden rounded-[18px]";

const RAIL =
  "absolute top-[46px] -bottom-2 left-[19px] border-l-[1.5px] border-dashed border-[var(--near-black)]/25 lg:left-1/2 lg:-translate-x-px";

/** A step's number, the site's numbered stamp on a disc of the page's colour so the rail stops at its edge. */
const DOT =
  "absolute top-0 left-0 z-10 flex rounded-full bg-[var(--cream)] lg:static lg:col-start-2 lg:row-start-1 lg:justify-self-center";

function Notification({ banner }: Readonly<{ banner: Banner }>) {
  return (
    <div
      role="img"
      aria-label={`Lock screen notification from ${banner.sender}: ${banner.body}`}
      className="w-full max-w-[420px] text-left lg:ml-auto"
    >
      <div aria-hidden>
        <LockScreenNotification {...lpBanner(banner)} />
      </div>
    </div>
  );
}

function MiniCard({
  design,
  stamps,
  headerLabel,
}: Readonly<{ design: Partial<CardDesign>; stamps: number; headerLabel?: string }>) {
  const name = headerLabel ? ` at ${headerLabel}` : "";

  return (
    <div role="img" aria-label={`${SAMPLE_BUSINESS}'s card${name}, ${stamps} of ${TOTAL} stamps`}>
      <ScaledBox width={CARD_LAYOUT.width} height={CARD_LAYOUT.cut} {...CARD_SHOWN}>
        <div aria-hidden className={CARD_CUT}>
          <ScaledCardWrapper baseWidth={CARD_LAYOUT.width}>
            <WalletCard design={design} stamps={stamps} showQR={false} showSecondaryFields={false} headerLabel={headerLabel} />
          </ScaledCardWrapper>
        </div>
      </ScaledBox>
    </div>
  );
}

/**
 * "A message for every step of the card": one customer's card over four visits on a dashed rail, each step a
 * label, the default banner it sends and the card as it stands then. Down the left on a phone; from `lg` the rail
 * is centred, with the banners on its left and the cards on its right.
 */
export async function DaySection() {
  const design = await aurevoDesign();
  const nodes = dayNodes();

  return (
    <LpSection section="day" eyebrow={COPY.day.eyebrow} title={COPY.day.title} lead={COPY.day.lead} align="center">
      <ol className="mx-auto max-w-[460px] lg:max-w-[960px]">
        {nodes.map((node, index) => (
          <li
            key={node.key}
            className="relative pb-10 pl-14 last:pb-0 lg:grid lg:grid-cols-[1fr_88px_1fr] lg:items-start lg:gap-0 lg:pb-14 lg:pl-0"
          >
            {index < nodes.length - 1 && <span aria-hidden className={RAIL} />}
            <span aria-hidden className={DOT}>
              <NumberStamp number={index + 1} size={40} color="var(--accent)" />
            </span>

            <ScrollReveal variant="right" delay={index * 60} className="lg:col-start-1 lg:row-start-1 lg:pr-4">
              <p className={`${EYEBROW} flex min-h-10 items-center text-[var(--muted-foreground)] lg:justify-end`}>{node.label}</p>
              <div className="mt-1">
                <Notification banner={node.banner} />
              </div>
            </ScrollReveal>

            <div className="mt-4 lg:col-start-3 lg:row-start-1 lg:mt-0 lg:pl-4">
              <MiniCard design={design} stamps={node.stamps} headerLabel={node.headerLabel} />
            </div>
          </li>
        ))}
      </ol>
    </LpSection>
  );
}
