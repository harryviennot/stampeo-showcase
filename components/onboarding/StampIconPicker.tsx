"use client";

import {
  Alien,
  Armchair,
  Axe,
  Baby,
  Balloon,
  Basket,
  Basketball,
  BeerStein,
  Bicycle,
  Bone,
  Book,
  BowlingBall,
  Bread,
  Bus,
  Campfire,
  Cat,
  Check,
  Coffee,
  CoffeeBean,
  Confetti,
  Cookie,
  Crown,
  CurrencyCircleDollar,
  CurrencyDollar,
  CurrencyEur,
  CurrencyGbp,
  Diamond,
  DiscoBall,
  Dog,
  Dress,
  EyeClosed,
  Eyeglasses,
  FilmSlate,
  Fire,
  Flag,
  FlagBannerFold,
  Flame,
  Flower,
  FlowerTulip,
  FlyingSaucer,
  Footprints,
  ForkKnife,
  GameController,
  Ghost,
  Gift,
  Globe,
  Golf,
  GraduationCap,
  Guitar,
  Hamburger,
  HandHeart,
  HandPeace,
  HandWaving,
  Headphones,
  Heart,
  HighHeel,
  IceCream,
  Key,
  Laptop,
  Leaf,
  Lightbulb,
  Lightning,
  Martini,
  Megaphone,
  Money,
  MusicNote,
  MusicNotes,
  PaintBrushHousehold,
  Pants,
  PawPrint,
  Percent,
  PiggyBank,
  Pizza,
  Popcorn,
  RocketLaunch,
  Scissors,
  SealCheck,
  SealPercent,
  ShootingStar,
  ShoppingBag,
  ShoppingCartSimple,
  SketchLogo,
  Smiley,
  SmileyWink,
  Sneaker,
  Sparkle,
  Stamp,
  Star,
  Sun,
  Sunglasses,
  Tag,
  TeaBag,
  ThumbsUp,
  Ticket,
  TipJar,
  Trophy,
  TShirt,
  VinylRecord,
} from "@phosphor-icons/react";
import type { ComponentType, SVGProps } from "react";

type PhosphorIcon = ComponentType<
  SVGProps<SVGSVGElement> & {
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  }
>;

/**
 * Canonical icon registry, mirrored from the web repo's
 * src/components/design/StampIconPicker.tsx. The `id` is the cross-system
 * contract: it must match the SVG filename in backend/assets/icons/ and the
 * web registry. New icons use the Phosphor kebab name; legacy ids
 * (checkmark, food, music, paw, shopping, thumbsup, tea) stay as-is.
 */
