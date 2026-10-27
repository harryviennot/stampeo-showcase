/**
 * The real help content under content/help/en: what the build would publish.
 * A page that cannot load, link, compile or find its images fails here, before a reader sees it.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { serialize } from "next-mdx-remote/serialize";
import { getAllHelpPages, getHelpPage } from "./index";
import { findContentProblems } from "./integrity";
import { helpMdxOptions } from "./mdx";

const PUBLIC_DIR = join(import.meta.dir, "..", "..", "public");
const imageExists = (src: string) => existsSync(join(PUBLIC_DIR, src));

const pages = getAllHelpPages({ includeDrafts: true });

describe("the help content", () => {
  test("includes the pages moved over from the old docs folder", () => {
    for (const slug of [
      "roles",
      "add-a-team-member",
      "manage-a-team-member",
      "remove-a-team-member",
      "export-your-customer-list",
      "set-your-time-zone",
      "change-your-business-name-logo-and-color",
      "update-your-opening-hours-and-contact-details",
      "understanding-your-analytics",
    ]) {
      expect(getHelpPage(slug)).not.toBeNull();
    }
  });

  test("every link, related page and image resolves, and nothing points at /docs/", () => {
    expect(findContentProblems(pages, imageExists)).toEqual([]);
  });

  test("every page compiles as MDX", async () => {
    for (const page of pages) {
      await expect(serialize(page.content, helpMdxOptions, true)).resolves.toBeDefined();
    }
  });

  test("a production load leaves the drafts out and keeps every published page", () => {
    const published = getAllHelpPages({ includeDrafts: false });

    expect(published.some((page) => page.draft)).toBe(false);
    expect(published).toEqual(pages.filter((page) => !page.draft));
  });
});
