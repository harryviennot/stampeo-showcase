import type { ProgramType } from "./types";

/** Stamps, points and levels, as the Features tabs and the Platform rows describe them. */
export const PROGRAM_TYPES: ProgramType[] = [
  {
    key: "stamps",
    label: "Stamps",
    eyebrow: "Reward every visit",
    title: "Stamps",
    body: "Every visit adds a stamp, and a full card earns the reward. Staff can add several stamps in one scan.",
    facts: [{ text: "Extra stamps can roll over to the next reward" }, { text: "A welcome gift to start them off" }],
    plan: "Every plan",
  },
  {
    key: "points",
    label: "Points",
    eyebrow: "Reward what they spend",
    title: "Points",
    body: "Staff type in what they spent and the points add up. Customers pick from your reward menu, in any order.",
    facts: [{ text: "Points never expire" }, { text: "Bonus points on bigger baskets", plan: "Growth and Pro" }],
    plan: "Every plan",
  },
  {
    key: "levels",
    label: "Levels",
    eyebrow: "Reward regulars more",
    title: "Levels",
    body: "Up to 5 levels, like Bronze, Silver and Gold. Customers move up as they keep coming back, and their card takes on a new look.",
    facts: [{ text: "Perks for each level, shown to staff at the register" }, { text: "A gift when they move up" }],
    plan: "Every plan",
  },
];

/** The tab control's accessible name; the visible heading above it is the section's. */
export const PROGRAM_TABS_LABEL = "Program type";

/** Said once under the program types. */
export const PROGRAM_SWITCH_LINE =
  "Start with stamps or points and switch later. Customers keep the card they already have.";
