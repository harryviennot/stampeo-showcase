import type { ComponentPropsWithoutRef } from "react";

const styles: Record<number, string> = {
  2: "text-[1.875rem] md:text-[2.25rem] lg:text-[3rem] font-extrabold text-[var(--near-black)] tracking-tight leading-[1.1] mt-12 mb-2 [&>a]:text-inherit [&>a]:no-underline",
  3: "text-[1.5rem] md:text-[1.875rem] lg:text-[2.25rem] font-extrabold text-[var(--near-black)] tracking-tight leading-[1.1] mt-8 mb-1.5 [&>a]:text-inherit [&>a]:no-underline",
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
