/**
 * The notifications preview (`/us/landing-pages/platform/push-notifications`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs, async pieces included; the headers, the order and the tap
 * targets of all six previews are in `pages.test.tsx`, and the typing of the
 * wording editor is in `wording-editor.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { LockScreenSlice } from "@/components/landing-pages/feature-previews/push-notifications/LockScreenSlice";
import { OwnIconCard } from "@/components/landing-pages/feature-previews/push-notifications/OwnIconCard";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { sectionOf } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEn, renderEnAsync as render, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "../copy/previews/push-notifications";
import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, SHARED, STAMP_BANNER } from "../copy/shared";

// The sections ask next-intl for the Aurevo card's labels.
await mockEnglishServerTranslations();
const { DaySection, dayNodes } = await import("@/components/landing-pages/feature-previews/push-notifications/DaySection");
const { EditorSection } = await import("@/components/landing-pages/feature-previews/push-notifications/EditorSection");
const { WalletsSection } = await import("@/components/landing-pages/feature-previews/push-notifications/WalletsSection");

const PAGE = "platform/push-notifications";
const section = (id: string) => sectionOf(PAGE, id);

describe("hero: what push notifications are, with one lock screen beside it", () => {
  test("says it in plain words: the headline, its sub, the trial keycap and the way to the demo", async () => {
    const hero = await section("hero");

    expectInOrder(hero, ["Push notifications", "for your loyalty card.", "Each stamp and reward sends an automatic notification to your customer's lock screen.", SHARED.cta, SHARED.demoLink]);
    expect(hero.match(/<a [^>]*href="\/en\/onboarding"[^>]*>/)?.[0]).toMatch(/class="[^"]*\bkeycap\b/);
    expect(hero).toContain('href="#demo"');
  });

  test("the phone is one picture, an iPhone lock screen with Aurevo's stamp notification, and nothing else is on it", async () => {
    const hero = await section("hero");

    expect(pictures(hero)).toEqual([COPY.hero.alt]);
    expect(COPY.hero.alt).toContain(STAMP_BANNER.body);
    expect(textOf(hero).split(STAMP_BANNER.body)).toHaveLength(2);
    expect(textOf(hero)).toContain(SAMPLE_BUSINESS);
    expect(textOf(hero)).not.toContain(REWARD_BANNER.body);
  });
});

describe("day: a notification each time their card changes", () => {
  const html = () => render(<DaySection />);

  test("is four steps of one customer's card, each with its label, the card as it stands, then Aurevo's notification", async () => {
    const page = await html();

    expect(page.match(/<li\b/g)).toHaveLength(4);
    expectInOrder(
      page,
      COPY.day.nodes.flatMap((node, index) => [node.label, `${dayNodes()[index].stamps} / 8`, SAMPLE_BUSINESS, node.banner.body]),
    );
  });

  test("the notifications are the product's defaults: stamp collected, reward unlocked, reward redeemed, moved up a level", () => {
    expect(COPY.day.nodes.map((node) => node.banner.body)).toEqual([
      STAMP_BANNER.body,
      REWARD_BANNER.body,
      "Reward redeemed. Enjoy!",
      LEVEL_UP_BANNER.body,
    ]);
    expect(COPY.day.nodes.every((node) => node.banner.sender === SAMPLE_BUSINESS)).toBe(true);
  });

  test("the card has the count its notification announces: 5 of 8, full, claimed and fresh, then a Silver card", () => {
    const nodes = dayNodes();
    const total = AUREVO.design.total_stamps ?? 8;

    expect(STAMP_BANNER.body).toContain(`5 of ${total}`);
    expect(nodes.map((node) => node.stamps)).toEqual([5, total, 0, 1]);
    expect(nodes.map((node) => node.headerLabel)).toEqual([undefined, undefined, undefined, "Silver"]);
    expect(LEVEL_UP_BANNER.body).toContain("Silver");
  });

  test("each card is drawn with its own count, and the last wears Silver in its header", async () => {
    expectInOrder(await html(), ["5 / 8", "8 / 8", "0 / 8", "Silver", "1 / 8"]);
  });

  test("every card and every notification is read out as a picture, the card first: the copy's own name for the card, then who sent the message and what it says", async () => {
    const names = pictures(await html());

    expect(names).toHaveLength(8);
    COPY.day.nodes.forEach((node, index) => {
      expect(names[2 * index]).toBe(node.cardAlt);
      expect(names[2 * index + 1]).toContain(SAMPLE_BUSINESS);
      expect(names[2 * index + 1]).toContain(node.banner.body);
    });
  });
});

describe("wallets: push notifications on iPhone and Android", () => {
  const html = () => render(<WalletsSection />);

  test("the iPhone and the Android phone stand side by side at the same 5 of 8 as the notification, each read out as the copy says, with the official badges under them", async () => {
    const page = await html();
    const badges = page.indexOf('alt="Apple Wallet"');

    expect(pictures(page)).toEqual(expect.arrayContaining([COPY.wallets.phoneAlts.apple, COPY.wallets.phoneAlts.google]));
    expect(badges).toBeGreaterThan(-1);
    expect(page.slice(0, badges).match(/5 \/ 8/g)?.length).toBeGreaterThanOrEqual(2);
    expect(page.indexOf('alt="Google Wallet"')).toBeGreaterThan(badges);
  });

  test("three clean cards float over the phones: the stamp notification on iPhone, the reward notification on Android, and the shop's own icon", async () => {
    const page = await html();

    expectInOrder(page, [
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

  test("the icon card shows three icon tiles of different shops, and says a shop can upload one or pick one made from its logo", () => {
    const card = renderEn(<OwnIconCard />);

    expect(textOf(card)).toContain("Upload an icon, or pick one made from your logo.");
    expect(card.match(/data-icon-tile/g)).toHaveLength(3);
    expect(card).toContain("/themes/cafe/cup.png");
    expect(card).toMatch(/role="img"[^>]*aria-label="[^"]*icon[^"]*"/i);
  });
});

describe("editor: use our wording or write your own", () => {
  const html = () => renderEn(<EditorSection />);
  const { toggle, ready, switches } = COPY.editor;

  test("opens on the ready-made message: the control's two choices, Ready-made selected and Your words one tap away", () => {
    expect(html().match(/role="tab"/g)).toHaveLength(2);
    expect(html()).toMatch(new RegExp(`role="tab"[^>]*aria-selected="true"[^>]*>${toggle.ready}<`));
    expect(html()).toMatch(new RegExp(`role="tab"[^>]*aria-selected="false"[^>]*>${toggle.own}<`));
    expect(html()).toContain(`aria-label="${toggle.label}"`);
  });

  test("the message sits in a read-only field the dashboard's way, and the same words are on the lock screen beside it, from Aurevo", () => {
    const page = html();
    const field = /<div[^>]*role="textbox"[^>]*>([\s\S]*?)<\/div>/.exec(page);

    expect(field?.[0]).toMatch(/aria-readonly="true"/);
    expect(field?.[0]).toContain(`aria-label="${COPY.editor.messageLabel}"`);
    expect(textOf(field?.[1] ?? "")).toContain(ready.text);
    expectInOrder(page, [COPY.editor.messageLabel, COPY.editor.previewLabel, SAMPLE_BUSINESS, ready.text]);
    expect(pictures(page).filter((name) => /lock screen/i.test(name))).toEqual([
      `Lock screen notification from ${SAMPLE_BUSINESS}: ${ready.text}`,
    ]);
  });

  test("says what it is in the copy's words, with the choice unlabelled", () => {
    expectInOrder(html(), ["Your wording", "Use our wording or write your own.", "Every message comes ready to send. Switch any off, or rewrite it in your words."]);
    expect(textOf(html())).not.toContain("{first name}");
    expect(textOf(html())).not.toContain("Sophie");
  });

  test("three message switches follow, all on, named as the dashboard names its messages", () => {
    const rows = [...html().matchAll(/<button[^>]*role="switch"[^>]*>([\s\S]*?)<\/button>/g)];

    expect(rows.map((row) => textOf(row[1]).replaceAll("|", ""))).toEqual([...switches]);
    for (const [row] of rows) {
      expect(row).toContain('aria-checked="true"');
      expect(row).toContain("min-h-14");
    }
  });

  test("the choice between the two wordings is a 44px control", () => {
    expect(html()).toMatch(/role="tab"[^>]*class="[^"]*\bh-11\b/);
  });
});

describe("a lock-screen slice", () => {
  test("is a sample shop's notification on the lock screen, read out as one picture: who sent it and what it says", () => {
    const html = renderEn(<LockScreenSlice banner={STAMP_BANNER} />);

    expect(html).toMatch(/^(?:<link[^>]*>)*<div[^>]*role="img"[^>]*aria-label="[^"]*Aurevo[^"]*Stamp collected![^"]*"/);
    expect(textOf(html)).toContain("9:41");
    expect(html).toContain("/themes/cafe/cup.png");
  });

  test("reads out the words it is given to read, when the ones on screen are still being typed", () => {
    const html = renderEn(<LockScreenSlice banner={{ sender: SAMPLE_BUSINESS, body: "You got" }} label={COPY.editor.own.preview} />);

    expect(html).toContain(`aria-label="Lock screen notification from Aurevo: ${COPY.editor.own.preview}"`);
    expect(textOf(html)).toContain("You got");
  });

  test("is never sent by Stampeo", () => {
    expect(renderEn(<LockScreenSlice banner={STAMP_BANNER} />)).not.toMatch(/stampeo/i);
  });
});

describe("the shop's notification icon", () => {
  test("a notification from the sample café carries its name, its message and its own tile: the cup on the card colour", () => {
    const props = shopBanner(STAMP_BANNER);
    const tile = renderEn(<>{props.icon}</>);

    expect(props.appName).toBe(SAMPLE_BUSINESS);
    expect(props.appName).not.toMatch(/stampeo/i);
    expect(props.title).toBe(STAMP_BANNER.body);
    expect(tile).toContain(AUREVO.design.background_color);
    expect(tile).toContain("/themes/cafe/cup.png");
  });
});

describe("demo: try it on your own phone", () => {
  test("is the live demo under its own label, title and lead, centred, with no trial button to tap instead of it", async () => {
    const demo = await section("demo");

    expectInOrder(demo, ["Live demo", "Try it on your own phone.", "Add a sample card to your wallet, add a stamp, and get the notification yourself."]);
    expect(demo).not.toContain(SHARED.cta);
    expect(demo).toContain("text-center");
    expect(demo).toContain('id="demo"');
  });
});

describe("the closing card", () => {
  test("says every stamp lands on the lock screen, and that customers install nothing", async () => {
    expectInOrder(await section("final_cta"), ["Every stamp,", "on their lock screen.", "Notifications start with your first stamp. Your customers install nothing.", SHARED.cta]);
  });
});
