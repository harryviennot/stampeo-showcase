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
import { CardDesignPlayground } from "@/components/features/design-de-carte/CardDesignPlayground";
import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { ScanDemo } from "@/components/features/scanner-mobile/ScanDemo";
import { QRCodeSkeleton } from "@/components/ui/QRCodeSkeleton";
import { Segmented } from "@/components/ui/Segmented";
import { renderEn } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";

// The gallery is an async server component that asks next-intl for its words.
await mockEnglishServerTranslations();
const { CardStyleGallery } = await import("@/components/features/design-de-carte/CardStyleGallery");

describe("what a component renders when a page's new props are left out (AC15)", () => {
  test("NotificationPhoneDemo: the lock screen with Stampeo's sample stamp notification", () => {
    expect(renderEn(<NotificationPhoneDemo />)).toMatchSnapshot();
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

  test("ScanDemo: the demo with its recording dot", () => {
    expect(renderEn(<ScanDemo />)).toMatchSnapshot();
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
});
