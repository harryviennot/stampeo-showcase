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
  { id: "gift", label: "Gift", Icon: Gift },
  { id: "shopping", label: "Shop", Icon: ShoppingBag },
  { id: "thumbsup", label: "Thumbs", Icon: ThumbsUp },
  { id: "smiley", label: "Smiley", Icon: Smiley },
  { id: "trophy", label: "Trophy", Icon: Trophy },
  { id: "crown", label: "Crown", Icon: Crown },
  { id: "diamond", label: "Diamond", Icon: Diamond },
  { id: "percent", label: "Percent", Icon: Percent },
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
    <div className="space-y-3">
      <div className="flex flex-wrap  gap-2">
        {stampIcons.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`
              w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200
              hover:scale-110
             
            `}
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
      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Want a custom stamp icon? Request one in your dashboard after signup
      </p>
    </div>
  );
}

interface StampIconSvgProps {
  readonly icon: StampIconType;
  readonly className?: string;
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

export function StampIconSvg({ icon, className = "w-4 h-4" }: StampIconSvgProps) {
  const Icon = iconMap[icon] || Check;
  return <Icon className={className} weight="fill" />;
}
