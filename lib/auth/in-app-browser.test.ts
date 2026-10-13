/**
 * Which visitors are inside a Meta app's own browser, and the link that asks
 * the phone's real browser to open the same page.
 */

import { describe, expect, test } from "bun:test";
import { buildBrowserEscapeUrl, classifyInAppBrowser } from "./in-app-browser";

const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)";
const ANDROID_WV =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36";

describe("classifyInAppBrowser", () => {
  test.each([
    [
      "Instagram on iPhone",
      `${IOS} Mobile/21F90 Instagram 345.0.2.20.116 (iPhone14,5; iOS 17_5_1; en_US; en; scale=3.00; 1170x2532; 636435678)`,
      "instagram",
    ],
    [
      "Instagram on Android",
      `${ANDROID_WV} Instagram 345.0.0.34.108 Android (34/14; 480dpi; 1080x2340; samsung; SM-S918B; dm3q; qcom; en_US; 636435678)`,
      "instagram",
    ],
    [
      "Facebook on iPhone",
      `${IOS} Mobile/21F90 [FBAN/FBIOS;FBAV/467.0.0.40.109;FBBV/616547268;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.5.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBRV/617234559]`,
      "facebook",
    ],
    [
      "Facebook on Android",
      `${ANDROID_WV} [FB_IAB/FB4A;FBAV/466.0.0.46.108;]`,
      "facebook",
    ],
    [
      "Facebook on Android, older FBAN form",
      `${ANDROID_WV} [FBAN/FB4A;FBAV/390.0.0.10.119;FBBV/353000000;FBDM/{density=2.75,width=1080,height=2220};FBLC/en_US]`,
      "facebook",
    ],
    [
      "Messenger on iPhone",
      `${IOS} Mobile/21E219 [FBAN/MessengerForiOS;FBAV/460.0.0.45.113;FBBV/580000000;FBDV/iPhone13,2;FBMD/iPhone;FBSN/iOS;FBSV/17.4;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]`,
      "messenger",
    ],
    [
      "Messenger on Android",
      `${ANDROID_WV} [FB_IAB/Orca-Android;FBAV/450.0.0.38.109;]`,
      "messenger",
    ],
    [
      "Threads on iPhone",
      `${IOS} Mobile/21F79 Barcelona 350.0.0.10.100 (iPhone14,5; iOS 17_5; en_US; en-US; scale=3.00; 1170x2532; 650000000)`,
      "threads",
    ],
    [
      "Threads on Android",
      `${ANDROID_WV} Barcelona 350.0.0.30.100 Android (34/14; 480dpi; 1080x2340; samsung; SM-S918B; dm3q; qcom; en_US; 650000000)`,
      "threads",
    ],
  ])("%s is named", (_label, ua, expected) => {
    expect(classifyInAppBrowser(ua)).toBe(expected);
  });

  test.each([
    [
      "Safari on iPhone",
      `${IOS} Version/17.5 Mobile/15E148 Safari/604.1`,
    ],
    [
      "Chrome on iPhone (CriOS)",
      `${IOS} CriOS/126.0.6478.153 Mobile/15E148 Safari/604.1`,
    ],
    [
      "Chrome on Android",
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36",
    ],
    [
      "Samsung Internet",
      "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
    ],
    [
      "Firefox on Android",
      "Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0",
    ],
    [
      "Firefox on iPhone (FxiOS)",
      `${IOS} FxiOS/127.0 Mobile/15E148 Safari/605.1.15`,
    ],
    [
      "Chrome on desktop",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ],
    [
      "Safari on desktop",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    ],
    [
      "the Gmail / Google app on iPhone (GSA)",
      `${IOS} GSA/320.0.641164538 Mobile/15E148 Safari/604.1`,
    ],
    [
      "LinkedIn on iPhone",
      `${IOS} Mobile/21F90 LinkedInApp/9.30.1840`,
    ],
    [
      "LinkedIn on Android",
      `${ANDROID_WV} LinkedInApp`,
    ],
    [
      "TikTok on iPhone",
      `${IOS} Mobile/15E148 musical_ly_34.2.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US RevealType/Dialog isDarkMode/0 WKWebView/1 BytedanceWebview/d8a21c6`,
    ],
    [
      "TikTok on Android",
      `${ANDROID_WV} trill_340202 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly app_version/34.2.2 ByteLocale/en BytedanceWebview/d8a21c6`,
    ],
    ["an empty user agent", ""],
  ])("%s is a real browser", (_label, ua) => {
    expect(classifyInAppBrowser(ua)).toBeNull();
  });
});

describe("buildBrowserEscapeUrl", () => {
  const origin = "https://stampeo.app";
  const path = "/en/onboarding";
  const ad = new URLSearchParams({ utm_source: "meta", utm_medium: "paid", fbclid: "IwAR3x" });

  test("iPhone: opens the same page in Safari, carrying the ad parameters", () => {
    expect(buildBrowserEscapeUrl({ platform: "ios", origin, path, params: ad })).toBe(
      "x-safari-https://stampeo.app/en/onboarding?utm_source=meta&utm_medium=paid&fbclid=IwAR3x",
    );
  });

  test("Android: hands the same page to Chrome, falling back to the plain https address", () => {
    const url = buildBrowserEscapeUrl({ platform: "android", origin, path, params: ad });
    const https = "https://stampeo.app/en/onboarding?utm_source=meta&utm_medium=paid&fbclid=IwAR3x";
    expect(url).toBe(
      `intent://stampeo.app/en/onboarding?utm_source=meta&utm_medium=paid&fbclid=IwAR3x` +
        `#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(https)};end`,
    );
  });

  test.each(["ios", "android"] as const)("%s: no parameters means a bare onboarding path", (platform) => {
    const url = buildBrowserEscapeUrl({ platform, origin, path, params: new URLSearchParams() });
    expect(url).not.toContain("?");
    expect(url).toContain("stampeo.app/en/onboarding");
  });

  test("a development origin keeps its port and its scheme", () => {
    expect(
      buildBrowserEscapeUrl({
        platform: "ios",
        origin: "http://localhost:3001",
        path: "/fr/onboarding",
        params: new URLSearchParams(),
      }),
    ).toBe("x-safari-http://localhost:3001/fr/onboarding");
  });

  test("parameter values are URL-encoded", () => {
    const url = buildBrowserEscapeUrl({
      platform: "ios",
      origin,
      path,
      params: new URLSearchParams({ utm_campaign: "spring sale&more" }),
    });
    expect(url).toBe("x-safari-https://stampeo.app/en/onboarding?utm_campaign=spring+sale%26more");
  });
});
