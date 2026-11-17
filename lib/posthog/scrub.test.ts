/**
 * What the PostHog scrub takes out of the events posthog-js sends, and what it leaves. The events in
 * `__fixtures__` are the raw ones posthog-js 1.372.1 handed to `before_send` on the site's own pages (a recording
 * `before_send` in place of the scrub, everything else the site's init options), so the properties are the ones
 * the library really adds: `$session_entry_*`, `$external_click_url`, `$prev_pageview_pathname`, the click ids it
 * copies into properties of their own.
 *
 * Gone from every event: the ad platforms' click ids (their platform is named in `ad_click_vendor`), the credentials
 * of a sign-in link, and the token of a demo session or a team-join link in a path. Kept: every other URL
 * parameter (utm_* included) and every other property.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { scrubPostHogEvent } from "./scrub";

type Event = { event: string; properties: Record<string, unknown>; [key: string]: unknown };

const fixture = (name: string) => JSON.parse(readFileSync(join(import.meta.dir, "__fixtures__", name), "utf8"));
const AD_LANDING_VISIT: Event[] = fixture("ad-landing-visit.json").events;
const WALLET_SELECT_VISIT: Event[] = fixture("wallet-select-visit.json").events;
const JOIN_VISIT: Event[] = fixture("join-visit.json").events;
const AD_LANDINGS: Record<string, { event: Event }> = fixture("ad-landings.json").landings;

/** Every key and every string value of an event, at any depth. */
function textsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textsOf);
  if (typeof value === "object" && value !== null) return Object.entries(value).flatMap(([key, item]) => [key, ...textsOf(item)]);
  return [];
}

const CLICK_ID = /gclid|gbraid|wbraid|fbclid|oppref|ttclid/i;
const hasClickId = (event: unknown) => textsOf(event).filter((text) => CLICK_ID.test(text));

describe("a visit to an ad landing", () => {
  const sent = AD_LANDING_VISIT.map((event) => scrubPostHogEvent(event));

  test("the visit holds a view, a custom event, a person-property set, a tap and the leave", () => {
    expect(AD_LANDING_VISIT.map(({ event }) => event)).toEqual(["$pageview", "landing_cta_clicked", "$set", "$autocapture", "$pageleave"]);
  });

  test.each(AD_LANDING_VISIT.map((event, index) => [event.event, index] as const))("%s: no click id is left, in a URL, a property name or a person property", (_name, index) => {
    expect(hasClickId(AD_LANDING_VISIT[index]).length).toBeGreaterThan(0);
    expect(hasClickId(sent[index])).toEqual([]);
  });

  test.each(AD_LANDING_VISIT.map((event, index) => [event.event, index] as const))("%s: the platform is named, Google ahead of Meta", (_name, index) => {
    expect(sent[index].properties.ad_click_vendor).toBe("google");
  });

  test("the landing's address keeps its campaign tag in every property that held it", () => {
    for (const event of sent) {
      expect(event.properties.$current_url).toBe("http://stampeo.test:3501/us?utm_source=x");
      expect(event.properties.$session_entry_url).toBe("http://stampeo.test:3501/us?utm_source=x");
      expect(event.properties.$session_entry_utm_source).toBe("x");
    }
  });

  test("the person properties of the set event lose the click ids and keep the rest", () => {
    const set = sent[2];
    const raw = AD_LANDING_VISIT[2];

    expect(set.$set_once).toEqual(
      Object.fromEntries(
        Object.entries(raw.$set_once as Record<string, unknown>)
          .filter(([key]) => !CLICK_ID.test(key))
          .map(([key, value]) => [key, typeof value === "string" ? value.replace("gclid=g1&fbclid=f1&", "") : value]),
      ),
    );
    expect((set.properties as Record<string, unknown>).$set).toEqual({ test_person_property: "x" });
  });

  test("every other property arrives as posthog-js made it", () => {
    sent.forEach((event, index) => {
      const raw = AD_LANDING_VISIT[index].properties;
      const keys = Object.keys(raw).filter((key) => !CLICK_ID.test(key));
      const untouched = keys.filter((key) => !(typeof raw[key] === "string" && CLICK_ID.test(raw[key])));

      expect(untouched.length).toBeGreaterThan(30);
      for (const key of untouched) expect({ key, value: event.properties[key] }).toEqual({ key, value: raw[key] });
      expect(Object.keys(event.properties).sort()).toEqual([...keys, "ad_click_vendor"].sort());
    });
  });

  test("the tapped link's element chain keeps its text, its classes and its order", () => {
    const raw = AD_LANDING_VISIT[3].properties;

    expect(sent[3].properties.$elements_chain).toBe(raw.$elements_chain);
    expect(sent[3].properties.$elements).toEqual(raw.$elements);
  });

  test("the event keeps its identity and its time", () => {
    sent.forEach((event, index) => {
      expect(event.uuid).toBe(AD_LANDING_VISIT[index].uuid);
      expect(event.event).toBe(AD_LANDING_VISIT[index].event);
      expect(event.timestamp).toBe(AD_LANDING_VISIT[index].timestamp);
    });
  });
});

