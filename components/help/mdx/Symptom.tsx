import type { ReactNode } from "react";
import { slug } from "github-slugger";

/**
 * One troubleshooting entry, always open. Its heading carries an id so an app
 * link can land on it (`/help/<slug>#<id>`); the id is set when the page is
 * compiled (lib/help/symptom-ids.ts), so repeats on one page stay distinct.
 */
export function Symptom({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  const headingId = id ?? slug(title);

  return (
    <section
      aria-labelledby={headingId}
      className="my-5 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4"
    >
      <h3 id={headingId} className="mb-2! mt-0! text-base! font-semibold! text-[var(--near-black)]">
        {title}
      </h3>
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{children}</div>
    </section>
  );
}
