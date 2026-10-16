/**
 * The page address GA4 receives. Ad click ids are removed (Google Ads and Meta
 * hold them for their own attribution, and GA4 has no use for them); the rest
 * of the address, utm_* included, arrives as it was.
 */

import { describe, expect, test } from "bun:test";
import { stripAdClickIds } from "./ad-click-params";

describe("stripAdClickIds", () => {
  test.each([
    ["a Google ad landing", "https://stampeo.app/us/pricing?gclid=abc", "https://stampeo.app/us/pricing"],
    ["a Meta ad landing", "https://stampeo.app/fr/tarifs?fbclid=IwAR1", "https://stampeo.app/fr/tarifs"],
    ["an app-campaign Google click", "https://stampeo.app/?gbraid=0AAAA", "https://stampeo.app/"],
    ["a web-to-app Google click", "https://stampeo.app/?wbraid=CjkKCQ", "https://stampeo.app/"],
    [
      "every click id at once",
      "https://stampeo.app/?gclid=g&gbraid=b&wbraid=w&fbclid=f",
      "https://stampeo.app/",
    ],
    [
      "a click id among the campaign parameters",
      "https://stampeo.app/us?utm_source=google&utm_medium=cpc&gclid=abc&utm_campaign=spring",
      "https://stampeo.app/us?utm_source=google&utm_medium=cpc&utm_campaign=spring",
    ],
    ["a click id written in capitals", "https://stampeo.app/us?GCLID=abc&ref=x", "https://stampeo.app/us?ref=x"],
    [
      "other parameters keep their encoding",
      "https://stampeo.app/us?q=two%20words&gclid=abc&lang=fr",
      "https://stampeo.app/us?q=two%20words&lang=fr",
    ],
    ["the section anchor", "https://stampeo.app/us/pricing?gclid=abc#faq", "https://stampeo.app/us/pricing#faq"],
  ])("%s", (_case, url, expected) => {
    expect(stripAdClickIds(url)).toBe(expected);
  });

  test.each([
    "https://stampeo.app/",
    "https://stampeo.app/us/pricing?utm_source=meta&utm_campaign=spring",
    "https://stampeo.app/fr?debug_mode=1",
    "https://stampeo.app/us?gclidx=1&xfbclid=2",
    "",
  ])("%p arrives untouched", (url) => {
    expect(stripAdClickIds(url)).toBe(url);
  });
});