describe("each platform's ad landing", () => {
  const BASE = "http://stampeo.test:3501";

  test.each([
    ["google", "/us/pricing", "google"],
    ["google app campaign", "/", "google"],
    ["google web-to-app", "/", "google"],
    ["meta", "/pricing", "meta"],
    ["chatgpt", "/us?utm_source=chatgpt&utm_medium=cpc&utm_campaign=us-chatgpt-brand", "openai"],
    ["tiktok", "/us", "tiktok"],
    ["three platforms at once", "/", "google"],
    ["google with a section anchor", "/us/pricing#faq", "google"],
  ])("%s: the address is clean, the platform named, and no click id left", (name, path, vendor) => {
    const { event } = AD_LANDINGS[name];
    const sent = scrubPostHogEvent(event);

    expect(hasClickId(event).length).toBeGreaterThan(0);
    expect(sent.properties.$current_url).toBe(BASE + path);
    expect(sent.properties.$session_entry_url).toBe(BASE + path);
    expect(sent.properties.ad_click_vendor).toBe(vendor);
    expect(hasClickId(sent)).toEqual([]);
  });

  test("a page with no click id gets no vendor", () => {
    const clean = JOIN_VISIT[0];

    expect("ad_click_vendor" in scrubPostHogEvent(clean).properties).toBe(false);
  });
});

describe("a visit to the wallet-select page", () => {
  const TOKEN = "k3J9xQ2mWvT8";
  const sent = WALLET_SELECT_VISIT.map((event) => scrubPostHogEvent(event));

  test("the visit holds a view, a tap on the Apple Wallet button and the leave", () => {
    expect(WALLET_SELECT_VISIT.map(({ event }) => event)).toEqual(["$pageview", "$autocapture", "$pageleave"]);
    expect(JSON.stringify(WALLET_SELECT_VISIT)).toContain(TOKEN);
  });

  test("the token is in no event: a placeholder takes its place in the address and the path", () => {
    expect(JSON.stringify(sent)).not.toContain(TOKEN);
    for (const event of sent) {
      expect(event.properties.$current_url).toBe("http://stampeo.test:3501/demo/wallet-select/:token");
      expect(event.properties.$pathname).toBe("/demo/wallet-select/:token");
      expect(event.properties.$session_entry_url).toBe("http://stampeo.test:3501/demo/wallet-select/:token");
      expect(event.properties.$session_entry_pathname).toBe("/demo/wallet-select/:token");
    }
    expect(sent[2].properties.$prev_pageview_pathname).toBe("/demo/wallet-select/:token");
  });

  test("the tap on the button does not carry it in the link's address either", () => {
    const [, tap] = sent;

    expect(tap.properties.$external_click_url).toBe("https://api.dev.stampeo.app/demo/pass/:token?wallet=apple");
    expect(tap.properties.$elements_chain).toContain('attr__href="https://api.dev.stampeo.app/demo/pass/:token?wallet=apple"');
  });
});

describe("a visit to a team-join link", () => {
  test("the code in the path is replaced, in every property that held it", () => {
    const sent = JOIN_VISIT.map((event) => scrubPostHogEvent(event));

    expect(JSON.stringify(JOIN_VISIT)).toContain("ABCD2345");
    expect(JSON.stringify(sent)).not.toContain("ABCD2345");
    for (const event of sent) {
      expect(event.properties.$current_url).toBe("http://stampeo.test:3501/join/:token");
      expect(event.properties.$pathname).toBe("/join/:token");
    }
  });
});

describe("pages that look like those but are not", () => {
  test.each([
    "https://stampeo.app/demo",
    "https://stampeo.app/en/demo?utm_source=x",
    "https://stampeo.app/demo/wallet-select",
    "https://stampeo.app/blog/how-to-demo/wallet-select-tips",
    "https://stampeo.app/join",
  ])("%p arrives as it was", (url) => {
    expect(scrubPostHogEvent({ event: "$pageview", properties: { $current_url: url } }).properties.$current_url).toBe(url);
  });
});

