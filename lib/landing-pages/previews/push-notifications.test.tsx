/**
 * The notifications preview (`/us/landing-pages/platform/push-notifications`): what each
 * section promises a visitor. The pieces that draw only sync components are rendered on the
 * server, which is what a visitor gets first and what a phone or a reader who asks for less
 * motion keeps; the ones that nest an async server component (the wallet phones, the Aurevo
 * card) are read as source.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { HowSection } from "@/components/landing-pages/feature-previews/push-notifications/HowSection";
import { LockScreenSlice } from "@/components/landing-pages/feature-previews/push-notifications/LockScreenSlice";
import { OwnIconCard } from "@/components/landing-pages/feature-previews/push-notifications/OwnIconCard";
import { WordingSection } from "@/components/landing-pages/feature-previews/push-notifications/WordingSection";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { scannerLoopFiles } from "@/lib/videos/scanner-loop";
import { code, findTag, literalAttr, openingTags } from "../../testing/jsx-source";
import { COMPONENTS_DIR, pageFile, renderedSections } from "../../testing/landing-pages-source";
import { renderEn, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "../copy/previews/push-notifications";
import { REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../copy/shared";
import { LANDING_PAGES } from "../pages";

// The moments section asks next-intl for the Aurevo card's labels.
await mockEnglishServerTranslations();
const { MomentsSection, pushMoments } = await import(
  "@/components/landing-pages/feature-previews/push-notifications/MomentsSection"
);

const SLUG = "platform/push-notifications";
const PUSH_DIR = join(COMPONENTS_DIR, "feature-previews", "push-notifications");
const page = () => code(pageFile(SLUG));
const source = (name: string) => code(join(PUSH_DIR, `${name}.tsx`));

/** The lines of `lines`, in the order they are printed in `text`, each found. */
function inOrder(text: string, lines: readonly string[]) {
  const at = lines.map((line) => text.indexOf(line));
  expect(at.every((index) => index > -1)).toBe(true);
  expect(at).toEqual([...at].sort((a, b) => a - b));
}

describe("the page", () => {
  test("is built: the foundation's marker is gone, and every section of the registry is there once, in order", () => {
    expect(page()).not.toContain("TODO(STA-552 builder)");
    expect(renderedSections(pageFile(SLUG))).toEqual([...LANDING_PAGES[SLUG].sections]);
  });

  test("keeps its second hero button as Try it on your phone, because the page has a live demo", () => {
    expect(findTag(page(), "PreviewHero")?.attrs).not.toMatch(/\bsecondary=/);
    expect(findTag(page(), "LpDemo")).toBeDefined();
  });

  test("the live demo is centred under its own eyebrow, and is where the hero's second button lands", () => {
    const demo = findTag(page(), "LpDemo");

    expect(demo?.attrs).toContain("eyebrow={PUSH_NOTIFICATIONS_PREVIEW.demo.eyebrow}");
    expect(literalAttr(demo?.attrs ?? "", "align")).toBe("center");
    expect(COPY.demo.eyebrow).toBe("Live demo");
  });

  test("the middle of the page is its five sections, between the hero and the cream card, in the brief's order", () => {
    const tags = openingTags(page()).map((tag) => tag.name);
    const middle = ["HowSection", "MomentsSection", "WalletsSection", "WordingSection", "LpDemo"].map((name) => tags.indexOf(name));

    expect(middle.every((index) => index > -1)).toBe(true);
    expect(middle).toEqual([...middle].sort((a, b) => a - b));
    expect(tags.indexOf("PreviewHero")).toBeLessThan(middle[0]);
    expect(tags.indexOf("LpAccentBand")).toBeGreaterThan(middle[4]);
  });
});

