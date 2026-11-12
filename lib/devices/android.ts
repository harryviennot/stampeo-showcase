/**
 * A generic Pixel-like Android phone, drawn in CSS and SVG (no manufacturer's
 * artwork). Measures are in CSS px at the frame's natural width; the screen is
 * a 20:9-ish display behind a thin, even bezel.
 */
export const ANDROID = {
  frame: { width: 440, height: 920 },
  /** The body without its side buttons: a metal band, then the black glass. */
  body: { x: 4, y: 4, width: 428, height: 912, radius: 62, band: 3.5 },
  screen: { x: 15, y: 15, width: 406, height: 890, radius: 50 },
  /** The punch-hole camera, centred, from the screen's top. */
  camera: { top: 17, diameter: 24 },
  /** Power then volume, on the right edge. */
  buttons: [
    { top: 210, height: 72 },
    { top: 318, height: 136 },
  ],
  /** The status bar's height, and the strip the gesture bar sits in. */
  safeTop: 52,
  safeBottom: 26,
} as const;

/** "light" is for a light screen (dark glyphs), "dark" for a dark one, as `IPhone`'s status bars. */
export type AndroidStatusBar = "light" | "dark";

/** Every measure of the phone drawn `width` CSS px wide. */
export function androidLayout(width: number) {
  const s = width / ANDROID.frame.width;
  const { body, screen, camera } = ANDROID;
  return {
    scale: s,
    height: ANDROID.frame.height * s,
    body: { left: body.x * s, top: body.y * s, width: body.width * s, height: body.height * s, radius: body.radius * s, band: body.band * s },
    screen: { left: screen.x * s, top: screen.y * s, width: screen.width * s, height: screen.height * s, radius: screen.radius * s },
    camera: { top: camera.top * s, diameter: camera.diameter * s },
    buttons: ANDROID.buttons.map((button) => ({ top: button.top * s, height: button.height * s })),
    safeTop: ANDROID.safeTop * s,
    safeBottom: ANDROID.safeBottom * s,
  };
}
