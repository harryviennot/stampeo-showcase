import { splitAccent } from "./accent";

/** `text` with its `accent` words drawn in the accent colour. */
export function AccentText({ text, accent }: Readonly<{ text: string; accent: string }>) {
  const { before, accent: words, after } = splitAccent(text, accent);

  return (
    <>
      {before}
      <span className="text-[var(--accent)]">{words}</span>
      {after}
    </>
  );
}
