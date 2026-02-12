const styles = {
  tip: {
    bg: "bg-emerald-50/70",
    border: "border-emerald-500",
    icon: "💡",
  },
  info: {
    bg: "bg-blue-50/70",
    border: "border-blue-500",
    icon: "ℹ️",
  },
  warning: {
    bg: "bg-amber-50/70",
    border: "border-amber-500",
    icon: "⚠️",
  },
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
  const style = styles[type];

  return (
    <div
      className={`my-6 p-5 rounded-r-xl border-l-4 ${style.bg} ${style.border}`}
    >
      {title && (
        <p className="font-bold mb-1">
          {style.icon} {title}
        </p>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
