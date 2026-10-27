import { highlight } from "@/lib/help/search/score";

/** `text` with the words the reader typed marked, in the blog's own highlight colour. */
export function Highlight({ text, tokens }: { text: string; tokens: readonly string[] }) {
  return (
    <>
      {highlight(text, tokens).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-sm bg-[var(--highlight-yellow)] text-inherit">
            {part.text}
          </mark>
        ) : (
          part.text
        )
      )}
    </>
  );
}
