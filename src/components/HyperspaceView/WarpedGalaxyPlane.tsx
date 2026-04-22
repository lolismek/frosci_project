import { useMemo } from 'react';
import { DoubleSide, PlaneGeometry, type Texture } from 'three';
import { braneHeight } from './braneField';

interface WarpedGalaxyPlaneProps {
  size: number;
  texture: Texture;
}

/**
 * The galaxy plane IS the brane. Its shape is a fixed global property of
 * spacetime — a deterministic wrinkle pattern produced by `braneField.ts`.
 * It does NOT depend on which planets are selected or on the slider; this
 * matches what Randall-Sundrum / Chung-Freese predicts (the brane's
 * embedding is a cosmological given, not an observer-tunable dial).
 *
 * Coordinate note: the mesh is rotated [-π/2, 0, 0], which maps
 *   local (lx, ly, lz) → world (lx, lz, -ly)
 * then offset by [size/2, -0.01, size/2]. So:
 *   worldX = lx + size/2
 *   worldZ = -ly + size/2
 *   worldY = lz   (we set lz to lift the vertex up in world Y)
 */
export function WarpedGalaxyPlane({ size, texture }: WarpedGalaxyPlaneProps) {
  const geometry = useMemo(() => {
    const SEG = 160;
    const g = new PlaneGeometry(size, size, SEG, SEG);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      const worldX = lx + size / 2;
      const worldZ = -ly + size / 2;
      pos.setZ(i, braneHeight(worldX, worldZ));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [size]);

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
          opacity={0.22}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
