import type { MDXComponents } from "mdx/types";
import { Heading } from "@/components/blog/mdx/Heading";
import { Callout } from "./Callout";
import { Details } from "./Details";
import { HelpLink } from "./HelpLink";
import { OpenInDashboard } from "./OpenInDashboard";
import { Screenshot } from "./Screenshot";
import { Symptom } from "./Symptom";

// The blog's heading, with a plain `###`; the `##` size and spacing come from
// `.help-prose h2`. Important on the `###`, so the article's desktop prose size
// (lg:prose-lg) does not enlarge it.
const SECTION = "text-[var(--near-black)] [&>a]:text-inherit [&>a]:no-underline";
const SUBSECTION =
  "text-lg! font-semibold! text-[var(--near-black)] mt-6! mb-1.5! [&>a]:text-inherit [&>a]:no-underline";

/** The components a help page's MDX can use, plus the overrides for plain Markdown. */
export const helpMdxComponents: MDXComponents = {
  h2: (props) => <Heading level={2} {...props} className={SECTION} />,
  h3: (props) => <Heading level={3} {...props} className={SUBSECTION} />,
  a: HelpLink,
  img: ({ src, alt }) => (typeof src === "string" ? <Screenshot src={src} alt={alt} /> : null),
  // A screenshot between steps splits the list in two; the second list starts at
  // its own number, so its step circles (a CSS counter) start there too.
  ol: ({ start, style, ...props }) => (
    <ol
      start={start}
      style={start && start > 1 ? { ...style, counterReset: `step ${start - 1}` } : style}
      {...props}
    />
  ),
  // A wide table scrolls inside its own box instead of widening the page.
  table: (props) => (
    <div className="my-6 overflow-x-auto [&>table]:my-0">
      <table {...props} />
    </div>
  ),
  Callout,
  Details,
  OpenInDashboard,
  Screenshot,
  Symptom,
};
