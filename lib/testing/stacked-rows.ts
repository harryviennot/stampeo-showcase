import { code } from "./jsx-source";

/** The `--stack-zoom` of every stacked picture in a render of `HoverRows`. */
export function stackZooms(html: string): number[] {
  return [...html.matchAll(/--stack-zoom:([\d.]+)/g)].map((match) => Number(match[1]));
}

/** The smallest font size, in drawn px, that a component's source sets in a class or a style. */
export function smallestLabelPx(file: string): number {
  const sizes = [...code(file).matchAll(/text-\[([\d.]+)px\]|fontSize:\s*([\d.]+)/g)].map((match) => Number(match[1] ?? match[2]));

  return Math.min(...sizes);
}
