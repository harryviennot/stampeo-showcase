/**
 * The notifications preview (`/us/landing-pages/platform/push-notifications`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs, async pieces included; the hero, the headers, the order and
 * the tap targets of all six previews are in `pages.test.tsx`, and the typing of
 * the wording editor is in `../wording-editor.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { LockScreenSlice } from "@/components/landing-pages/feature-previews/push-notifications/LockScreenSlice";
import { OwnIconCard } from "@/components/landing-pages/feature-previews/push-notifications/OwnIconCard";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { expectInOrder, pictures, renderEn, renderEnAsync as render, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "../copy/previews/push-notifications";
import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../copy/shared";

// The sections ask next-intl for the Aurevo card's labels.
await mockEnglishServerTranslations();
const { DaySection, dayNodes } = await import("@/components/landing-pages/feature-previews/push-notifications/DaySection");
const { EditorSection } = await import("@/components/landing-pages/feature-previews/push-notifications/EditorSection");
const { WalletsSection } = await import("@/components/landing-pages/feature-previews/push-notifications/WalletsSection");

describe("day: a message for every step of the card", () => {
  const html = () => render(<DaySection />);

  test("is four steps of one customer's card, in the copy's order, each with its label, Aurevo's banner and the card", async () => {
    const page = await html();

    expect(page.match(/<li\b/g)).toHaveLength(4);
    expectInOrder(
      page,
      COPY.day.nodes.flatMap((node) => [node.label, SAMPLE_BUSINESS, node.banner.body]),
    );
  });

  test("the banners are the product's defaults: stamp collected, reward unlocked, reward redeemed, moved up a level", () => {
    expect(COPY.day.nodes.map((node) => node.banner.body)).toEqual([
      STAMP_BANNER.body,
      REWARD_BANNER.body,
      "Reward redeemed. Enjoy!",
      LEVEL_UP_BANNER.body,
    ]);
    expect(COPY.day.nodes.every((node) => node.banner.sender === SAMPLE_BUSINESS)).toBe(true);
  });

  test("the card beside each banner has the count it announces: 5 of 8, full, claimed and fresh, then a Silver card", () => {
    const nodes = dayNodes();
    const total = AUREVO.design.total_stamps ?? 8;

    expect(STAMP_BANNER.body).toContain(`5 of ${total}`);
    expect(nodes.map((node) => node.stamps)).toEqual([5, total, 0, 1]);
    expect(nodes.map((node) => node.headerLabel)).toEqual([undefined, undefined, undefined, "Silver"]);
    expect(LEVEL_UP_BANNER.body).toContain("Silver");
  });

  test("each card is drawn with its own count, and the last wears Silver in its header", async () => {
    const page = await html();

    expectInOrder(page, ["5 / 8", "8 / 8", "0 / 8", "Silver", "1 / 8"]);
  });

  test("every banner and every card is read out as a picture that names the shop and the moment", async () => {
    const names = pictures(await html());

    expect(names).toHaveLength(8);
    COPY.day.nodes.forEach((node, index) => {
      expect(names[2 * index]).toContain(SAMPLE_BUSINESS);
      expect(names[2 * index]).toContain(node.banner.body);
      expect(names[2 * index + 1]).toContain(`${SAMPLE_BUSINESS}'s card`);
    });
    expect(names[1]).toContain("5 of 8");
    expect(names[7]).toContain("Silver");
  });

  test("wallet cards are never framed in ink, and nothing here is labelled with a plan", async () => {
    const page = await html();

    expect(page).not.toContain("card-stamp");
    expect(textOf(page)).not.toMatch(/Every plan|Growth and Pro|Pro\b/);
  });
});

describe("wallets: Apple Wallet and Google Wallet, both", () => {
  const html = () => render(<WalletsSection />);

  test("the iPhone and the Android phone stand side by side at the same 5 of 8 as the banner, with the official badges under them, then the floating cards", async () => {
    const page = await html();
    const badges = page.indexOf('alt="Apple Wallet"');

    expect(badges).toBeGreaterThan(-1);
    expect(page.slice(0, badges).match(/5 \/ 8/g)?.length).toBeGreaterThanOrEqual(2);
    expect(page.indexOf('alt="Google Wallet"')).toBeGreaterThan(badges);
    expect(page.indexOf(COPY.wallets.iphone)).toBeGreaterThan(badges);
  });

  test("three stamped cards float over the phones: the stamp banner on iPhone, the reward banner on Android, and the shop's own icon", async () => {
    const page = await html();

    expectInOrder(page, [
      COPY.wallets.iphone,
      STAMP_BANNER.body,
      COPY.wallets.android,
      REWARD_BANNER.body,
      COPY.wallets.icon.title,
      COPY.wallets.icon.line,
    ]);
    expect(page.match(/class="card-stamp /g)).toHaveLength(3);
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

describe("editor: use our wording, or write your own", () => {
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

  test("Growth and Pro is said once, in the lead: the plan chip only comes with Your words", () => {
    expect(textOf(html()).match(/Growth and Pro/g)).toHaveLength(1);
    expect(textOf(html())).not.toContain("{first name}");
    expect(textOf(html())).not.toContain("Sophie");
  });

  test("three message switches follow, all on, named as the dashboard names its messages, with no plan chip", () => {
    const rows = [...html().matchAll(/<button[^>]*role="switch"[^>]*>([\s\S]*?)<\/button>/g)];

    expect(rows.map((row) => textOf(row[1]).replaceAll("|", ""))).toEqual([...switches]);
    for (const [row] of rows) {
      expect(row).toContain('aria-checked="true"');
      expect(row).toContain("min-h-14");
    }
    expect(textOf(rows.map((row) => row[0]).join(""))).not.toMatch(/Pro\b|Growth/);
  });

  test("the choice between the two wordings is a 44px control", () => {
    expect(html()).toMatch(/role="tab"[^>]*class="[^"]*\bh-11\b/);
  });

  test("brings a stamped stage and nothing else heavy: one card-stamp in the section", () => {
    expect(html().match(/card-stamp/g)).toHaveLength(1);
  });
});

describe("a lock-screen slice", () => {
  test("is a sample shop's notification on the dark lock screen, read out as one picture: who sent it and what it says", () => {
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

describe("what the page leaves out", () => {
  test("no broadcast mention that no plan label qualifies: the page is about the automatic messages", async () => {
    const sections = [await render(<DaySection />), renderEn(<EditorSection />), await render(<WalletsSection />)];

    expect(textOf(sections.join("\n"))).not.toMatch(/broadcast/i);
  });
});
