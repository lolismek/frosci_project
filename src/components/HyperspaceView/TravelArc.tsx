import { useMemo } from 'react';
import { CubicBezierCurve3, Vector3 } from 'three';
import { Line } from '@react-three/drei';

interface TravelArcProps {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  arcHeight: number;
  color: string;
  /** 'sequential' = sharp ascent, plateau, sharp descent (canon-matching jump).
   *  'smooth' = symmetric bulge (legacy look). */
  shape?: 'sequential' | 'smooth';
}

export function TravelArc({ startX, startZ, endX, endZ, arcHeight, color, shape = 'sequential' }: TravelArcProps) {
  const points = useMemo(() => {
    const start = new Vector3(startX, 0, startZ);
    const end = new Vector3(endX, 0, endZ);

    const dx = endX - startX;
    const dz = endZ - startZ;

    // Sequential: control points close to endpoints horizontally at full height → ship
    // rockets up at A, cruises at hyperspace plateau, drops down at B.
    // Smooth: old symmetric bulge at 25%/75%.
    const t1 = shape === 'sequential' ? 0.08 : 0.25;
    const t2 = shape === 'sequential' ? 0.92 : 0.75;

    const ctrl1 = new Vector3(startX + dx * t1, arcHeight, startZ + dz * t1);
    const ctrl2 = new Vector3(startX + dx * t2, arcHeight, startZ + dz * t2);

    const curve = new CubicBezierCurve3(start, ctrl1, ctrl2, end);
    return curve.getPoints(64);
  }, [startX, startZ, endX, endZ, arcHeight, shape]);

  if (arcHeight <= 0) return null;

  return (
    <>
      <Line points={points} color={color} lineWidth={3} transparent opacity={0.9} />
      <Line points={points} color={color} lineWidth={8} transparent opacity={0.15} />
      <Line
        points={[[startX, 0, startZ], [startX, arcHeight * 0.3, startZ]]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.15}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Line
        points={[[endX, 0, endZ], [endX, arcHeight * 0.3, endZ]]}
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
