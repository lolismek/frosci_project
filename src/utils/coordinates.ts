import type { Planet } from '../types';
import { LY_PER_GRID_UNIT } from './constants';

/** Calculate the Euclidean distance between two planets in grid units */
export function gridDistance(a: Planet, b: Planet): number {
  const dx = a.trueX - b.trueX;
  const dy = a.trueY - b.trueY;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Convert grid distance to light-years */
export function gridToLightYears(gridDist: number): number {
  return gridDist * LY_PER_GRID_UNIT;
}

/** Calculate distance between two planets in light-years */
export function distanceLY(a: Planet, b: Planet): number {
  return gridToLightYears(gridDistance(a, b));
}

/** Convert grid coordinates to canvas pixel coordinates */
export function gridToPixel(
  gridX: number,
  gridY: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  pixelsPerGridUnit: number
): { x: number; y: number } {
  return {
    x: gridX * pixelsPerGridUnit * scale + offsetX,
    y: gridY * pixelsPerGridUnit * scale + offsetY,
  };
}
