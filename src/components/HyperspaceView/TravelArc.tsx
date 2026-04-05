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
}

export function TravelArc({ startX, startZ, endX, endZ, arcHeight, color }: TravelArcProps) {
  const points = useMemo(() => {
    const start = new Vector3(startX, 0, startZ);
    const end = new Vector3(endX, 0, endZ);

    const dx = endX - startX;
    const dz = endZ - startZ;

    const ctrl1 = new Vector3(startX + dx * 0.25, arcHeight, startZ + dz * 0.25);
    const ctrl2 = new Vector3(startX + dx * 0.75, arcHeight, startZ + dz * 0.75);

    const curve = new CubicBezierCurve3(start, ctrl1, ctrl2, end);
    return curve.getPoints(64);
  }, [startX, startZ, endX, endZ, arcHeight]);

  if (arcHeight <= 0) return null;

  return (
    <>
      {/* Main arc */}
      <Line
        points={points}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.9}
      />
      {/* Glow arc */}
      <Line
        points={points}
        color={color}
        lineWidth={8}
        transparent
        opacity={0.15}
      />
      {/* Vertical guides at start and end */}
      <Line
        points={[
          [startX, 0, startZ],
          [startX, arcHeight * 0.3, startZ],
        ]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.15}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Line
        points={[
          [endX, 0, endZ],
          [endX, arcHeight * 0.3, endZ],
        ]}
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
