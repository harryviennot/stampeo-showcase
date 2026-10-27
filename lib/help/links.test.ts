import { describe, expect, test } from "bun:test";
import { dashboardUrl, resolveHelpHref } from "./links";
import { planBadge } from "./badges";

describe("a link in a help page", () => {
  test.each([
    // Help links stay on the locale-free URL: a localized Link would cost a 308.
    ["/help", { href: "/help", newTab: false }],
    ["/help/roles", { href: "/help/roles", newTab: false }],
    ["/help/roles#who-can-change-what", { href: "/help/roles#who-can-change-what", newTab: false }],
    // Other site pages go to their English version.
    ["/pricing", { href: "/en/pricing", newTab: false }],
    ["/loyalty-programs#stamps", { href: "/en/loyalty-programs#stamps", newTab: false }],
    ["/", { href: "/en", newTab: false }],
    // Same-page anchors and the mail, phone and WhatsApp apps are left alone.
    ["#troubleshooting", { href: "#troubleshooting", newTab: false }],
    ["mailto:support@stampeo.app", { href: "mailto:support@stampeo.app", newTab: false }],
    ["tel:+33649370470", { href: "tel:+33649370470", newTab: false }],
    // Other sites open in a new tab.
    ["https://example.com/page", { href: "https://example.com/page", newTab: true }],
    ["https://wa.me/33649370470", { href: "https://wa.me/33649370470", newTab: true }],
  ])("%s", (href, expected) => {
    expect(resolveHelpHref(href)).toEqual(expected);
  });
});

describe("the Open in dashboard link", () => {
  test.each([
    ["https://app.stampeo.app", "/team", "https://app.stampeo.app/team"],
    ["https://app.stampeo.app/", "/team", "https://app.stampeo.app/team"],
    ["http://localhost:3001", "/settings#time-zone", "http://localhost:3001/settings#time-zone"],
    [undefined, "/team", "https://app.stampeo.app/team"],
    ["", "/team", "https://app.stampeo.app/team"],
  ])("app url %p + %s", (appUrl, path, expected) => {
    expect(dashboardUrl(path, appUrl)).toBe(expected);
  });
});

describe("the plan badge", () => {
  test("names the plans a page is gated to, never Growth on its own", () => {
    expect(planBadge(["growth", "pro"])).toBe("growthPro");
    expect(planBadge(["pro"])).toBe("pro");
  });

  test("a page on every plan has no badge", () => {
    expect(planBadge(undefined)).toBeNull();
    expect(planBadge(["starter", "growth", "pro"])).toBeNull();
  });
});
