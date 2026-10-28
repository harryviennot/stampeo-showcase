/**
 * Apple's iPhone 17 Pro bezel (Cosmic Orange, Apple's iOS 27 design library,
 * via the Figma ad kit muYbyN9LptU9xNpBVITY0v node 200:619; the same file as
 * promo-videos `assets/devices/iphone-17-pro-cosmic-orange.png`). Apple's terms
 * allow scaling it, never altering it. Measures are in points; the PNG is @3x.
 */
export const IPHONE = {
  bezel: {
    src: "/images/devices/iphone-17-pro-cosmic-orange.png",
    width: 1350,
    height: 2760,
    sha256: "99dd842e1f0f55106329cb72486231e6275c76d8ff266f12402be5c0c35ec417",
  },
  frame: { width: 450, height: 920 },
  /** The transparent screen hole: the simulator's 402×874 pt screen. */
  screen: { x: 24, y: 23, width: 402, height: 874, radius: 63 },
  /** The device body without its side buttons, for the drop shadow. */
  body: { x: 8, y: 7, width: 434, height: 906, radius: 80 },
  /** iOS's safe-area insets on this screen. */
  safeTop: 62,
  safeBottom: 34,
} as const;

/** Real iOS status bars from the promo simulator (promo-videos `tools/sim/status-bar.ts`), 1206×186 px. */
export const STATUS_BARS = {
  /** Black glyphs, for light screens. */
  light: "/images/devices/status-bar-light.png",
  /** White glyphs, for dark screens. */
  dark: "/images/devices/status-bar-dark.png",
  /** White glyphs without the time: a lock screen shows its own big clock. */
  lock: "/images/devices/status-bar-lock.png",
} as const;

export type StatusBar = keyof typeof STATUS_BARS;

/** Every measure of the device drawn `width` CSS px wide. */
export function iphoneLayout(width: number) {
  const s = width / IPHONE.frame.width;
  const { screen, body } = IPHONE;
  return {
    scale: s,
    height: IPHONE.frame.height * s,
    screen: { left: screen.x * s, top: screen.y * s, width: screen.width * s, height: screen.height * s, radius: screen.radius * s },
    body: { left: body.x * s, top: body.y * s, width: body.width * s, height: body.height * s, radius: body.radius * s },
    safeTop: IPHONE.safeTop * s,
    safeBottom: IPHONE.safeBottom * s,
  };
}
