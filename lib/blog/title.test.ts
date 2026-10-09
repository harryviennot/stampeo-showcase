import { describe, expect, it } from "bun:test";
import { getAllPosts } from "./index";
import { BLOG_LOCALES } from "./locales";
import { BRAND_SUFFIX, postTitle, type PostTitle } from "./title";

/** The `<title>` a browser and a search result show for a post. */
const rendered = (title: PostTitle) =>
  typeof title === "string" ? `${title}${BRAND_SUFFIX}` : title.absolute;

describe("postTitle", () => {
  it.each([
    ["Apple Wallet Loyalty Card: Guide for Your Business", "Apple Wallet Loyalty Card: Guide for Your Business | Stampeo"],
    ["Coffee Shop Loyalty Card: How to Keep Customers Coming Back", "Coffee Shop Loyalty Card: How to Keep Customers Coming Back"],
  ])("renders %p as %p", (title, shown) => {
    expect(rendered(postTitle(title))).toBe(shown);
  });

  it("keeps the brand exactly up to 60 characters", () => {
    expect(postTitle("x".repeat(60 - BRAND_SUFFIX.length))).toBe("x".repeat(50));
    expect(postTitle("x".repeat(61 - BRAND_SUFFIX.length))).toEqual({ absolute: "x".repeat(51) });
  });
});

describe.each(BLOG_LOCALES)("%s posts", (locale) => {
  const posts = getAllPosts(locale);

  it.each(posts.map((post) => [post.slug, post] as const))("%s: title and description", (_slug, post) => {
    expect(`${post.title}\n${post.description}`).not.toContain("—");
    const shown = rendered(postTitle(post.title));
    expect({ shown, length: shown.length <= 70 }).toEqual({ shown, length: true });
  });
});