describe("how it works: you scan, their phone lights up", () => {
  const html = () => renderEn(<HowSection />);

  test("is headed by its eyebrow, title and lead, and tells the three steps in order", () => {
    const text = textOf(html());

    inOrder(text, [COPY.how.eyebrow, COPY.how.title, COPY.how.lead]);
    inOrder(text, COPY.how.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(html()).toContain('data-landing-section="how"');
    expect(html().match(/<li\b/g)).toHaveLength(3);
  });

  test("shows the Scanner app's finished stamp as a still picture, never the video", () => {
    const still = encodeURIComponent(scannerLoopFiles("en").still).replaceAll("%2F", "/");

    expect(html()).toContain(still);
    expect(html()).not.toContain("<video");
    expect(source("HowSection")).toMatch(/<ScannerLoop\b[^>]*\bstill\b/);
  });

  test("beside it, the lock screen that stamp lights up: Aurevo's stamp notification, read out as a picture", () => {
    const text = textOf(html());

    expect(text).toContain(SAMPLE_BUSINESS);
    expect(text).toContain(STAMP_BANNER.body);
    expect(html()).toMatch(/role="img"[^>]*aria-label="[^"]*lock screen[^"]*Aurevo[^"]*"/i);
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

  test("print the header and the three moments, the first one's banner on the phone", async () => {
    const html = renderEn(await MomentsSection());
    const text = textOf(html);

    inOrder(text, [COPY.moments.eyebrow, COPY.moments.title, COPY.moments.lead]);
    for (const item of COPY.moments.items) {
      expect(text).toContain(item.title);
      expect(text).toContain(item.description);
    }
    expect(text).toContain(STAMP_BANNER.body);
    expect(html).toContain('data-landing-section="moments"');
  });

  test("draw the whole card, cut at 520px on a phone, from Aurevo's own design", () => {
    const sequence = findTag(source("MomentsSection"), "NotificationSequenceDemo");

    expect(sequence?.attrs).toMatch(/\bfullCard\b/);
    expect(sequence?.attrs).toContain("phoneClassName={phoneCropClass(520)}");
    expect(sequence?.attrs).toContain("moments={pushMoments()}");
    expect(sequence?.attrs).toContain("design={await aurevoDesign()}");
  });
});

describe("wallets: Apple Wallet and Google Wallet, both", () => {
  const composition = () => source("WalletsComposition");

  test("its section is headed by its eyebrow, title and lead, and holds the composition", () => {
    const section = source("WalletsSection");
    const header = findTag(section, "LpSection");

    expect(literalAttr(header?.attrs ?? "", "section")).toBe("wallets");
    expect(header?.attrs).toContain("eyebrow={COPY.wallets.eyebrow}");
    expect(header?.attrs).toContain("title={COPY.wallets.title}");
    expect(header?.attrs).toContain("lead={COPY.wallets.lead}");
    expect(literalAttr(header?.attrs ?? "", "align")).toBe("center");
    expect(openingTags(section).some((tag) => tag.name === "WalletsComposition")).toBe(true);
  });

  test("the iPhone and the Android phone stand side by side at the same 5 of 8 as the banner, with the official badges under them, then the glass cards", () => {
    const text = composition();
    const order = ["<WalletPhone", "<GoogleWalletPhone", "<WalletBadges", "<GlassCard"].map((needle) => text.indexOf(needle));
    const stamps = (name: string) => /stamps=\{(\d+)\}/.exec(findTag(text, name)?.attrs ?? "")?.[1];

    expect(order.every((at) => at > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(stamps("WalletPhone")).toBe("5");
    expect(stamps("GoogleWalletPhone")).toBe("5");
  });

  test("three glass cards float over the phones: the stamp banner on iPhone, the reward banner on Android, and the shop's own icon", () => {
    const cards = openingTags(composition()).filter((tag) => tag.name === "GlassCard");
    const text = composition();

    expect(cards).toHaveLength(3);
    for (const card of cards) expect(card.attrs).toMatch(/\bfloat\b/);
    expect(cards.map((card) => /title=\{([^}]*)\}/.exec(card.attrs)?.[1].trim())).toEqual([
      "COPY.wallets.iphone",
      "COPY.wallets.android",
      "COPY.wallets.icon.title",
    ]);
    expect(text).toContain("<LockScreenNotification {...lpBanner(STAMP_BANNER)}");
    expect(text).toContain("<LockScreenNotification {...lpBanner(REWARD_BANNER)}");
    expect(openingTags(text).some((tag) => tag.name === "OwnIconCard")).toBe(true);
  });

  test("from lg it is a 960px stage, and on a phone a column that keeps the phones first", () => {
    expect(composition()).toContain("lg:w-[960px]");
    expect(composition()).toContain("flex-col");
  });

  test("the icon card shows three icon tiles of different shops, and says every plan can upload or pick one made from its logo", () => {
    const html = renderEn(<OwnIconCard />);
    const text = textOf(html);

    expect(text).toContain(COPY.wallets.icon.line);
    expect(html.match(/data-icon-tile/g)).toHaveLength(3);
    expect(html).toContain("/themes/cafe/cup.png");
    expect(html).toMatch(/role="img"[^>]*aria-label="[^"]*icon[^"]*"/i);
  });
});

describe("wording: ready-made or your own words", () => {
  const html = () => renderEn(<WordingSection />);

  test("is headed by its eyebrow, title and lead, and offers the two tabs of the copy", () => {
    const text = textOf(html());

    inOrder(text, [COPY.wording.eyebrow, COPY.wording.title, COPY.wording.lead]);
    expect(html()).toContain('data-landing-section="wording"');
    expect(html().match(/role="tab"/g)).toHaveLength(2);
    expect(html()).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Ready-made</);
    expect(text).toContain(COPY.wording.tabs.words.label);
  });

  test("each pane has its title and facts, and only the facts that need Growth or Pro carry that chip", () => {
    const text = textOf(html());
    const { ready, words } = COPY.wording.tabs;

    for (const line of [ready.title, ...ready.facts.map((fact) => fact.text), words.title, ...words.facts.map((fact) => fact.text)]) {
      expect(text).toContain(line);
    }
    expect(text.match(/Growth and Pro/g)).toHaveLength(words.facts.length + 1);
    expect(text).not.toContain("Every plan");
  });

  test("the ready-made pane shows the default stamp message, the other your own words with their first name, each on a lock screen", () => {
    const text = textOf(html());
    const slices = [...html().matchAll(/role="img" aria-label="([^"]*lock screen[^"]*)"/gi)].map((match) => match[1]);

    expect(text).toContain(STAMP_BANNER.body);
    expect(text).toContain(COPY.wording.tabs.words.banner.body);
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

  test("is never sent by Stampeo", () => {
    expect(renderEn(<LockScreenSlice banner={COPY.wording.tabs.words.banner} />)).not.toMatch(/stampeo/i);
  });
});

describe("what the page leaves out", () => {
  const rendered = async () =>
    [renderEn(<HowSection />), renderEn(await MomentsSection()), renderEn(<WordingSection />), renderEn(<OwnIconCard />)].join("\n");

  test("no Every plan chip, no Sample data caption and no em dash", async () => {
    const text = textOf(await rendered());

    expect(text).not.toContain("Every plan");
    expect(text).not.toMatch(/sample data/i);
    expect(text).not.toContain("—");
  });

  test("no broadcast mention that no plan label qualifies: the page is about the automatic messages", async () => {
    expect(textOf(await rendered())).not.toMatch(/broadcast/i);
  });

  test("the sections bring no sign-up button of their own: the hero, the demo and the cream card carry the trial buttons", () => {
    for (const name of ["HowSection", "MomentsSection", "WalletsSection", "WordingSection"]) {
      expect(openingTags(source(name)).some((tag) => tag.name === "CTAButton")).toBe(false);
    }
  });
});
