/**
 * The notifications preview (`/us/landing-pages/platform/push-notifications`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs, async pieces included; the hero, the headers, the order and
 * the tap targets of all five previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { HowSection } from "@/components/landing-pages/feature-previews/push-notifications/HowSection";
import { LockScreenSlice } from "@/components/landing-pages/feature-previews/push-notifications/LockScreenSlice";
import { OwnIconCard } from "@/components/landing-pages/feature-previews/push-notifications/OwnIconCard";
import { WordingSection } from "@/components/landing-pages/feature-previews/push-notifications/WordingSection";
import { phoneCropClass } from "@/components/landing-pages/shared/PhoneCrop";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { expectInOrder, renderEn, renderEnAsync as render, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { renderAsAsync } from "../../testing/visitor-seams";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "../copy/previews/push-notifications";
import { REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../copy/shared";

// The sections ask next-intl for the Aurevo card's labels.
await mockEnglishServerTranslations();
const { MomentsSection, pushMoments } = await import(
  "@/components/landing-pages/feature-previews/push-notifications/MomentsSection"
);
const { WalletsSection } = await import("@/components/landing-pages/feature-previews/push-notifications/WalletsSection");

describe("how it works: you scan, their phone lights up", () => {
  test("tells the three steps in order", async () => {
    const html = await render(<HowSection />);

    expectInOrder(html, COPY.how.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(html.match(/<li\b/g)).toHaveLength(3);
  });

  test("shows the Scanner app's finished stamp as a still picture, never the video", async () => {
    const html = await render(<HowSection />);

    expect(html).toContain(encodeURIComponent(scannerLoopFiles("en").still).replaceAll("%2F", "/"));
    expect(html).not.toContain("<video");
  });

  test("beside it, the lock screen that stamp lights up: Aurevo's stamp notification, read out as a picture", async () => {
    const html = await render(<HowSection />);

    expect(textOf(html)).toContain(SAMPLE_BUSINESS);
    expect(textOf(html)).toContain(STAMP_BANNER.body);
    expect(html).toMatch(/role="img"[^>]*aria-label="[^"]*lock screen[^"]*Aurevo[^"]*"/i);
  });
});

describe("moments: the right message at every step", () => {
  test("are the three of the copy, each with Aurevo's banner and no plan chip", () => {
    const moments = pushMoments();

    expect(moments.map((moment) => moment.title)).toEqual(COPY.moments.items.map((item) => item.title));
    expect(moments.map((moment) => moment.description)).toEqual(COPY.moments.items.map((item) => item.description));
    expect(moments.map((moment) => moment.banner.title)).toEqual(COPY.moments.items.map((item) => item.banner.body));
    expect(moments.every((moment) => moment.banner.appName === SAMPLE_BUSINESS)).toBe(true);
    expect(moments.every((moment) => moment.planLabel === undefined)).toBe(true);
    expect(new Set(moments.map((moment) => moment.key)).size).toBe(3);
  });

  test("the card on the lock screen counts what the banner says: 5 of 8, then full, then a fresh card once claimed", () => {
    const [stamp, reward, redeemed] = pushMoments();

    expect(STAMP_BANNER.body).toContain("5 of 8");
    expect(stamp.stamps).toBe(5);
    expect(reward.stamps).toBe(AUREVO.design.total_stamps ?? 8);
    expect(REWARD_BANNER.body).toMatch(/unlocked your reward/i);
    expect(redeemed.stamps).toBe(0);
  });

  test("the reward claimed says Reward redeemed. Enjoy!, the default wording of the product", () => {
    expect(pushMoments()[2].banner.title).toBe("Reward redeemed. Enjoy!");
  });

  test("print the three moments, the first one's banner on the phone, over Aurevo's whole card cut at 520px on a phone", async () => {
    const html = await render(await MomentsSection());

    for (const item of COPY.moments.items) expectInOrder(html, [item.title, item.description]);
    expect(textOf(html)).toContain(STAMP_BANNER.body);
    expectInOrder(html, ["Stamps", "5 / 8", "Member", "Sophie", "Reward", "8th free"]);
    expect(html).toContain(phoneCropClass(520));
  });

  test.each([
    ["a reader who asks for less motion", true, 0],
    ["a reader who allows motion", false, 1],
  ])("for %s the moments %s: %i countdown bar(s), still pressable one by one", async (_reader, reducedMotion, bars) => {
    const html = await renderAsAsync({ reducedMotion }, async () => render(await MomentsSection()));

    expect(html.match(/h-\[2px\] rounded-full bg-gray-100/g)?.length ?? 0).toBe(bars);
    expect(html.match(/<button\b/g)).toHaveLength(COPY.moments.items.length);
  });
});

describe("wallets: Apple Wallet and Google Wallet, both", () => {
  const html = () => render(<WalletsSection />);

  test("the iPhone and the Android phone stand side by side at the same 5 of 8 as the banner, with the official badges under them, then the glass cards", async () => {
    const page = await html();
    const badges = page.indexOf('alt="Apple Wallet"');

    expect(badges).toBeGreaterThan(-1);
    expect(page.slice(0, badges).match(/5 \/ 8/g)?.length).toBeGreaterThanOrEqual(2);
    expect(page.indexOf('alt="Google Wallet"')).toBeGreaterThan(badges);
    expect(page.indexOf(COPY.wallets.iphone)).toBeGreaterThan(badges);
  });

  test("three glass cards float over the phones: the stamp banner on iPhone, the reward banner on Android, and the shop's own icon", async () => {
    expectInOrder(await html(), [
      COPY.wallets.iphone,
      STAMP_BANNER.body,
      COPY.wallets.android,
      REWARD_BANNER.body,
      COPY.wallets.icon.title,
      COPY.wallets.icon.line,
    ]);
  });

  test("from lg it is a 960px stage, and on a phone a column that keeps the phones first", async () => {
    const page = await html();

    expect(page).toContain("lg:w-[960px]");
    expect(page).toContain("flex-col");
  });

  test("the icon card shows three icon tiles of different shops, and says every plan can upload or pick one made from its logo", () => {
    const card = renderEn(<OwnIconCard />);

    expect(textOf(card)).toContain(COPY.wallets.icon.line);
    expect(card.match(/data-icon-tile/g)).toHaveLength(3);
    expect(card).toContain("/themes/cafe/cup.png");
    expect(card).toMatch(/role="img"[^>]*aria-label="[^"]*icon[^"]*"/i);
  });
});

describe("wording: ready-made or your own words", () => {
  const html = () => renderEn(<WordingSection />);

  test("offers the two tabs of the copy, Ready-made open first", () => {
    expect(html().match(/role="tab"/g)).toHaveLength(2);
    expect(html()).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Ready-made</);
    expect(textOf(html())).toContain(COPY.wording.tabs.words.label);
  });

  test("each pane has its title and facts, and only the facts that need Growth or Pro carry that chip", () => {
    const text = textOf(html());
    const { ready, words } = COPY.wording.tabs;

    for (const line of [ready.title, ...ready.facts.map((fact) => fact.text), words.title, ...words.facts.map((fact) => fact.text)]) {
      expect(text).toContain(line);
    }
    expect(text.match(/Growth and Pro/g)).toHaveLength(words.facts.length + 1);
  });

  test("the ready-made pane shows the default stamp message, the other your own words with their first name, each on a lock screen", () => {
    const slices = [...html().matchAll(/role="img" aria-label="([^"]*lock screen[^"]*)"/gi)].map((match) => match[1]);

    expect(slices).toHaveLength(2);
    expect(slices[0]).toContain(STAMP_BANNER.body);
    expect(slices[1]).toContain(COPY.wording.tabs.words.banner.body);
  });
});

describe("a lock-screen slice", () => {
  test("is a sample shop's notification on the dark lock screen, read out as one picture: who sent it and what it says", () => {
    const html = renderEn(<LockScreenSlice banner={STAMP_BANNER} />);

    expect(html).toMatch(/^(?:<link[^>]*>)*<div[^>]*role="img"[^>]*aria-label="[^"]*Aurevo[^"]*Stamp collected![^"]*"/);
    expect(textOf(html)).toContain("9:41");
    expect(html).toContain("/themes/cafe/cup.png");
  });

  test("the thumbnail is the notification alone, with no clock", () => {
    const html = renderEn(<LockScreenSlice banner={STAMP_BANNER} size="thumb" />);

    expect(textOf(html)).not.toContain("9:41");
    expect(textOf(html)).toContain(STAMP_BANNER.body);
  });

  test("is never sent by Stampeo", () => {
    expect(renderEn(<LockScreenSlice banner={COPY.wording.tabs.words.banner} />)).not.toMatch(/stampeo/i);
  });
});

describe("what the page leaves out", () => {
  test("no broadcast mention that no plan label qualifies: the page is about the automatic messages", async () => {
    const sections = [await render(<HowSection />), await render(await MomentsSection()), renderEn(<WordingSection />), await render(<WalletsSection />)];

    expect(textOf(sections.join("\n"))).not.toMatch(/broadcast/i);
  });
});
