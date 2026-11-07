/** The rows of the comparison table a reader has opened, by row id. Every change returns a new set. */
export type OpenRows = ReadonlySet<string>;

export function toggleRow(open: OpenRows, id: string): OpenRows {
  const next = new Set(open);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Is every one of the rows open? Never, when there is no row to open. */
export const allOpen = (open: OpenRows, ids: readonly string[]) => ids.length > 0 && ids.every((id) => open.has(id));

/** Opens every row, or closes every row when they are all open already. */
export const toggleAll = (open: OpenRows, ids: readonly string[]): OpenRows => (allOpen(open, ids) ? new Set() : new Set(ids));
