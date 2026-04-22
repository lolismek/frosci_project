import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CubicBezierCurve3, Vector3, Mesh, LineCurve3 } from 'three';

interface ShipAnimationProps {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  arcHeight: number;
  animSpeed: number;
  /** Y-offset of the start endpoint (e.g. brane-surface height at A). */
  startY?: number;
  /** Y-offset of the end endpoint (e.g. brane-surface height at B). */
  endY?: number;
  /** 'sequential' = sharp ascent, plateau, sharp descent.
   *  'smooth' = symmetric bulge.
   *  'chord' = straight line (brane-bulk chord through bulk). */
  shape?: 'sequential' | 'smooth' | 'chord';
  /** Ping-pong back and forth vs one-way loop. */
  roundTrip?: boolean;
}

export function ShipAnimation({
  startX, startZ, endX, endZ, arcHeight, animSpeed,
  startY = 0, endY = 0,
  shape = 'sequential', roundTrip = true,
}: ShipAnimationProps) {
  const meshRef = useRef<Mesh>(null);
  const progressRef = useRef(0);
  const directionRef = useRef(1);

  const curve = useMemo(() => {
    const start = new Vector3(startX, startY, startZ);
    const end = new Vector3(endX, endY, endZ);

    if (shape === 'chord') {
      return new LineCurve3(start, end);
    }

    const dx = endX - startX;
    const dz = endZ - startZ;
    const t1 = shape === 'sequential' ? 0.08 : 0.25;
    const t2 = shape === 'sequential' ? 0.92 : 0.75;
    const ctrl1 = new Vector3(startX + dx * t1, arcHeight, startZ + dz * t1);
    const ctrl2 = new Vector3(startX + dx * t2, arcHeight, startZ + dz * t2);
    return new CubicBezierCurve3(start, ctrl1, ctrl2, end);
  }, [startX, startZ, endX, endZ, arcHeight, startY, endY, shape]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    progressRef.current += directionRef.current * delta * animSpeed * 0.15;

    if (roundTrip) {
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        directionRef.current = -1;
      } else if (progressRef.current <= 0) {
        progressRef.current = 0;
        directionRef.current = 1;
      }
    } else {
      if (progressRef.current > 1) progressRef.current -= 1;
    }

    const pos = curve.getPointAt(progressRef.current);
    const tangent = curve.getTangentAt(progressRef.current);
    meshRef.current.position.copy(pos);
    meshRef.current.lookAt(pos.clone().add(tangent));
  });

  if (shape !== 'chord' && arcHeight <= 0) return null;

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.15, 0.5, 6]} />
      <meshStandardMaterial color="#ffffff" emissive="#88ccff" emissiveIntensity={1.5} />
    </mesh>
  );
}
