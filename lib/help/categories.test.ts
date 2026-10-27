import { expect, test } from "bun:test";
import { HELP_CATEGORIES, getHelpCategory } from "./categories";

test("the categories are the inventory's folders, in the order the help home shows them", () => {
  expect(HELP_CATEGORIES.map((category) => category.slug)).toEqual([
    "get-started",
    "at-the-counter",
    "getting-customers",
    "your-customers",
    "your-card",
    "messages",
    "analytics",
    "team",
    "locations",
    "plan-and-billing",
    "account-and-settings",
    "fix-a-problem",
    "for-your-customers",
    "guides",
  ]);
});

test("each category has a name and a one-line description a reader can scan", () => {
  for (const category of HELP_CATEGORIES) {
    expect(category.name.length).toBeGreaterThan(0);
    expect(category.description.endsWith(".")).toBe(true);
  }
  expect(getHelpCategory("at-the-counter")?.name).toBe("Scanning at the counter");
  expect(getHelpCategory("nope")).toBeUndefined();
});
