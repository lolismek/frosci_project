import { useMemo } from 'react';
import { DoubleSide, PlaneGeometry, type Texture } from 'three';

interface WarpedGalaxyPlaneProps {
  size: number;
  texture: Texture;
  /** A and B are in the same grid coords as the planets. */
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  bulgeHeight: number;
}

/**
 * The galaxy plane IS the brane. We subdivide the mesh and displace its vertices
 * so the brane visibly bends upward into the bulk between A and B.
 *
 * Coordinate note: the mesh is rotated [-π/2, 0, 0], which maps
 *   local (lx, ly, lz) → world (lx, lz, -ly)
 * then offset by [size/2, -0.01, size/2]. So:
 *   worldX = lx + size/2
 *   worldZ = -ly + size/2
 *   worldY = lz   (we set lz to lift the vertex up in world Y)
 */
export function WarpedGalaxyPlane({
  size, texture, startX, startZ, endX, endZ, bulgeHeight,
}: WarpedGalaxyPlaneProps) {
  const geometry = useMemo(() => {
    const SEG = 128;
    const g = new PlaneGeometry(size, size, SEG, SEG);

    const dx = endX - startX;
    const dz = endZ - startZ;
    const lineLen = Math.sqrt(dx * dx + dz * dz);

    if (bulgeHeight < 0.01 || lineLen < 0.1) {
      g.computeVertexNormals();
      return g;
    }

    const ux = dx / lineLen;
    const uz = dz / lineLen;
    // Wide perpendicular falloff so the warp reads as a broad brane
    // deformation rather than a narrow ridge.
    const perpSigma = Math.max(size * 0.28, lineLen * 0.7);

    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      const worldX = lx + size / 2;
      const worldZ = -ly + size / 2;

      const relX = worldX - startX;
      const relZ = worldZ - startZ;
      const along = relX * ux + relZ * uz;
      const perp = relX * (-uz) + relZ * ux;

      // sin²(π·u): pinned to 0 at u=0 and u=1 (so A and B sit exactly on
      // the brane) AND has zero slope there, so the warped region meets
      // the flat plane smoothly with no visible cusp.
      const u = along / lineLen;
      let alongProfile = 0;
      if (u >= 0 && u <= 1) {
        const s = Math.sin(Math.PI * u);
        alongProfile = s * s;
      }
      const perpSoft = Math.exp(-(perp * perp) / (2 * perpSigma * perpSigma));

      pos.setZ(i, bulgeHeight * alongProfile * perpSoft);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [size, startX, startZ, endX, endZ, bulgeHeight]);

  return (
    <group>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, -0.01, size / 2]}
      >
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.55}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, -0.005, size / 2]}
      >
        <meshBasicMaterial
          color="#ff8855"
          wireframe
          transparent
          opacity={0.28}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Sample the warp at a given (x, z) world position — mirrors the vertex
 * displacement formula above. Returns the world-Y lift in grid units.
 */
export function sampleWarpHeight(
  worldX: number,
  worldZ: number,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  bulgeHeight: number,
  size: number,
): number {
  const dx = endX - startX;
  const dz = endZ - startZ;
  const lineLen = Math.sqrt(dx * dx + dz * dz);
  if (bulgeHeight < 0.01 || lineLen < 0.1) return 0;

  const ux = dx / lineLen;
  const uz = dz / lineLen;
  const perpSigma = Math.max(size * 0.28, lineLen * 0.7);

  const relX = worldX - startX;
  const relZ = worldZ - startZ;
  const along = relX * ux + relZ * uz;
  const perp = relX * (-uz) + relZ * ux;

  const u = along / lineLen;
  let alongProfile = 0;
  if (u >= 0 && u <= 1) {
    const s = Math.sin(Math.PI * u);
    alongProfile = s * s;
  }
  const perpSoft = Math.exp(-(perp * perp) / (2 * perpSigma * perpSigma));

  return bulgeHeight * alongProfile * perpSoft;
}
