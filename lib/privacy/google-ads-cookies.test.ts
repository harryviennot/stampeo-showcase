/**
 * The cookie gtag keeps an Ads click in when GA4 is linked to Google Ads. The
 * site loads no Ads tag, so these only exist if a browser still carries them or
 * a destination is attached in Google's console; a refusal of advertising
 * removes them either way.
 */

import { expect, test } from "bun:test";
import { cookieNamesToClear } from "../consent";

const ADS_CLICK_COOKIES = ["_gac_G-ZFZ6JLPFXN", "_gac_gb_M63DLGMC"];
const ANALYTICS_COOKIES = ["_ga", "_ga_ZFZ6JLPFXN", "_gid"];

test("refusing advertising clears the Ads click cookies and leaves the analytics ones", () => {
  const present = [...ADS_CLICK_COOKIES, ...ANALYTICS_COOKIES];

  expect(cookieNamesToClear(["marketing"], present).sort()).toEqual([...ADS_CLICK_COOKIES].sort());
  expect(cookieNamesToClear(["analytics"], present).sort()).toEqual([...ANALYTICS_COOKIES].sort());
});
