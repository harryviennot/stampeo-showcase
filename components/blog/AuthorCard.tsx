export function AuthorCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-5 p-8 bg-white rounded-2xl border-2 border-[var(--near-black)]/10 mt-12">
      <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl shrink-0">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div>
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Building Stampeo — digital loyalty for local businesses.
        </p>
      </div>
    </div>
  );
}
