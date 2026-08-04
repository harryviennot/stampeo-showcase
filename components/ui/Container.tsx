type ContainerSize = "default" | "narrow";

interface ContainerProps {
  children: React.ReactNode;
  /** `narrow` is for reading columns — FAQ answers, the ROI calculator. */
  size?: ContainerSize;
  className?: string;
}

const sizeClasses: Record<ContainerSize, string> = {
  default: "max-w-[1200px]",
  narrow: "max-w-[840px]",
};

/**
 * The only content width on the site. Section edges line up when you scroll
 * because everything — landing, pricing, features — goes through here.
 */
export function Container({
  children,
  size = "default",
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto ${sizeClasses[size]} px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
