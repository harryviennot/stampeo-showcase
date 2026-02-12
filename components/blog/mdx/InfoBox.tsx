const styles = {
  tip: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "💡",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "ℹ️",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "⚠️",
  },
};

export function InfoBox({
  type = "info",
  title,
  children,
}: {
  type?: "tip" | "info" | "warning";
  title?: string;
  children: React.ReactNode;
}) {
  const style = styles[type];

  return (
    <div
      className={`my-6 p-5 rounded-xl border ${style.bg} ${style.border}`}
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
