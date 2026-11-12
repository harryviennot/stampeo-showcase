/**
 * The generic Android phone (`components/ui/AndroidPhone`): a Pixel-like body
 * drawn in CSS and SVG, around whatever its screen shows.
 */

import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AndroidPhone } from "@/components/ui/AndroidPhone";
import { androidLayout } from "./android";

const render = (props: Parameters<typeof AndroidPhone>[0]) => renderToStaticMarkup(<AndroidPhone {...props} />);

describe("the Android phone", () => {
  it("is drawn, never a picture: no manufacturer's artwork is borrowed", () => {
    const html = render({ children: <p>screen</p> });

    expect(html).not.toMatch(/<img\b|url\(/);
    expect(html).toContain("<svg");
  });

  it("shows its screen's content under an Android status bar: the time on the left, Wi-Fi, signal and battery on the right", () => {
    const html = render({ children: <p>Aurevo&apos;s card</p> });
    const bar = /<svg[^>]*data-status-bar[^>]*>([\s\S]*?)<\/svg>/.exec(html)?.[1] ?? "";

    expect(html).toContain("Aurevo&#x27;s card");
    expect(/<text[^>]*>(\d{1,2}:\d{2})<\/text>/.exec(bar)?.[1]).toBeTruthy();
    for (const glyph of ["wifi", "signal", "battery"]) expect(bar).toContain(`data-glyph="${glyph}"`);
  });

  it.each([
    ["light", "a light screen gets dark glyphs"],
    ["dark", "a dark screen gets light glyphs"],
  ] as const)("%s: %s", (statusBar) => {
    const html = render({ statusBar });
    const ink = /data-status-bar[^>]*fill="([^"]+)"/.exec(html)?.[1];

    expect(ink).toBe(statusBar === "light" ? "#1f1f1f" : "#ffffff");
  });

  it("is as wide as asked, as tall as its layout, and tells the screen where the bars end, as the iPhone does", () => {
    const html = render({ width: 220 });
    const { height, safeTop, safeBottom } = androidLayout(220);

    expect(html).toMatch(new RegExp(`^<div[^>]*style="width:220px;height:${height}px"`));
    expect(html).toContain(`--android-safe-top:${safeTop}px`);
    expect(html).toContain(`--android-safe-bottom:${safeBottom}px`);
  });
});

describe("androidLayout", () => {
  it("scales every measure with the width, so a phone drawn smaller is the same phone", () => {
    const full = androidLayout(440);
    const half = androidLayout(220);

    expect(half.height).toBeCloseTo(full.height / 2, 6);
    expect(half.screen.width).toBeCloseTo(full.screen.width / 2, 6);
    expect(half.screen.radius).toBeCloseTo(full.screen.radius / 2, 6);
    expect(half.safeTop).toBeCloseTo(full.safeTop / 2, 6);
  });

  it("is about the shape of a Pixel and close to the iPhone beside it, so the two stand as a pair", () => {
    const { height, screen } = androidLayout(300);

    expect(height / 300).toBeGreaterThan(2);
    expect(height / 300).toBeLessThan(2.15);
    expect(screen.height / screen.width).toBeGreaterThan(2.1);
  });
});
