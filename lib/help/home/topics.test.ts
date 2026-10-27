/**
 * How the help center's pages are grouped for its home and topic pages: which
 * topics exist, which the home lists, which doors lead somewhere.
 */

import { describe, expect, test } from "bun:test";
import { getAllHelpPages } from "../index";
import {
  HOME_TOPIC_LINKS,
  HOME_TOPIC_MIN_PAGES,
  groupTopics,
  homeTopics,
  otherTopics,
  topicFor,
  visibleDoors,
} from "./topics";
import type { HelpPage } from "../types";

const stub = (slug: string, category: string) => ({ slug, category, title: slug }) as HelpPage;

const PAGES = [
  stub("create-your-account", "get-started"),
  stub("how-stampeo-works", "get-started"),
  stub("stamps-or-points", "get-started"),
  stub("add-stamps", "at-the-counter"),
  stub("roles", "team"),
  stub("add-a-team-member", "team"),
  stub("remove-a-team-member", "team"),
  stub("manage-a-team-member", "team"),
  stub("set-your-time-zone", "account-and-settings"),
];

describe("topics", () => {
  test("a topic exists for every category that has a page, in the category table's order", () => {
    expect(groupTopics(PAGES).map((topic) => [topic.category.slug, topic.pages.length])).toEqual([
      ["get-started", 3],
      ["at-the-counter", 1],
      ["team", 4],
      ["account-and-settings", 1],
    ]);
  });

  test("a topic lists the popular pages first, then the rest in order", () => {
    const team = topicFor(groupTopics(PAGES), "team");

    expect(team?.pages.map((page) => page.slug)).toEqual([
      "add-a-team-member",
      "roles",
      "remove-a-team-member",
      "manage-a-team-member",
    ]);
  });

  test("an unknown category has no topic", () => {
    expect(topicFor(groupTopics(PAGES), "guides")).toBeUndefined();
  });

  test(`the home lists a topic from ${HOME_TOPIC_MIN_PAGES} pages up`, () => {
    expect(homeTopics(groupTopics(PAGES)).map((topic) => topic.category.slug)).toEqual(["get-started", "team"]);
  });

  test("the other topics are the rest, in order", () => {
    expect(otherTopics(groupTopics(PAGES), "team").map((topic) => topic.category.slug)).toEqual([
      "get-started",
      "at-the-counter",
      "account-and-settings",
    ]);
  });
});

describe("the doors", () => {
  test("a door leads to a topic that has pages, and is left out until it does", () => {
    const doors = visibleDoors(groupTopics(PAGES));

    expect(doors.map((door) => [door.key, door.category])).toEqual([
      ["setup", "get-started"],
      ["counter", "at-the-counter"],
    ]);
  });

  test("all three show once their topics exist", () => {
    const withShare = [...PAGES, stub("get-the-loyalty-card", "for-your-customers")];

    expect(visibleDoors(groupTopics(withShare)).map((door) => door.key)).toEqual(["setup", "counter", "customers"]);
  });
});

describe("the real help pages", () => {
  const topics = groupTopics(getAllHelpPages());

  test("every topic page lists a page that exists, and the home card shows at most four links", () => {
    expect(topics.length).toBeGreaterThan(0);
    for (const topic of topics) expect(topic.pages.length).toBeGreaterThan(0);
    expect(HOME_TOPIC_LINKS).toBe(4);
  });

  test("the first two doors lead somewhere", () => {
    expect(visibleDoors(topics).map((door) => door.key)).toEqual(expect.arrayContaining(["setup", "counter"]));
  });
});
