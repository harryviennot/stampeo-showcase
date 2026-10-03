import type { MDXComponents } from "mdx/types";
import { BlogLink } from "./BlogLink";
import { CallToAction } from "./CallToAction";
import { InfoBox } from "./InfoBox";
import { ImageWithCaption } from "./ImageWithCaption";
import { Highlight } from "./Highlight";
import { StatBox } from "./StatBox";
import { Heading } from "./Heading";
import { FAQItem } from "./FAQItem";
import { PointsCardStyles } from "./PointsCardStyles";

export const mdxComponents: MDXComponents = {
  h2: (props) => Heading({ level: 2, ...props }),
  h3: (props) => Heading({ level: 3, ...props }),
  a: BlogLink,
  CallToAction,
  InfoBox,
  ImageWithCaption,
  Highlight,
  StatBox,
  FAQItem,
  PointsCardStyles,
};
