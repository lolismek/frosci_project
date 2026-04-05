import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CubicBezierCurve3, Vector3, Mesh } from 'three';

interface ShipAnimationProps {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  arcHeight: number;
  animSpeed: number;
}

export function ShipAnimation({ startX, startZ, endX, endZ, arcHeight, animSpeed }: ShipAnimationProps) {
  const meshRef = useRef<Mesh>(null);
  const progressRef = useRef(0);

  const curve = useMemo(() => {
    const start = new Vector3(startX, 0, startZ);
    const end = new Vector3(endX, 0, endZ);
    const dx = endX - startX;
    const dz = endZ - startZ;
    const ctrl1 = new Vector3(startX + dx * 0.25, arcHeight, startZ + dz * 0.25);
    const ctrl2 = new Vector3(startX + dx * 0.75, arcHeight, startZ + dz * 0.75);
    return new CubicBezierCurve3(start, ctrl1, ctrl2, end);
  }, [startX, startZ, endX, endZ, arcHeight]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    progressRef.current += delta * animSpeed * 0.15;
    if (progressRef.current > 1) progressRef.current -= 1;

    const pos = curve.getPointAt(progressRef.current);
    const tangent = curve.getTangentAt(progressRef.current);
    meshRef.current.position.copy(pos);
    meshRef.current.lookAt(pos.clone().add(tangent));
  });

  if (arcHeight <= 0) return null;

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.15, 0.5, 6]} />
      <meshStandardMaterial color="#ffffff" emissive="#88ccff" emissiveIntensity={1.5} />
    </mesh>
  );
}
