/**
 * Platform's "In their wallet" section: an iPhone with the Aurevo card in
 * Apple Wallet, an Android phone with the same card in Google Wallet, three
 * floating cards (our analytics, a lock-screen notification, the update on a
 * scan) and the official badges. The phones are async server components and
 * are read as source; the cards and the Google Wallet pass are rendered.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { GoogleWalletCard } from "@/components/card/GoogleWalletCard";
import { ANALYTICS, DeliverAnalytics } from "@/components/landing-pages/platform/DeliverAnalytics";
import { GlassCard } from "@/components/landing-pages/platform/GlassCard";
import { LockScreenNotification } from "@/components/landing-pages/platform/LockScreenNotification";
import { lpBanner } from "@/components/landing-pages/shared/banner";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { code, openingTags } from "../testing/jsx-source";
import { COMPONENTS_DIR, shared } from "../testing/landing-pages-source";
import { renderEn, textOf } from "../testing/render-en";
import { SHARED, STAMP_BANNER } from "./copy/shared";

const deliver = () => code(join(COMPONENTS_DIR, "platform", "DeliverComposition.tsx"));

describe("the floating cards", () => {
  /** Each card the section places: its title and the props it passes besides. */
  const cards = () =>
    openingTags(deliver())
      .filter((tag) => tag.name === "GlassCard")
      .map((tag) => ({
        title: /title=\{([^}]*)\}/.exec(tag.attrs)?.[1].trim(),
        props: tag.attrs
          .replace(/"[^"]*"|\{[^}]*\}/g, "")
          .split(/[\s=]+/)
          .filter(Boolean)
          .sort(),
      }));

  test("are titled from the copy, and all three take the same props: one look, placed apart", () => {
    expect(cards().map((card) => card.title).sort()).toEqual(
      ["PLATFORM.deliver.analyticsLabel", "PLATFORM.deliver.notificationsLabel", "PLATFORM.deliver.updatesLabel"].sort(),
    );
    for (const card of cards()) expect(card.props).toEqual(["className", "float", "title"]);
  });

  test("every card's title is the same large heading under the section's, left-aligned", () => {
    const titles = ["Analytics", "Lock-screen notifications", "Updates on every scan"].map((title) =>
      renderEn(<GlassCard title={title} />).replace(title, "TITLE"),
    );

    expect(titles[0]).toMatch(/<h3[^>]*>TITLE<\/h3>/);
    expect(new Set(titles).size).toBe(1);
    expect(titles[0]).not.toContain("text-center");
  });
});

describe("the analytics card: our own every-plan analytics, not a capture", () => {
  const text = () => textOf(renderEn(<DeliverAnalytics />));

  test("shows the visits with their trend, the 30-day return rate and the visits over time, as the dashboard words them", () => {
    for (const line of ["Visits", "2,770", "▲17%", "30-day return rate", "61%", "▲2 pts", "Visits over time", "Returning", "First visit"]) {
      expect(text()).toContain(line);
    }
  });

  test("the weeks of the chart add up to the visits on the tile, 83% of them returning, as in the dashboard capture", () => {
    const visits = ANALYTICS.weeks.reduce((sum, week) => sum + week.returning + week.first, 0);
    const returning = ANALYTICS.weeks.reduce((sum, week) => sum + week.returning, 0);

    expect(visits).toBe(ANALYTICS.visits.total);
    expect(Math.round((100 * returning) / visits)).toBe(83);
    expect(renderEn(<DeliverAnalytics />).match(/data-week=/g)).toHaveLength(ANALYTICS.weeks.length);
  });

  test("names nothing that only Growth and Pro have, and is read out as one picture", () => {
    const html = renderEn(<DeliverAnalytics />);

    expect(text()).not.toMatch(/busiest|quietest|cohort|spend/i);
    expect(html).toMatch(/^<div[^>]*role="img"[^>]*aria-label="[^"]*2,770 visits[^"]*61%[^"]*"/);
  });

  test("the section draws no dashboard capture and prints no sample-data caption (Harry: a landing page doesn't need the detail)", () => {
    expect(deliver()).not.toMatch(/landingShot\(|<Image\b|SHARED\.sampleData/);
    expect(textOf(renderEn(<DeliverAnalytics />))).not.toContain(SHARED.sampleData);
  });
});

describe("the notification card", () => {
  test("is Aurevo's stamp notification, as iOS shows it: its icon, its name, the time, then the message", () => {
    const html = renderEn(<LockScreenNotification {...lpBanner(STAMP_BANNER)} />);
    const at = ["/themes/cafe/cup.png", ">Aurevo<", ">now<", STAMP_BANNER.body].map((needle) => html.indexOf(needle));

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(deliver()).toContain("<LockScreenNotification {...lpBanner(STAMP_BANNER)}");
  });
});

describe("the phones: Apple Wallet on the iPhone, Google Wallet on the Android phone", () => {
  test("the iPhone and the Android phone stand side by side, with the official badges under them", () => {
    const source = deliver();
    const order = ["<WalletPhone", "<GoogleWalletPhone", "<WalletBadges"].map((needle) => source.indexOf(needle));

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(source).not.toContain("<NotificationPhoneDemo");
  });

  test("the Android phone shows Aurevo's card in Google Wallet, at the same stamps as the iPhone", () => {
    const phone = code(shared("GoogleWalletPhone"));
    const stamps = (source: string, tag: string) =>
      /stamps=\{(\d+)\}/.exec(openingTags(source).find((t) => t.name === tag)?.attrs ?? "")?.[1];

    expect(phone).toContain("<AndroidPhone");
    expect(phone).toContain("<GoogleWalletCard");
    expect(phone).toContain("aurevoDesign()");
    expect(stamps(deliver(), "GoogleWalletPhone")).toBe(stamps(deliver(), "WalletPhone"));
  });
});

describe("the Google Wallet pass", () => {
  const design = {
    ...AUREVO.design,
    secondary_fields: [
      { key: "member", label: "Member", value: "Sophie" },
      { key: "reward", label: "Reward", value: "8th free" },
    ],
  };

  test("reads top to bottom as Google Wallet lays out a loyalty pass: the business, the title, the stamps, the fields, the code", () => {
    const html = renderEn(<GoogleWalletCard design={design} organizationName="Aurevo" stamps={5} />);
    const text = textOf(html);
    const at = ["Aurevo", "Loyalty Card", "Stamps", "5 / 8", "Member", "Sophie", "8th free"].map((line) => text.indexOf(line));

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(html.indexOf("<svg")).toBeGreaterThan(html.indexOf("8th free"));
  });

  test("keeps room for its stamps from the first paint, so the pass never grows once the page wakes up", () => {
    const html = renderEn(<GoogleWalletCard design={design} stamps={5} />);

    expect(html).toMatch(/aspect-ratio:3\.07/);
  });

  test("a points pass shows its balance where a stamp pass shows its stamps", () => {
    const text = textOf(renderEn(<GoogleWalletCard design={{ ...design, card_type: "points" }} pointsBalance={240} />));

    expect(text).toContain("Points");
    expect(text).toContain("240");
    expect(text).not.toContain("5 / 8");
  });
});

