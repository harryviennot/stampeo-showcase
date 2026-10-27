/**
 * The help center's categories: one folder each under content/help/en/, shown
 * on the help home in this order. A category is navigation only and never part
 * of a page's URL. No `fs`: client components may import it.
 */

export interface HelpCategory {
  /** The folder name under content/help/en/. */
  slug: string;
  /** What the reader sees. */
  name: string;
  /** One line under the name. */
  description: string;
}

export const HELP_CATEGORIES: readonly HelpCategory[] = [
  {
    slug: "get-started",
    name: "Get started",
    description: "Your account, your card and your first customers.",
  },
  {
    slug: "at-the-counter",
    name: "Scanning at the counter",
    description: "The scanner app: adding stamps and points, rewards and errors.",
  },
  {
    slug: "getting-customers",
    name: "Getting customers",
    description: "Your QR code, your flyer and your sign-up form.",
  },
  {
    slug: "your-customers",
    name: "Your customers",
    description: "Finding customers, fixing their cards and exporting your list.",
  },
  {
    slug: "your-card",
    name: "Your card and rewards",
    description: "Your reward, your card style and your program rules.",
  },
  {
    slug: "messages",
    name: "Messages to your customers",
    description: "Lock-screen messages and broadcasts.",
  },
  {
    slug: "analytics",
    name: "Your numbers",
    description: "What your analytics show and how to read them.",
  },
  {
    slug: "team",
    name: "Your team",
    description: "Adding people, roles and access.",
  },
  {
    slug: "locations",
    name: "Locations",
    description: "Running your card across several locations.",
  },
  {
    slug: "plan-and-billing",
    name: "Plan and billing",
    description: "Your plan, your trial and your payments.",
  },
  {
    slug: "account-and-settings",
    name: "Account and settings",
    description: "Your business details, languages and account.",
  },
  {
    slug: "fix-a-problem",
    name: "Fix a problem",
    description: "What to do when something doesn't work.",
  },
  {
    slug: "for-your-customers",
    name: "For your customers",
    description: "Pages to send your customers.",
  },
  {
    slug: "guides",
    name: "Guides",
    description: "Playbooks for getting more from your card.",
  },
];

export function getHelpCategory(slug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((category) => category.slug === slug);
}
