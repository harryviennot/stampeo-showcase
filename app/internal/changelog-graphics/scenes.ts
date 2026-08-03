import type { ComponentType } from "react";
import { PointsLaunchScene } from "./scenes/PointsLaunchScene";

export interface Scene {
  /** Used in the ?scene= querystring and the downloaded filename. */
  id: string;
  title: string;
  /** Changelog release the graphic belongs to, e.g. "v2.0.0". */
  release: string;
  Component: ComponentType;
}

/**
 * One scene per changelog release. New release → add a component under
 * scenes/ and one entry here. Old scenes are never removed, so any past
 * graphic can be re-rendered and re-downloaded.
 */
export const SCENES: Scene[] = [
  {
    id: "points-launch",
    title: "Points loyalty program",
    release: "v2.0.0",
    Component: PointsLaunchScene,
  },
];
