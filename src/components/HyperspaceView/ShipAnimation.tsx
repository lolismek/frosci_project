import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh, LineCurve3, Curve, MeshStandardMaterial } from 'three';
import { HalfEllipseCurve } from './ellipseCurve';

interface ShipAnimationProps {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  /** Y of the start endpoint (e.g. brane-surface height at A). */
  startY?: number;
  /** Y of the end endpoint (e.g. brane-surface height at B). */
  endY?: number;
  /** Ellipse semi-minor axis (grid units). Ignored for 'chord' shape. */
  semiMinor?: number;
  /** 0..1 slider value — drives ship speed uniformly across modes. */
  sliderValue: number;
  /** 'ellipse' = tachyonic half-ellipse diagram.
   *  'chord'   = brane-bulk straight chord. */
  shape: 'ellipse' | 'chord';
}

const TRANSIT_SECONDS_AT_MIN_SLIDER = 8;
const TRANSIT_SECONDS_AT_MAX_SLIDER = 1.6;
const REST_SECONDS = 0.6;
const FADE_SECONDS = 0.25;

/**
 * One-way warp loop: ship fades in at A, rides the curve to B, fades
 * out, rests briefly, repeats. No ping-pong — a return sweep would
 * imply the journey runs in reverse, which doesn't match either mode's
 * physics story.
 */
export function ShipAnimation({
  startX, startZ, endX, endZ,
  startY = 0, endY = 0,
  semiMinor = 0, sliderValue, shape,
}: ShipAnimationProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const phaseRef = useRef(0);

  const curve: Curve<Vector3> = useMemo(() => {
    if (shape === 'chord') {
      return new LineCurve3(
        new Vector3(startX, startY, startZ),
        new Vector3(endX, endY, endZ),
      );
    }
    return new HalfEllipseCurve(startX, startZ, endX, endZ, semiMinor);
  }, [shape, startX, startZ, endX, endZ, startY, endY, semiMinor]);

  const transitSeconds = useMemo(() => {
    const t = Math.max(0, Math.min(1, sliderValue));
    return TRANSIT_SECONDS_AT_MIN_SLIDER +
      (TRANSIT_SECONDS_AT_MAX_SLIDER - TRANSIT_SECONDS_AT_MIN_SLIDER) * t;
  }, [sliderValue]);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const cycle = transitSeconds + REST_SECONDS;
    phaseRef.current = (phaseRef.current + delta / cycle) % 1;
    const phaseSeconds = phaseRef.current * cycle;

    let t: number;
    let opacity: number;
    if (phaseSeconds < transitSeconds) {
      t = phaseSeconds / transitSeconds;
      if (phaseSeconds < FADE_SECONDS) {
        opacity = phaseSeconds / FADE_SECONDS;
      } else if (phaseSeconds > transitSeconds - FADE_SECONDS) {
        opacity = (transitSeconds - phaseSeconds) / FADE_SECONDS;
      } else {
        opacity = 1;
      }
    } else {
      t = 1;
      opacity = 0;
    }

    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    meshRef.current.position.copy(pos);
    meshRef.current.lookAt(pos.clone().add(tangent));
    materialRef.current.opacity = opacity;
    materialRef.current.emissiveIntensity = 1.5 * opacity;
  });

  if (shape === 'ellipse' && semiMinor <= 0) return null;

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.15, 0.5, 6]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#EFE7D4"
        emissive="#D9641F"
        emissiveIntensity={1.5}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