describe("scrubPostHogEvent", () => {
  const TOKEN_URL = "https://stampeo.app/en/reset-password?token_hash=secret&type=recovery&utm_source=mail";
  const CLEAN_URL = "https://stampeo.app/en/reset-password?type=recovery&utm_source=mail";

  const pageview = () => ({
    uuid: "018f-uuid",
    event: "$pageview",
    timestamp: new Date("2026-10-11T08:00:00Z"),
    properties: {
      $current_url: TOKEN_URL,
      $referrer: "https://stampeo.app/auth/callback#access_token=a&refresh_token=r",
      $initial_current_url: TOKEN_URL,
      $pathname: "/en/reset-password",
      $title: "Set a new password",
      $screen_width: 390,
      $is_identified: false,
      $set_once: { $initial_current_url: TOKEN_URL, $initial_referrer: "$direct" },
      $elements: [{ tag_name: "a", attr__href: "/auth/callback?code=pkce", nth_child: 2 }],
    },
    $set: { $current_url: TOKEN_URL },
    $set_once: { $initial_current_url: TOKEN_URL },
  });

  test("removes credentials from every URL-valued property, nested ones included", () => {
    const sent = scrubPostHogEvent(pageview())!;

    expect(sent.properties.$current_url).toBe(CLEAN_URL);
    expect(sent.properties.$initial_current_url).toBe(CLEAN_URL);
    expect(sent.properties.$referrer).toBe("https://stampeo.app/auth/callback");
    expect(sent.properties.$set_once.$initial_current_url).toBe(CLEAN_URL);
    expect(sent.properties.$elements[0].attr__href).toBe("/auth/callback");
    expect(sent.$set.$current_url).toBe(CLEAN_URL);
    expect(sent.$set_once.$initial_current_url).toBe(CLEAN_URL);
    expect(JSON.stringify(sent)).not.toContain("secret");
  });

  test("keeps the event, its identity and every other property", () => {
    const original = pageview();
    const sent = scrubPostHogEvent(original)!;

    expect(sent.uuid).toBe(original.uuid);
    expect(sent.event).toBe("$pageview");
    expect(sent.timestamp).toEqual(original.timestamp);
    expect(sent.properties.$pathname).toBe("/en/reset-password");
    expect(sent.properties.$title).toBe("Set a new password");
    expect(sent.properties.$screen_width).toBe(390);
    expect(sent.properties.$is_identified).toBe(false);
    expect(sent.properties.$set_once.$initial_referrer).toBe("$direct");
    expect(sent.properties.$elements[0].nth_child).toBe(2);
  });

  test("removes the email from the element chain PostHog sends with a click, and keeps the rest of the chain", () => {
    const chain = (href: string) =>
      `a.text-sm:attr__href="${href}"href="${href}"nth-child="2"nth-of-type="1"text="Forgot password?";form:nth-child="1"`;
    const click = { event: "$autocapture", properties: { $elements_chain: chain("/login?email=ines%40example.com") } };
    expect(scrubPostHogEvent(click).properties.$elements_chain).toBe(chain("/login"));
  });

  test("removes credentials from URLs used as keys, such as heatmap data", () => {
    const heatmap = {
      event: "$$heatmap",
      properties: { $heatmap_data: { "https://stampeo.app/en/pricing?code=pkce&ref=ig": [{ x: 10, y: 20 }] } },
    };
    expect(scrubPostHogEvent(heatmap).properties.$heatmap_data).toEqual({
      "https://stampeo.app/en/pricing?ref=ig": [{ x: 10, y: 20 }],
    });
  });

  test("removes credentials from a URL inside a captured exception's message", () => {
    const exception = {
      event: "$exception",
      properties: {
        $exception_list: [{ type: "TypeError", value: "Failed to fetch /en/reset-password?token_hash=secret" }],
      },
    };
    const sent = scrubPostHogEvent(exception);
    expect(sent.properties.$exception_list[0]).toEqual({ type: "TypeError", value: "Failed to fetch /en/reset-password" });
  });

  test("does not rewrite the event it was handed", () => {
    const original = pageview();
    scrubPostHogEvent(original);
    expect(original.properties.$current_url).toBe(TOKEN_URL);
  });

  test("never drops an event: a clean one comes back as it was, a null stays null", () => {
    const clean = { uuid: "u", event: "$autocapture", properties: { $current_url: "https://stampeo.app/en" } };
    expect(scrubPostHogEvent(clean)).toEqual(clean);
    expect(scrubPostHogEvent(null)).toBeNull();
  });
});
