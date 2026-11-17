/**
 * What PostHog's `before_send` lets through about the page address: no ad click id in any URL it carries (the ad
 * platforms keep those for their own attribution), with `ad_click_vendor` saying which platform's click it was, and
 * no demo session token in the wallet-select page's address or in the links to the pass. Credentials, the rest of
 * every URL (utm_* included) and the rest of the event arrive as they were.
 */

import { describe, expect, test } from "bun:test";
import { scrubPostHogEvent } from "./credential-params";

const event = (properties: Record<string, unknown>) => ({ uuid: "018f-uuid", event: "$pageview", properties });

describe("ad click ids", () => {
  test.each([
    ["a Google ad", "https://stampeo.app/us/pricing?gclid=abc", "https://stampeo.app/us/pricing", "google"],
    ["an app-campaign Google click", "https://stampeo.app/?gbraid=0AAAA", "https://stampeo.app/", "google"],
    ["a web-to-app Google click", "https://stampeo.app/?wbraid=CjkKCQ", "https://stampeo.app/", "google"],
    ["a Meta ad", "https://stampeo.app/fr/tarifs?fbclid=IwAR1", "https://stampeo.app/fr/tarifs", "meta"],
    ["a ChatGPT ad", "https://stampeo.app/us?oppref=OAI-abc_123.x~y", "https://stampeo.app/us", "openai"],
    ["a TikTok ad", "https://stampeo.app/us?ttclid=E.C.P.abc", "https://stampeo.app/us", "tiktok"],
    [
      "campaign tags beside the click id",
      "https://stampeo.app/us?utm_source=chatgpt&oppref=OAI-abc&utm_medium=cpc&utm_campaign=spring",
      "https://stampeo.app/us?utm_source=chatgpt&utm_medium=cpc&utm_campaign=spring",
      "openai",
    ],
    ["the section anchor", "https://stampeo.app/us/pricing?gclid=abc#faq", "https://stampeo.app/us/pricing#faq", "google"],
    ["a click id in capitals", "https://stampeo.app/us?GCLID=abc&ref=x", "https://stampeo.app/us?ref=x", "google"],
    // One visitor, one vendor, and the same one every time: Google, Meta, OpenAI, TikTok.
    ["two platforms at once", "https://stampeo.app/?ttclid=t&fbclid=f&gclid=g", "https://stampeo.app/", "google"],
    ["Meta and TikTok at once", "https://stampeo.app/?ttclid=t&fbclid=f", "https://stampeo.app/", "meta"],
  ])("%s: the click id leaves every URL and the vendor is named", (_case, url, clean, vendor) => {
    const sent = scrubPostHogEvent(
      event({
        $current_url: url,
        $initial_current_url: url,
        $session_entry_url: url,
        $set_once: { $initial_current_url: url },
      }),
    );

    expect(sent.properties.$current_url).toBe(clean);
    expect(sent.properties.$initial_current_url).toBe(clean);
    expect(sent.properties.$session_entry_url).toBe(clean);
    expect(sent.properties.$set_once.$initial_current_url).toBe(clean);
    expect((sent.properties as Record<string, unknown>).ad_click_vendor).toBe(vendor);
  });

  test("a click id in a referrer or a link's address is removed and still names the vendor", () => {
    const sent = scrubPostHogEvent(
      event({
        $current_url: "https://stampeo.app/us",
        $referrer: "https://stampeo.app/us?fbclid=f1",
        $elements: [{ tag_name: "a", attr__href: "/onboarding?fbclid=abc&x=1" }],
        $elements_chain: 'a:attr__href="/onboarding?fbclid=abc&x=1"nth-child="2"',
      }),
    );

    expect(sent.properties.$referrer).toBe("https://stampeo.app/us");
    expect(sent.properties.$elements[0].attr__href).toBe("/onboarding?x=1");
    expect(sent.properties.$elements_chain).toBe('a:attr__href="/onboarding?x=1"nth-child="2"');
    expect((sent.properties as Record<string, unknown>).ad_click_vendor).toBe("meta");
  });

  test("the click ids PostHog copies into properties of their own are dropped too, and name the vendor", () => {
    const sent = scrubPostHogEvent(
      event({
        $current_url: "https://stampeo.app/us?gclid=abc&utm_source=google",
        gclid: "abc",
        utm_source: "google",
        $set_once: { $initial_gclid: "abc", $initial_utm_source: "google" },
      }),
    );

    expect(sent.properties).toEqual({
      $current_url: "https://stampeo.app/us?utm_source=google",
      utm_source: "google",
      $set_once: { $initial_utm_source: "google" },
      ad_click_vendor: "google",
    });
  });

  test("an address with a click id and a credential loses both", () => {
    const sent = scrubPostHogEvent(event({ $current_url: "https://stampeo.app/login?gclid=abc&email=a%40b.co&utm_source=x" }));

    expect(sent.properties.$current_url).toBe("https://stampeo.app/login?utm_source=x");
    expect((sent.properties as Record<string, unknown>).ad_click_vendor).toBe("google");
  });

  test.each([
    "https://stampeo.app/",
    "https://stampeo.app/us/pricing?utm_source=meta&utm_campaign=spring",
    "https://stampeo.app/us?gclidx=1&xfbclid=2",
  ])("%p arrives as it was, with no vendor named", (url) => {
    const sent = scrubPostHogEvent(event({ $current_url: url, $initial_current_url: url }));

    expect(sent.properties.$current_url).toBe(url);
    expect("ad_click_vendor" in sent.properties).toBe(false);
  });

  test("the rest of the event is kept", () => {
    const sent = scrubPostHogEvent({
      ...event({ $current_url: "https://stampeo.app/us?gclid=abc", $screen_width: 390, landing_variant: "lp_platform" }),
      timestamp: new Date("2026-11-17T08:00:00Z"),
    });

    expect(sent.uuid).toBe("018f-uuid");
    expect(sent.event).toBe("$pageview");
    expect(sent.timestamp).toEqual(new Date("2026-11-17T08:00:00Z"));
    expect(sent.properties.$screen_width).toBe(390);
    expect(sent.properties.landing_variant).toBe("lp_platform");
  });
});

