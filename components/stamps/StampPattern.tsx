import { CircleStamp, StarStamp, HeartStamp } from "./StampIcons";

const stampColors = {
  coral: "#f97316",
  pink: "#ec4899",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  teal: "#14b8a6",
  green: "#22c55e",
  yellow: "#eab308",
};

interface StampPatternProps {
  className?: string;
  density?: "sparse" | "normal" | "dense";
}

// Decorative stamp pattern - can be used as background decoration
export function StampPattern({ className = "", density = "normal" }: StampPatternProps) {
  const patterns = {
    sparse: [
      { type: "circle", color: stampColors.coral, x: "5%", y: "10%", size: 32, opacity: 0.15 },
      { type: "star", color: stampColors.yellow, x: "85%", y: "20%", size: 28, opacity: 0.12 },
      { type: "heart", color: stampColors.pink, x: "15%", y: "80%", size: 24, opacity: 0.1 },
      { type: "circle", color: stampColors.blue, x: "90%", y: "75%", size: 20, opacity: 0.12 },
    ],
    normal: [
      { type: "circle", color: stampColors.coral, x: "5%", y: "10%", size: 32, opacity: 0.15 },
      { type: "star", color: stampColors.yellow, x: "85%", y: "15%", size: 28, opacity: 0.12 },
      { type: "heart", color: stampColors.pink, x: "10%", y: "45%", size: 24, opacity: 0.1 },
      { type: "circle", color: stampColors.teal, x: "92%", y: "50%", size: 26, opacity: 0.12 },
      { type: "star", color: stampColors.violet, x: "8%", y: "85%", size: 22, opacity: 0.1 },
      { type: "heart", color: stampColors.green, x: "88%", y: "80%", size: 28, opacity: 0.12 },
    ],
    dense: [
      { type: "circle", color: stampColors.coral, x: "3%", y: "8%", size: 32, opacity: 0.15 },
      { type: "star", color: stampColors.yellow, x: "25%", y: "5%", size: 24, opacity: 0.1 },
      { type: "heart", color: stampColors.pink, x: "75%", y: "10%", size: 28, opacity: 0.12 },
      { type: "circle", color: stampColors.blue, x: "95%", y: "20%", size: 22, opacity: 0.1 },
      { type: "star", color: stampColors.violet, x: "5%", y: "40%", size: 26, opacity: 0.12 },
      { type: "heart", color: stampColors.teal, x: "92%", y: "45%", size: 24, opacity: 0.1 },
      { type: "circle", color: stampColors.green, x: "8%", y: "70%", size: 28, opacity: 0.12 },
      { type: "star", color: stampColors.coral, x: "30%", y: "90%", size: 22, opacity: 0.1 },
      { type: "heart", color: stampColors.yellow, x: "70%", y: "85%", size: 26, opacity: 0.12 },
      { type: "circle", color: stampColors.pink, x: "90%", y: "75%", size: 24, opacity: 0.1 },
    ],
  };

  const stamps = patterns[density];

  const StampComponents = {
    circle: CircleStamp,
    star: StarStamp,
    heart: HeartStamp,
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {stamps.map((stamp, index) => {
        const StampComponent = StampComponents[stamp.type as keyof typeof StampComponents];
        return (
          <div
            key={index}
            className="absolute"
            style={{
              left: stamp.x,
              top: stamp.y,
              opacity: stamp.opacity,
              transform: `rotate(${(index * 23) % 360}deg)`,
            }}
          >
            <StampComponent color={stamp.color} size={stamp.size} />
          </div>
        );
      })}
    </div>
  );
}

// Single decorative stamp for corners or accents
interface DecorativeStampProps {
  type?: "circle" | "star" | "heart";
  color?: string;
  size?: number;
  className?: string;
  rotation?: number;
  opacity?: number;
}

export function DecorativeStamp({
  type = "circle",
  color = stampColors.coral,
  size = 48,
  className = "",
  rotation = 0,
  opacity = 0.15,
}: DecorativeStampProps) {
  const StampComponents = {
    circle: CircleStamp,
    star: StarStamp,
    heart: HeartStamp,
  };

  const StampComponent = StampComponents[type];

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity,
      }}
    >
      <StampComponent color={color} size={size} />
    </div>
  );
}
