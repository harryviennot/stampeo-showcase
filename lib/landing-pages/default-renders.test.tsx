/**
 * The site components the landing pages extend render exactly as they did
 * before when a page's new props are left out. Each is rendered with none of
 * them and held to a snapshot, which was checked to be byte for byte what the
 * components rendered before the pages existed. The call-site table in
 * `shared-sections.test.ts` says no existing page passes the new props.
 */

import { describe, expect, test } from "bun:test";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { NotificationSequenceDemo } from "@/components/features/notifications-push/NotificationSequenceDemo";
import { CardDesignPlayground } from "@/components/features/design-de-carte/CardDesignPlayground";
import { CompactPlayground } from "@/components/features/design-de-carte/CompactPlayground";
import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { AnnotatedWalletCard } from "@/components/features/design-de-carte/AnnotatedWalletCard";
import { IconLibrarySection } from "@/components/features/design-de-carte/IconLibrarySection";
import { DeliverAnalytics } from "@/components/landing-pages/platform/DeliverAnalytics";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { NumberFigures } from "@/components/landing-pages/platform/NumberFigures";
import { PlatformToggleCard } from "@/components/landing-pages/platform/PlatformToggleCard";
import { ProgramTypeRows } from "@/components/landing-pages/platform/ProgramTypeRows";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { FAQList } from "@/components/ui/FAQList";
import { QRCodeSkeleton } from "@/components/ui/QRCodeSkeleton";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { Segmented } from "@/components/ui/Segmented";
import { renderEn, renderEnAsync } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";

// The gallery is an async server component that asks next-intl for its words.
await mockEnglishServerTranslations();
const { CardStyleGallery } = await import("@/components/features/design-de-carte/CardStyleGallery");
const { HowTable } = await import("@/components/landing-pages/platform/HowTable");
const { PlatformHero } = await import("@/components/landing-pages/platform/PlatformHero");

const FAQ_ITEMS = [
  { question: "Can I use my own stamp icons?", answer: "Yes, import any image." },
  { question: "Can I change the style later?", answer: "Anytime." },
];

describe("what a component renders when a page's new props are left out (AC15)", () => {
  test("NotificationPhoneDemo: the lock screen with Stampeo's sample stamp notification", () => {
    expect(renderEn(<NotificationPhoneDemo />)).toMatchSnapshot();
  });

  test("NotificationSequenceDemo: the three Stampeo moments, the first one's banner on the phone", () => {
    expect(renderEn(<NotificationSequenceDemo />)).toMatchSnapshot();
  });

  test("NotificationBanner: the orange bell, with no icon passed", () => {
    expect(renderEn(<NotificationBanner appName="Stampeo" title="Stamp collected" body="You have 5 of 8 stamps." />)).toMatchSnapshot();
  });

  test("QRCodeSkeleton: the squares pulse in a wave", () => {
    const html = renderEn(<QRCodeSkeleton />);

    expect(html).toContain("qr-wave 900ms ease-in-out infinite");
    expect(html).toMatchSnapshot();
  });

  test("CardStyleGallery: the section with its heading and its Start Free block", async () => {
    expect(renderEn(await CardStyleGallery({}))).toMatchSnapshot();
  });

  test("LiveActivityFeed: the feed as a section with its heading", () => {
    expect(renderEn(<LiveActivityFeed />)).toMatchSnapshot();
  });

  test("Segmented: tabs with the compact padding, px-3 py-1.5 text-sm", () => {
    const html = renderEn(
      <Segmented
        options={[
          { value: "a", label: "Stamps" },
          { value: "b", label: "Points" },
        ]}
        value="a"
        onChange={() => {}}
        ariaLabel="Program"
      />,
    );

    expect(html).toContain("flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors");
    expect(html).toMatchSnapshot();
  });

  test("CardDesignPlayground: the full playground section", () => {
    expect(renderEn(<CardDesignPlayground />)).toMatchSnapshot();
  });

  test("CompactPlayground: the program toggle and the stamps slider at their compact size", () => {
    expect(renderEn(<CompactPlayground />)).toMatchSnapshot();
  });

  test("AnnotatedWalletCard: the anatomy section with its own heading and band", () => {
    expect(renderEn(<AnnotatedWalletCard />)).toMatchSnapshot();
  });

  test("IconLibrarySection: the section with its heading and the two marquee rows", () => {
    expect(renderEn(<IconLibrarySection />)).toMatchSnapshot();
  });

  test("ScannerLoop: the first frame in a phone, 280px wide", () => {
    expect(renderEn(<ScannerLoop />)).toMatchSnapshot();
  });

  test("FAQList: the inked cards, the first one open, as the card design and broadcasts pages use it", () => {
    expect(renderEn(<FAQList items={FAQ_ITEMS} defaultOpenCount={1} />)).toMatchSnapshot();
  });

  test("FAQList: every card closed, as the homepage variant and the comparison pages use it", () => {
    expect(renderEn(<FAQList items={FAQ_ITEMS} />)).toMatchSnapshot();
  });
});

describe("what Platform's own pieces render when the previews' new props are left out (AC2)", () => {
  test("LpCtaPair: the trial, and Try it on your phone as an anchor to #demo", () => {
    expect(renderEn(<LpCtaPair location="hero" />, { us: true })).toMatchSnapshot();
  });

  test("LpAccentBand: the cream card with Platform's headline", () => {
    expect(renderEn(<LpAccentBand />, { us: true })).toMatchSnapshot();
  });

  test("NumberFigures: the handwritten figures, with no source line", () => {
    const items = [
      { value: "120+", label: "businesses" },
      { value: "25+", label: "countries" },
      { value: "4", label: "languages" },
    ];

    expect(renderEn(<NumberFigures items={items} />)).toMatchSnapshot();
  });

  test("HowTable: the card and the scanner behind the three-step table, and the link to the demo", async () => {
    expect(await renderEnAsync(<HowTable />)).toMatchSnapshot();
  });

  test("PlatformHero: the headline, the stack of nine wallet cards, then the trial and demo buttons, with no label or sub", async () => {
    expect(await renderEnAsync(<PlatformHero />)).toMatchSnapshot();
  });

  test("LpFaq: the five shared questions and the contact line", () => {
    expect(renderEn(<LpFaq />, { us: true })).toMatchSnapshot();
  });

  test("DeliverAnalytics: the two tiles and the weekly chart", () => {
    expect(renderEn(<DeliverAnalytics />)).toMatchSnapshot();
  });

  test("PlatformToggleCard: the dashboard and scanner panes in one white card", () => {
    expect(renderEn(<PlatformToggleCard dashboard={<i>dashboard pictures</i>} scanner={<i>scanner phone</i>} />)).toMatchSnapshot();
  });

  test("ProgramTypeRows: every row open, the guide link under them", () => {
    expect(
      renderEn(<ProgramTypeRows visuals={{ stamps: <i>stamps card</i>, points: <i>points card</i>, levels: <i>levels cards</i> }} />),
    ).toMatchSnapshot();
  });
});