describe("the demo session token", () => {
  const TOKEN = "k3J9xQ2mWvT8";

  test("the wallet-select page's address carries a placeholder where the token was, in every language", () => {
    for (const prefix of ["", "/en", "/pl"]) {
      const sent = scrubPostHogEvent(
        event({
          $current_url: `https://stampeo.app${prefix}/demo/wallet-select/${TOKEN}?utm_source=x`,
          $pathname: `${prefix}/demo/wallet-select/${TOKEN}`,
          $initial_current_url: `https://stampeo.app${prefix}/demo/wallet-select/${TOKEN}`,
        }),
      );

      expect(sent.properties.$current_url).toBe(`https://stampeo.app${prefix}/demo/wallet-select/:token?utm_source=x`);
      expect(sent.properties.$pathname).toBe(`${prefix}/demo/wallet-select/:token`);
      expect(sent.properties.$initial_current_url).toBe(`https://stampeo.app${prefix}/demo/wallet-select/:token`);
      expect(JSON.stringify(sent)).not.toContain(TOKEN);
    }
  });

  test("a tap on the wallet buttons does not send the token in the link's address", () => {
    const pass = `https://api.stampeo.app/demo/pass/${TOKEN}?wallet=apple`;
    const sent = scrubPostHogEvent(
      event({
        $current_url: `https://stampeo.app/demo/wallet-select/${TOKEN}`,
        $elements: [{ tag_name: "a", attr__href: pass }],
        $elements_chain: `a:attr__href="${pass}"nth-child="1"`,
      }),
    );

    expect(sent.properties.$elements[0].attr__href).toBe("https://api.stampeo.app/demo/pass/:token?wallet=apple");
    expect(sent.properties.$elements_chain).toBe('a:attr__href="https://api.stampeo.app/demo/pass/:token?wallet=apple"nth-child="1"');
    expect(JSON.stringify(sent)).not.toContain(TOKEN);
  });

  test.each([
    "https://stampeo.app/demo",
    "https://stampeo.app/en/demo?utm_source=x",
    "https://stampeo.app/demo/wallet-select",
    "https://stampeo.app/blog/how-to-demo/wallet-select-tips",
  ])("%p arrives as it was", (url) => {
    expect(scrubPostHogEvent(event({ $current_url: url })).properties.$current_url).toBe(url);
  });
});
