import type { ReactNode } from "react";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { NumberStamp } from "@/components/stamps/StampIcons";
import { QRCodeSkeleton } from "@/components/ui/QRCodeSkeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { SAMPLE_BUSINESS, STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { walletBadges } from "@/lib/store-badges";
import { AUREVO, AurevoCard } from "../shared/AurevoCard";
import { LpSection } from "../shared/LpSection";

const CARD_WIDTH = 200;

/** Step 1: the Aurevo card, as the owner designs it. */
function CardVisual() {
  return <AurevoCard stamps={4} width={CARD_WIDTH} />;
}

/**
 * Step 2: the counter placard customers scan. Its QR is the still skeleton, not
 * a code: the only scannable code on a page is the live demo's.
 */
function PlacardVisual() {
  const badges = walletBadges("en");

  return (
    <div className="flex w-[220px] flex-col items-center gap-4 rounded-xl bg-white p-4 shadow-md ring-1 ring-black/5">
      {/* The logo is white, drawn for the brown of the card: it sits on the brand panel with the QR. */}
      <div
        className="flex flex-col items-center gap-3 rounded-xl px-6 py-4"
        style={{ backgroundColor: AUREVO.design.background_color }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AUREVO.design.logo_url} alt={SAMPLE_BUSINESS} className="h-7 w-auto" />
        <QRCodeSkeleton size={96} animated={false} />
      </div>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badges.apple} alt="Apple Wallet" className="h-8 w-auto" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badges.google} alt="Google Wallet" className="h-8 w-auto" />
      </div>
    </div>
  );
}

/** Step 3: the card at 5 of 8 with the default stamp notification dropping over it. */
function StampedVisual() {
  return (
    <div className="relative">
      <AurevoCard stamps={5} width={CARD_WIDTH} />
      <div className="absolute inset-x-[-24px] bottom-[-18px] z-10">
        {/* The sender is the business the card belongs to; the message is Stampeo's default. */}
        <NotificationBanner appName={STAMP_BANNER.sender} title={STAMP_BANNER.body} body="" />
      </div>
    </div>
  );
}

const VISUALS: ReactNode[] = [<CardVisual key="card" />, <PlacardVisual key="placard" />, <StampedVisual key="stamped" />];

/**
 * How-to's three steps on the page's one tinted band: a number, a title and a
 * line each, then the step's picture (on desktop the picture sits above its
 * text), and the "all you need" line that closes the band.
 */
export function HowSteps() {
  const { title, lead, items, allYouNeed } = HOW_IT_WORKS.steps;

  return (
    <LpSection section="steps" tinted title={title} lead={lead}>
      <ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
        {items.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-6 lg:flex-col-reverse lg:justify-end">
            <div className="flex items-start gap-4">
              <NumberStamp number={index + 1} size={40} className="shrink-0" />
              <div>
                <h3 className="text-h3">{step.title}</h3>
                <p className="mt-1 text-base text-[var(--muted-foreground)]">{step.body}</p>
              </div>
            </div>
            <div className="flex h-[300px] items-center justify-center rounded-2xl bg-[var(--cream)] p-4 card-stamp">
              {VISUALS[index]}
            </div>
          </li>
        ))}
      </ol>
      <ScrollReveal delay={120}>
        <p className="mt-12 text-balance text-center text-base font-semibold text-[var(--foreground)]">{allYouNeed}</p>
      </ScrollReveal>
    </LpSection>
  );
}
