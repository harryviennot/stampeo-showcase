import { Lightbulb, Info, AlertTriangle } from "lucide-react";

const icons = {
  tip: Lightbulb,
  info: Info,
  warning: AlertTriangle,
};

export function InfoBox({
  type = "info",
  title,
  children,
}: {
  type?: "tip" | "info" | "warning";
  children: React.ReactNode;
  title?: string;
}) {
  const Icon = icons[type];

  return (
    <div className="not-prose relative my-6 bg-white rounded-2xl blog-card-3d overflow-hidden">
      <Icon
        className="absolute top-4 right-4 text-[var(--accent)]"
        size={28}
        strokeWidth={2.5}
      />
      <div className="px-5 pt-4 pb-2 pr-14">
        <span className="text-lg font-bold text-[var(--near-black)]">
          {title ?? (type === "tip" ? "Astuce" : type === "info" ? "Info" : "Attention")}
        </span>
      </div>
      <div className="px-5 pb-5 text-lg leading-relaxed text-[var(--near-black)]/80">
        {children}
      </div>
    </div>
  );
}
