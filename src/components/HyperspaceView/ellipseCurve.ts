import { Curve, Vector3 } from 'three';

/**
 * Half-ellipse in the plane spanned by the A→B ground direction and
 * world-up (+Y). Parameter t ∈ [0, 1] sweeps θ ∈ [0, π] so t=0 sits at
 * A (on the ground), t=1 at B (on the ground), t=0.5 at the apex
 * (semiMinor above the midpoint).
 *
 * This is the visual shape used for the tachyonic "rapidity Wick
 * rotation" diagram. It is NOT a trajectory a ship physically
 * traverses — the actual tachyonic worldline is a straight spacelike
 * line from A to B. See relativity.ts tachyonic header.
 */
export class HalfEllipseCurve extends Curve<Vector3> {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  semiMinor: number;

  constructor(startX: number, startZ: number, endX: number, endZ: number, semiMinor: number) {
    super();
    this.startX = startX;
    this.startZ = startZ;
    this.endX = endX;
    this.endZ = endZ;
    this.semiMinor = semiMinor;
  }

  getPoint(t: number, target: Vector3 = new Vector3()): Vector3 {
    const theta = Math.PI * t;
    // Ground-plane linear interpolation maps θ=0→A, θ=π→B.
    const u = 0.5 * (1 - Math.cos(theta));
    const x = this.startX + (this.endX - this.startX) * u;
    const z = this.startZ + (this.endZ - this.startZ) * u;
    const y = this.semiMinor * Math.sin(theta);
    return target.set(x, y, z);
  }
}
