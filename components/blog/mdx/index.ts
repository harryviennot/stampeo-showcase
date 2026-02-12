import type { MDXComponents } from "mdx/types";
import { CallToAction } from "./CallToAction";
import { InfoBox } from "./InfoBox";
import { ImageWithCaption } from "./ImageWithCaption";
import { Highlight } from "./Highlight";
import { StatBox } from "./StatBox";
import { Heading } from "./Heading";

export const mdxComponents: MDXComponents = {
  h2: (props) => Heading({ level: 2, ...props }),
  h3: (props) => Heading({ level: 3, ...props }),
  CallToAction,
  InfoBox,
  ImageWithCaption,
  Highlight,
  StatBox,
};
