export function StatBox({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="my-6 p-6 text-center bg-white rounded-2xl blog-card-3d">
      <p className="text-4xl font-extrabold text-[var(--accent)] mb-1">
        {value}
      </p>
      <p className="text-sm text-[var(--muted-foreground)] font-medium">
        {label}
      </p>
    </div>
  );
}
