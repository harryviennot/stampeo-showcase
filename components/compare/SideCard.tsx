import type { ComponentPropsWithoutRef } from "react";

export type Side = "competitor" | "stampeo";

/** The competitor's element comes first at every width, whichever the page wrote first. */
export const sideOrder = (side: Side) => (side === "competitor" ? "order-1" : "order-2");

const SURFACE = {
  /** The brand's drawn-ink card, for the two "Choose X if" cards. */
  ink: "card-stamp",
  /** A soft white card with a hairline border. */
  soft: "border border-[var(--border)]",
} as const;

type SideCardProps = {
  side: Side;
  tone: keyof typeof SURFACE;
  as?: "div" | "section";
} & ComponentPropsWithoutRef<"div">;

/** The white card shared by "Choose X if", the price cards and the strengths: one surface, either product. */
export function SideCard({ side, tone, as: Tag = "div", className = "", ...rest }: SideCardProps) {
  const classes = ["not-prose flex flex-col rounded-2xl bg-white p-5 sm:p-6", SURFACE[tone], sideOrder(side), className];

  return <Tag {...rest} className={classes.filter(Boolean).join(" ")} />;
}
