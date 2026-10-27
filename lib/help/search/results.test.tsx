/**
 * What a reader sees under the search field: the popular pages before they
 * type, the matches while they type, and a way forward when nothing matches.
 */

import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { HelpSearchResults } from "@/components/help/search/HelpSearchResults";
import type { HelpSearch } from "@/components/help/search/use-help-search";
import { queryTokens, searchHelp } from "./score";
import type { SearchEntry } from "./types";
import { loadCatalog } from "@/lib/testing/catalogs";

const ENTRIES: SearchEntry[] = [
  {
    slug: "add-a-team-member",
    title: "Add a team member",
    description: "Add a scanner with a join code or an admin with an email link.",
    category: "Your team",
    keywords: ["employee"],
    headings: [],
  },
  {
    slug: "add-stamps",
    title: "Add stamps to a customer's card",
    description: "Scan a card and add one stamp, or several at once.",
    category: "Scanning at the counter",
    keywords: [],
    headings: [],
  },
];

function searchFor(query: string, overrides: Partial<HelpSearch> = {}): HelpSearch {
  return {
    status: "ready",
    query,
    tokens: queryTokens(query),
    hits: searchHelp(ENTRIES, query),
    popular: ENTRIES,
    load: () => {},
    ...overrides,
  };
}

const render = (search: HelpSearch) =>
  renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={loadCatalog("en")}
      onError={(error) => {
        throw error;
      }}
    >
      <HelpSearchResults search={search} activeIndex={0} listId="s" />
    </NextIntlClientProvider>
  );

const textOf = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

describe("before the reader types", () => {
  test("the popular pages are offered, as titles", () => {
    const html = render(searchFor(""));

    expect(textOf(html)).toContain("Popular");
    expect(html).toContain('href="/help/add-a-team-member"');
    expect(html).toContain('href="/help/add-stamps"');
  });
});

describe("while the reader types", () => {
  test("each match shows its category, its title and its description, with the typed word marked", () => {
    const html = render(searchFor("employee"));

    expect(textOf(html)).toContain("Your team");
    expect(textOf(html)).toContain("Add a team member");
    expect(html).not.toContain('href="/help/add-stamps"');

    const marked = render(searchFor("scan"));
    expect(marked).toMatch(/<mark[^>]*>scan<\/mark>/);
  });

  test("the first match is the active row", () => {
    expect(render(searchFor("add"))).toMatch(/id="s-0"[^>]*>/);
  });
});

describe("when nothing matches", () => {
  const html = render(searchFor("qzxwvk"));
  const text = textOf(html);

  test("the query is echoed back, with another word to try", () => {
    expect(text).toMatch(/No page matches “qzxwvk”\s*\./);
    expect(text).toContain("Try another word");
  });

  test("email and WhatsApp are offered, and the phone call is not", () => {
    expect(html).toContain("mailto:support@stampeo.app");
    expect(html).toContain("https://wa.me/33649370470");
    expect(html).not.toContain("tel:");
  });

  test("a query with markup in it is shown as text, not run", () => {
    const hostile = render(searchFor("<img src=x onerror=alert(1)>"));

    expect(hostile).not.toContain("<img");
    expect(hostile).toContain("&lt;img");
  });
});

describe("when the index cannot be fetched", () => {
  test("says so and still offers a person to ask", () => {
    const html = render(searchFor("team", { status: "error", hits: [] }));

    expect(textOf(html)).toContain("Search is not available right now.");
    expect(html).toContain("mailto:support@stampeo.app");
  });
});

describe("while the index loads", () => {
  test("shows nothing rather than a false no-result", () => {
    expect(render(searchFor("team", { status: "loading", hits: [] }))).toBe("");
  });
});
