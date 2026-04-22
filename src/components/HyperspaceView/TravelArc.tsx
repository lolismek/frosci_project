import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { HalfEllipseCurve } from './ellipseCurve';

interface TravelArcProps {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  /** Imaginary-axis semi-axis in grid units. Semi-major is derived from |AB|/2. */
  semiMinor: number;
  color: string;
}

/**
 * Half-ellipse visualizing the rapidity Wick rotation for v > c.
 * At v → c⁺ the semi-minor axis → 0 and the curve collapses onto the
 * A→B line; at very high v it becomes a tall arc. See ellipseCurve.ts
 * and the tachyonic header in relativity.ts.
 */
export function TravelArc({ startX, startZ, endX, endZ, semiMinor, color }: TravelArcProps) {
  const points = useMemo(() => {
    const curve = new HalfEllipseCurve(startX, startZ, endX, endZ, semiMinor);
    return curve.getPoints(96);
  }, [startX, startZ, endX, endZ, semiMinor]);

  if (semiMinor <= 0) return null;

  return (
    <>
      <Line points={points} color={color} lineWidth={3} transparent opacity={0.9} />
      <Line points={points} color={color} lineWidth={8} transparent opacity={0.15} />
      <Line
        points={[[startX, 0, startZ], [startX, semiMinor * 0.25, startZ]]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.15}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Line
        points={[[endX, 0, endZ], [endX, semiMinor * 0.25, endZ]]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.15}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
    </>
  );
}
