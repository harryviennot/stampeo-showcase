import type { Tile } from "@/lib/landing-pages/copy/types";

/** A grid of light tiles, each a short title and a line: `columns` sets how many sit in a row at each width. */
export function LevelFactTiles({ tiles, columns }: Readonly<{ tiles: readonly Tile[]; columns: string }>) {
  return (
    <ul className={`mx-auto grid max-w-[1040px] gap-4 ${columns}`}>
      {tiles.map((tile) => (
        <li key={tile.title} className="rounded-3xl bg-white/70 p-6 ring-1 ring-black/5">
          <h3 className="text-h3 text-balance text-[var(--foreground)]">{tile.title}</h3>
          <p className="mt-2 text-base text-pretty text-[var(--muted-foreground)]">{tile.body}</p>
        </li>
      ))}
    </ul>
  );
}
