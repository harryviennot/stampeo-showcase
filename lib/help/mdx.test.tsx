/**
 * A help page as the reader gets it: MDX compiled with the help components and
 * rendered to HTML.
 */

import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { loadCatalog } from "@/lib/testing/catalogs";
import { restoreEnvAfterEach } from "@/lib/testing/restore-env";
import { compileHelpMDX } from "./mdx";

const CATALOG = loadCatalog("en");

/** A page as the reader gets it, with the chrome strings of `messages` (the English catalog by default). */
const render = async (source: string, messages = CATALOG) =>
  renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={messages}
      onError={(error) => {
        throw error;
      }}
    >
      {await compileHelpMDX(source)}
    </NextIntlClientProvider>
  );
const idsOf = (html: string) => [...html.matchAll(/<h[23][^>]*\bid="([^"]+)"/g)].map((m) => m[1]);

describe("Symptom", () => {
  test("is always open and its title is a heading with an id to link to", async () => {
    const html = await render(
      `<Symptom title="They never got the email">\n\nCheck the spam folder.\n\n</Symptom>\n`
    );

    expect(html).toContain("Check the spam folder.");
    expect(html).not.toContain("<details");
    expect(idsOf(html)).toEqual(["they-never-got-the-email"]);
  });

  test("gets its id the way a heading does: lower case, no punctuation, words joined by dashes", async () => {
    const html = await render(
      `<Symptom title="The message says &#x22;Couldn't export your customer list&#x22;">\n\nWait.\n\n</Symptom>\n`
    );

    expect(idsOf(html)).toEqual(["the-message-says-couldnt-export-your-customer-list"]);
  });

  test("two with the same title, or the title of a section heading, still get distinct ids", async () => {
    const source = [
      "## My team is full",
      "",
      '<Symptom title="My team is full">',
      "",
      "One.",
      "",
      "</Symptom>",
      "",
      '<Symptom title="My team is full">',
      "",
      "Two.",
      "",
      "</Symptom>",
    ].join("\n");

    expect(idsOf(await render(source))).toEqual(["my-team-is-full", "my-team-is-full-1", "my-team-is-full-2"]);
  });
});

describe("Callout", () => {
  test("a note and a warning say which they are", async () => {
    const html = await render(
      [
        '<Callout type="note">',
        "The code works once.",
        "</Callout>",
        "",
        '<Callout type="warning">',
        "You can't undo a removal.",
        "</Callout>",
      ].join("\n")
    );

    expect(html).toMatch(/Note[\s\S]*The code works once\./);
    expect(html).toMatch(/Warning[\s\S]*You can&#x27;t undo a removal\./);
  });

  test("a plain Markdown quote is shown as a callout too", async () => {
    const html = await render("> Only the owner can open **Settings**.\n");

    expect(html).toContain("<blockquote");
    expect(html).toContain("Only the owner can open <strong>Settings</strong>.");
  });
});

describe("the chrome strings", () => {
  const translated = {
    ...CATALOG,
    help: {
      ...CATALOG.help,
      callout: { note: "Remarque", warning: "Attention" },
      openInDashboard: "Ouvrir dans le tableau de bord",
    },
  };

  test("a callout's label and the dashboard button's default label come from the catalog", async () => {
    const html = await render(
      ['<Callout type="warning">', "Careful.", "</Callout>", "", '<OpenInDashboard path="/team" />'].join("\n"),
      translated
    );

    expect(html).toContain("Attention");
    expect(html).not.toContain("Warning");
    expect(html).toContain("Ouvrir dans le tableau de bord");
  });
});

describe("Details", () => {
  test("is a native details element, closed until opened, so find-in-page still works", async () => {
    const html = await render(`<Details summary="They already scan for another shop">\n\nNo second account.\n\n</Details>\n`);

    expect(html).toContain("<details");
    expect(html).not.toContain("<details open");
    expect(html).toContain("<summary");
    expect(html).toContain("They already scan for another shop");
    expect(html).toContain("No second account.");
  });
});

describe("OpenInDashboard", () => {
  restoreEnvAfterEach("NEXT_PUBLIC_APP_URL");

  test("opens the dashboard screen in a new tab", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.test/";

    const html = await render(`<OpenInDashboard path="/team" label="Open Team" />\n`);

    expect(html).toContain('href="https://app.example.test/team"');
    expect(html).toContain('target="_blank"');
    expect(html).toMatch(/rel="noopener/);
    expect(html).toContain("Open Team");
    expect(html).toContain("w-full sm:w-auto");
  });

  test("goes to the production dashboard when the app url is not set", async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(await render(`<OpenInDashboard path="/team" label="Open Team" />\n`)).toContain(
      'href="https://app.stampeo.app/team"'
    );
  });
});

describe("Screenshot", () => {
  test("keeps the image's own proportions, even for a 804x248 strip, and loads lazily", async () => {
    const html = await render("![The top of the Customers page](/help/export-your-customer-list-01.png)\n");

    expect(html).toContain('width="804"');
    expect(html).toContain('height="248"');
    expect(html).toContain('alt="The top of the Customers page"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("object-cover");
  });

  test("an image under 900px wide is a phone shot: narrow, centred, rounded", async () => {
    const html = await render("![The join screen](/help/add-a-team-member-05.png)\n");

    expect(html).toContain("max-w-[300px]");
    expect(html).toContain("mx-auto");
    expect(html).toContain("rounded-2xl");
  });

  test.each([
    ["wider than tall", "add-a-team-member-01.png"],
    ["taller than wide", "add-a-team-member-02.png"],
  ])("a desktop capture %s fills the column's width", async (_shape, file) => {
    const html = await render(`![The Team page](/help/${file})\n`);

    expect(html).not.toContain("max-w-[300px]");
    expect(html).toContain("rounded-xl");
  });

  test.each([
    ["a phone capture", "add-a-team-member-05.png", "desktop", false],
    ["a desktop capture", "add-a-team-member-01.png", "phone", true],
  ])("the device can be said outright: %s as %s", async (_case, file, device, narrow) => {
    const html = await render(`<Screenshot src="/help/${file}" alt="x" device="${device}" />\n`);

    expect(html.includes("max-w-[300px]")).toBe(narrow);
  });

  test("an image that is not in public/help stops the build", async () => {
    await expect(render("![x](/help/not-a-shot.png)\n")).rejects.toThrow("/help/not-a-shot.png");
  });
});

describe("links and headings", () => {
  test("help links stay plain, site pages go to English, other sites open in a new tab", async () => {
    const html = await render(
      "[Roles](/help/roles), [Pricing](/pricing) and [Example](https://example.com).\n"
    );

    expect(html).toContain('<a href="/help/roles">Roles</a>');
    expect(html).toContain('<a href="/en/pricing">Pricing</a>');
    expect(html).toMatch(/<a href="https:\/\/example\.com"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  });

  test("a ## section keeps its id for links and takes its size from the article, not a heading class", async () => {
    const html = await render("Intro.\n\n## Add a scanner\n\nText.\n");

    expect(html).toMatch(/<h2[^>]*\bid="add-a-scanner"/);
    expect(html).not.toMatch(/<h2[^>]*\bclass="[^"]*text-(h1|h2|h3|display)/);
  });

  test("a wide table scrolls inside its own box instead of widening the page", async () => {
    const html = await render("| A | B |\n|---|---|\n| 1 | 2 |\n");

    expect(html).toMatch(/<div[^>]*overflow-x-auto[^>]*><table/);
  });
});