export const stampIcons: { id: string; label: string; Icon: PhosphorIcon }[] = [
  // Food & drink
  { id: "coffee", label: "Coffee", Icon: Coffee },
  { id: "coffee-bean", label: "Coffee bean", Icon: CoffeeBean },
  { id: "tea", label: "Tea", Icon: TeaBag },
  { id: "bread", label: "Bread", Icon: Bread },
  { id: "food", label: "Food", Icon: ForkKnife },
  { id: "hamburger", label: "Burger", Icon: Hamburger },
  { id: "pizza", label: "Pizza", Icon: Pizza },
  { id: "cookie", label: "Cookie", Icon: Cookie },
  { id: "ice-cream", label: "Ice cream", Icon: IceCream },
  { id: "popcorn", label: "Popcorn", Icon: Popcorn },
  { id: "beer-stein", label: "Beer", Icon: BeerStein },
  { id: "martini", label: "Cocktail", Icon: Martini },
  // Activities & leisure
  { id: "basketball", label: "Basketball", Icon: Basketball },
  { id: "bowling-ball", label: "Bowling", Icon: BowlingBall },
  { id: "golf", label: "Golf", Icon: Golf },
  { id: "bicycle", label: "Bicycle", Icon: Bicycle },
  { id: "game-controller", label: "Gaming", Icon: GameController },
  { id: "guitar", label: "Guitar", Icon: Guitar },
  { id: "headphones", label: "Headphones", Icon: Headphones },
  { id: "music", label: "Music note", Icon: MusicNote },
  { id: "music-notes", label: "Music notes", Icon: MusicNotes },
  { id: "vinyl-record", label: "Vinyl", Icon: VinylRecord },
  { id: "disco-ball", label: "Disco ball", Icon: DiscoBall },
  { id: "film-slate", label: "Cinema", Icon: FilmSlate },
  { id: "campfire", label: "Campfire", Icon: Campfire },
  { id: "book", label: "Book", Icon: Book },
  { id: "graduation-cap", label: "Graduation", Icon: GraduationCap },
  { id: "ticket", label: "Ticket", Icon: Ticket },
  // Retail & fashion
  { id: "shopping", label: "Shopping bag", Icon: ShoppingBag },
  { id: "shopping-cart-simple", label: "Cart", Icon: ShoppingCartSimple },
  { id: "basket", label: "Basket", Icon: Basket },
  { id: "tag", label: "Tag", Icon: Tag },
  { id: "dress", label: "Dress", Icon: Dress },
  { id: "pants", label: "Pants", Icon: Pants },
  { id: "t-shirt", label: "T-shirt", Icon: TShirt },
  { id: "sneaker", label: "Sneaker", Icon: Sneaker },
  { id: "high-heel", label: "High heel", Icon: HighHeel },
  { id: "sunglasses", label: "Sunglasses", Icon: Sunglasses },
  { id: "eyeglasses", label: "Glasses", Icon: Eyeglasses },
  { id: "armchair", label: "Armchair", Icon: Armchair },
  { id: "key", label: "Key", Icon: Key },
  // Beauty & nature
  { id: "scissors", label: "Scissors", Icon: Scissors },
  { id: "eye-closed", label: "Lashes", Icon: EyeClosed },
  { id: "paint-brush-household", label: "Paint brush", Icon: PaintBrushHousehold },
  { id: "flower", label: "Flower", Icon: Flower },
  { id: "flower-tulip", label: "Tulip", Icon: FlowerTulip },
  { id: "leaf", label: "Leaf", Icon: Leaf },
  { id: "sun", label: "Sun", Icon: Sun },
  { id: "sparkle", label: "Sparkle", Icon: Sparkle },
  // Animals
  { id: "paw", label: "Paw", Icon: PawPrint },
  { id: "cat", label: "Cat", Icon: Cat },
  { id: "dog", label: "Dog", Icon: Dog },
  { id: "bone", label: "Bone", Icon: Bone },
  { id: "footprints", label: "Footprints", Icon: Footprints },
  // People & smileys
  { id: "smiley", label: "Smiley", Icon: Smiley },
  { id: "smiley-wink", label: "Wink", Icon: SmileyWink },
  { id: "thumbsup", label: "Thumbs up", Icon: ThumbsUp },
  { id: "hand-waving", label: "Waving hand", Icon: HandWaving },
  { id: "hand-peace", label: "Peace", Icon: HandPeace },
  { id: "hand-heart", label: "Caring hand", Icon: HandHeart },
  { id: "heart", label: "Heart", Icon: Heart },
  { id: "baby", label: "Baby", Icon: Baby },
  { id: "ghost", label: "Ghost", Icon: Ghost },
  // Money & rewards
  { id: "gift", label: "Gift", Icon: Gift },
  { id: "trophy", label: "Trophy", Icon: Trophy },
  { id: "crown", label: "Crown", Icon: Crown },
  { id: "diamond", label: "Diamond", Icon: Diamond },
  { id: "star", label: "Star", Icon: Star },
  { id: "percent", label: "Percent", Icon: Percent },
  { id: "seal-percent", label: "Discount seal", Icon: SealPercent },
  { id: "seal-check", label: "Check seal", Icon: SealCheck },
  { id: "money", label: "Money", Icon: Money },
  { id: "currency-dollar", label: "Dollar", Icon: CurrencyDollar },
  { id: "currency-circle-dollar", label: "Dollar coin", Icon: CurrencyCircleDollar },
  { id: "currency-eur", label: "Euro", Icon: CurrencyEur },
  { id: "currency-gbp", label: "Pound", Icon: CurrencyGbp },
  { id: "piggy-bank", label: "Piggy bank", Icon: PiggyBank },
  { id: "tip-jar", label: "Tip jar", Icon: TipJar },
  // Symbols & misc
  { id: "checkmark", label: "Check", Icon: Check },
  { id: "confetti", label: "Confetti", Icon: Confetti },
  { id: "balloon", label: "Balloon", Icon: Balloon },
  { id: "shooting-star", label: "Shooting star", Icon: ShootingStar },
  { id: "sketch-logo", label: "Gem", Icon: SketchLogo },
  { id: "lightning", label: "Bolt", Icon: Lightning },
  { id: "fire", label: "Fire", Icon: Fire },
  { id: "flame", label: "Flame", Icon: Flame },
  { id: "megaphone", label: "Megaphone", Icon: Megaphone },
  { id: "lightbulb", label: "Lightbulb", Icon: Lightbulb },
  { id: "rocket-launch", label: "Rocket", Icon: RocketLaunch },
  { id: "flying-saucer", label: "Flying saucer", Icon: FlyingSaucer },
  { id: "alien", label: "Alien", Icon: Alien },
  { id: "globe", label: "Globe", Icon: Globe },
  { id: "flag", label: "Flag", Icon: Flag },
  { id: "flag-banner-fold", label: "Banner", Icon: FlagBannerFold },
  { id: "stamp", label: "Stamp", Icon: Stamp },
  { id: "laptop", label: "Laptop", Icon: Laptop },
  { id: "bus", label: "Bus", Icon: Bus },
  { id: "axe", label: "Axe", Icon: Axe },
];

export type StampIconType = (typeof stampIcons)[number]["id"];

const iconMap: Record<string, PhosphorIcon> = Object.fromEntries(
  stampIcons.map(({ id, Icon }) => [id, Icon]),
);

interface StampIconPickerProps {
  readonly value: StampIconType;
  readonly onChange: (icon: StampIconType) => void;
  readonly accentColor?: string;
}

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
  { id: "confetti", label: "Confetti", Icon: Confetti },
  { id: "balloon", label: "Balloon", Icon: Balloon },
  { id: "seal-percent", label: "Discount seal", Icon: SealPercent },
  { id: "seal-check", label: "Check seal", Icon: SealCheck },
  { id: "ticket", label: "Ticket", Icon: Ticket },
  { id: "shooting-star", label: "Shooting star", Icon: ShootingStar },
  { id: "tip-jar", label: "Tip jar", Icon: TipJar },
  { id: "sketch-logo", label: "Gem", Icon: SketchLogo },
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
