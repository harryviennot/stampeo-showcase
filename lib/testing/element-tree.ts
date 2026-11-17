import { isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Every element of a React tree that `match` accepts, found without rendering: arrays, fragments and the
 * `children` of each element are walked, components are not called. For a route's default export, which returns
 * the elements it mounts: which page, with which props.
 */
export function findElements(node: ReactNode, match: (element: ReactElement<Record<string, unknown>>) => boolean): Array<ReactElement<Record<string, unknown>>> {
  if (Array.isArray(node)) return node.flatMap((child) => findElements(child, match));
  if (!isValidElement<Record<string, unknown>>(node)) return [];

  return [...(match(node) ? [node] : []), ...findElements(node.props.children as ReactNode, match)];
}

/** The elements of `type` in a tree, with their props. */
export const elementsOf = (node: ReactNode, type: unknown) => findElements(node, (element) => element.type === type);
