export function AuthorCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-[var(--cream)] rounded-xl border border-white/50 mt-12">
      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-lg">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Building Stampeo — digital loyalty for local businesses.
        </p>
      </div>
    </div>
  );
}
