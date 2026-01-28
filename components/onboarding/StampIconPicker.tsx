"use client";

import {
  Check,
  Coffee,
  Star,
  Heart,
  Gift,
  ThumbsUp,
  Sparkle,
  Trophy,
  Crown,
  Lightning,
  Fire,
  Sun,
  Leaf,
  Flower,
  Diamond,
  Smiley,
  MusicNote,
  PawPrint,
  Scissors,
  ForkKnife,
  ShoppingBag,
  Percent,
} from "@phosphor-icons/react";
import type { ComponentType, SVGProps } from "react";

export type StampIconType =
  | "checkmark"
  | "coffee"
  | "star"
  | "heart"
  | "gift"
  | "thumbsup"
  | "sparkle"
  | "trophy"
  | "crown"
  | "lightning"
  | "fire"
  | "sun"
  | "leaf"
  | "flower"
  | "diamond"
  | "smiley"
  | "music"
  | "paw"
  | "scissors"
  | "food"
  | "shopping"
  | "percent";

type PhosphorIcon = ComponentType<SVGProps<SVGSVGElement> & { weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }>;

interface StampIconPickerProps {
  readonly value: StampIconType;
  readonly onChange: (icon: StampIconType) => void;
  readonly accentColor?: string;
}

const stampIcons: { id: StampIconType; label: string; Icon: PhosphorIcon }[] = [
  { id: "checkmark", label: "Check", Icon: Check },
  { id: "star", label: "Star", Icon: Star },
  { id: "heart", label: "Heart", Icon: Heart },
  { id: "sparkle", label: "Sparkle", Icon: Sparkle },
  { id: "coffee", label: "Coffee", Icon: Coffee },
  { id: "food", label: "Food", Icon: ForkKnife },
  { id: "shopping", label: "Shop", Icon: ShoppingBag },
  { id: "thumbsup", label: "Thumbs", Icon: ThumbsUp },
  { id: "smiley", label: "Smiley", Icon: Smiley },
  { id: "trophy", label: "Trophy", Icon: Trophy },
  { id: "crown", label: "Crown", Icon: Crown },
  { id: "diamond", label: "Diamond", Icon: Diamond },
  { id: "fire", label: "Fire", Icon: Fire },
  { id: "lightning", label: "Bolt", Icon: Lightning },
  { id: "sun", label: "Sun", Icon: Sun },
  { id: "leaf", label: "Leaf", Icon: Leaf },
  { id: "flower", label: "Flower", Icon: Flower },
  { id: "music", label: "Music", Icon: MusicNote },
  { id: "paw", label: "Paw", Icon: PawPrint },
  { id: "scissors", label: "Scissors", Icon: Scissors },
];

export function StampIconPicker({ value, onChange, accentColor = "#f97316" }: StampIconPickerProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-y-2 gap-x-1">
      {stampIcons.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 mx-auto"
          style={{
            backgroundColor: value === id ? accentColor : "var(--muted)",
          }}
          aria-label={`Select ${label} stamp icon`}
        >
          <Icon
            className={`w-4 h-4 ${value === id ? "text-white" : "text-[var(--foreground)]"}`}
            weight="bold"
          />
        </button>
      ))}
    </div>
  );
}

interface StampIconSvgProps {
  readonly icon: StampIconType;
  readonly className?: string;
  readonly color?: string;
}

const iconMap: Record<StampIconType, PhosphorIcon> = {
  checkmark: Check,
  coffee: Coffee,
  star: Star,
  heart: Heart,
  gift: Gift,
  thumbsup: ThumbsUp,
  sparkle: Sparkle,
  trophy: Trophy,
  crown: Crown,
  lightning: Lightning,
  fire: Fire,
  sun: Sun,
  leaf: Leaf,
  flower: Flower,
  diamond: Diamond,
  smiley: Smiley,
  music: MusicNote,
  paw: PawPrint,
  scissors: Scissors,
  food: ForkKnife,
  shopping: ShoppingBag,
  percent: Percent,
};

export function StampIconSvg({ icon, className = "w-4 h-4", color }: StampIconSvgProps) {
  const Icon = iconMap[icon] || Check;
  const weight = icon === "checkmark" ? "bold" : "fill";
  return <Icon className={className} weight={weight} style={color ? { color } : undefined} />;
}

// Reward Icon Picker - subset of icons suitable for the final reward stamp
interface RewardIconPickerProps {
  readonly value: StampIconType;
  readonly onChange: (icon: StampIconType) => void;
  readonly accentColor?: string;
}

const rewardIcons: { id: StampIconType; label: string; Icon: PhosphorIcon }[] = [
  { id: "gift", label: "Gift", Icon: Gift },
  { id: "trophy", label: "Trophy", Icon: Trophy },
  { id: "star", label: "Star", Icon: Star },
  { id: "crown", label: "Crown", Icon: Crown },
  { id: "diamond", label: "Diamond", Icon: Diamond },
  { id: "sparkle", label: "Sparkle", Icon: Sparkle },
  { id: "heart", label: "Heart", Icon: Heart },
  { id: "percent", label: "Discount", Icon: Percent },
];

export function RewardIconPicker({ value, onChange, accentColor = "#f97316" }: RewardIconPickerProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-y-2 gap-x-1">
      {rewardIcons.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 mx-auto"
          style={{
            backgroundColor: value === id ? accentColor : "var(--muted)",
          }}
          aria-label={`Select ${label} reward icon`}
        >
          <Icon
            className={`w-4 h-4 ${value === id ? "text-white" : "text-[var(--foreground)]"}`}
            weight="bold"
          />
        </button>
      ))}
    </div>
  );
}
