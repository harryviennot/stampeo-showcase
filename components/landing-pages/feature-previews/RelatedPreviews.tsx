import type { ComponentType } from "react";
import {
  ArrowRightIcon,
  BellIcon,
  ChartIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  MegaphoneIcon,
  PaletteIcon,
} from "@/components/icons";
import { MarketLink } from "@/components/market/MarketLink";
import { PREVIEW_SHARED } from "@/lib/landing-pages/copy/previews/shared";
import { LANDING_PAGES, type PreviewSlug } from "@/lib/landing-pages/pages";
import { marketPath } from "@/lib/markets";
import { IconTile } from "../shared/IconTile";
import { LpSection } from "../shared/LpSection";

type Card = keyof typeof PREVIEW_SHARED.related.cards;

/** Each preview's card in the shared copy, and the icon on its tile. */
const CARDS: Record<PreviewSlug, { card: Card; Icon: ComponentType<{ size?: number; weight?: "duotone"; "aria-hidden"?: boolean }> }> = {
  "platform/card-design": { card: "cardDesign", Icon: PaletteIcon },
  "platform/mobile-scanner": { card: "mobileScanner", Icon: DevicePhoneMobileIcon },
  "platform/push-notifications": { card: "pushNotifications", Icon: BellIcon },
  "platform/analytics": { card: "analytics", Icon: ChartIcon },
  "platform/promotional-campaigns": { card: "promotionalCampaigns", Icon: MegaphoneIcon },
  "platform/geolocation": { card: "geolocation", Icon: MapPinIcon },
};

/**
 * The links a feature preview closes with: its three siblings (from the
 * registry) as white cards, each wholly a tap target at
 * least 56px tall. They lead to the previews, not to the live feature pages, so
 * the set can be walked. A page can set its own `title`; there is no label above it.
 */
export function RelatedPreviews({ slug, title }: Readonly<{ slug: PreviewSlug; title?: string }>) {
  const { title: shared, cards } = PREVIEW_SHARED.related;

  return (
    <LpSection section="related" title={title ?? shared} align="center">
      <ul className="mx-auto grid max-w-[1040px] gap-3 lg:grid-cols-3 lg:gap-4">
        {(LANDING_PAGES[slug].related ?? []).map((sibling) => {
          const { card, Icon } = CARDS[sibling];

          return (
            <li key={sibling}>
              <MarketLink
                market="us"
                href={marketPath("us", `/landing-pages/${sibling}`)}
                className="group flex min-h-14 items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_4px_rgba(25,18,16,0.04),0_16px_40px_-24px_rgba(25,18,16,0.18)] ring-1 ring-black/5 transition-shadow hover:shadow-[0_2px_4px_rgba(25,18,16,0.06),0_24px_48px_-24px_rgba(25,18,16,0.26)]"
              >
                <IconTile tone="subtle">
                  <Icon size={22} weight="duotone" aria-hidden />
                </IconTile>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-[var(--foreground)]">{cards[card].title}</span>
                  <span className="block text-sm text-pretty text-[var(--muted-foreground)]">{cards[card].line}</span>
                </span>
                <ArrowRightIcon
                  size={18}
                  weight="bold"
                  aria-hidden
                  className="shrink-0 text-[var(--accent-hover)] transition-transform group-hover:translate-x-0.5"
                />
              </MarketLink>
            </li>
          );
        })}
      </ul>
    </LpSection>
  );
}
