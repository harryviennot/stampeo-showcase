import type { ComponentPropsWithoutRef } from "react";

const styles: Record<number, string> = {
  2: "text-h2 text-[var(--near-black)] mt-12 mb-2 [&>a]:text-inherit [&>a]:no-underline",
  3: "text-h3 text-[var(--near-black)] mt-8 mb-1.5 [&>a]:text-inherit [&>a]:no-underline",
};

export function Heading({
  level,
  children,
  ...props
}: { level: 2 | 3 } & ComponentPropsWithoutRef<"h2">) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={styles[level]} {...props}>
      {children}
    </Tag>
  );
}
