import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import { DoubleSide } from 'three';
import { usePlanetStore } from '../../stores/usePlanetStore';
import {
  sliderToSpeed,
  calculateTachyonicTravel,
  sliderToShortcutFactor,
  calculateBraneBulkTravel,
} from '../../utils/relativity';
import { distanceLY } from '../../utils/coordinates';
import { createGalaxyPlaneTexture } from './galaxyPlaneTexture';
import { TravelArc } from './TravelArc';
import { ShipAnimation } from './ShipAnimation';
import { WarpedGalaxyPlane } from './WarpedGalaxyPlane';

const GALAXY_SIZE = 21; // grid units

export function HyperspaceView() {
  const { selectedPlanets, speedSlider, interpretationMode } = usePlanetStore();
  const [planetA, planetB] = selectedPlanets;

  const speed = sliderToSpeed(speedSlider);
  const distance = planetA && planetB ? distanceLY(planetA, planetB) : 0;

  const tachyonicResult = useMemo(() => {
    if (!distance || speed <= 1) return null;
    return calculateTachyonicTravel(distance, speed);
  }, [distance, speed]);

  const shortcutFactor = sliderToShortcutFactor(speedSlider);
  const braneBulkResult = useMemo(() => {
    if (!distance || shortcutFactor <= 1) return null;
    return calculateBraneBulkTravel(distance, shortcutFactor);
  }, [distance, shortcutFactor]);

  const galaxyTexture = useMemo(() => createGalaxyPlaneTexture(), []);

  const tachyonicActive = interpretationMode === 'tachyonic' && tachyonicResult !== null;
  const braneBulkActive = interpretationMode === 'brane-bulk' && braneBulkResult !== null;

  const arcHeight = tachyonicActive ? tachyonicResult!.arcHeight : 0;
  const bulgeHeight = braneBulkActive ? braneBulkResult!.bulgeHeightGrid : 0;
  const effectiveHeight = Math.max(arcHeight, bulgeHeight);

  const targetX = planetA && planetB ? (planetA.trueX + planetB.trueX) / 2 : GALAXY_SIZE / 2;
  const targetZ = planetA && planetB ? (planetA.trueY + planetB.trueY) / 2 : GALAXY_SIZE / 2;

  return (
    <Canvas
      camera={{
        position: [targetX + 12, 10 + effectiveHeight * 0.5, targetZ + 12],
        fov: 50,
        near: 0.1,
        far: 200,
      }}
      style={{ background: '#050510' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 20, 10]} intensity={0.8} />

      <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />

      {/* Galaxy brane — warps in brane-bulk mode, flat otherwise */}
      {braneBulkActive && planetA && planetB ? (
        <WarpedGalaxyPlane
          size={GALAXY_SIZE}
          texture={galaxyTexture}
          startX={planetA.trueX}
          startZ={planetA.trueY}
          endX={planetB.trueX}
          endZ={planetB.trueY}
          bulgeHeight={bulgeHeight}
        />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GALAXY_SIZE / 2, -0.01, GALAXY_SIZE / 2]}>
          <planeGeometry args={[GALAXY_SIZE, GALAXY_SIZE]} />
          <meshBasicMaterial map={galaxyTexture} transparent opacity={0.85} side={DoubleSide} />
        </mesh>
      )}

      {/* Vertical axis label */}
      {effectiveHeight > 0 && (
        <>
          <Line
            points={[[targetX, 0, targetZ], [targetX, effectiveHeight + 2, targetZ]]}
            color={tachyonicActive ? '#4FC3F7' : '#FFD166'}
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
            dashSize={0.3}
            gapSize={0.2}
          />
          <Html
            position={[targetX, effectiveHeight + 2.5, targetZ]}
            center
            style={{
              color: tachyonicActive ? '#4FC3F7' : '#FFD166',
              fontSize: '11px',
              fontFamily: 'system-ui',
              whiteSpace: 'nowrap',
              opacity: 0.75,
              pointerEvents: 'none',
            }}
          >
            {tachyonicActive ? 'Imaginary Dimension' : 'Bulk Dimension'}
          </Html>
        </>
      )}

      {/* Planet markers */}
      {planetA && <PlanetMarker x={planetA.trueX} z={planetA.trueY} name={planetA.Name} />}
      {planetB && <PlanetMarker x={planetB.trueX} z={planetB.trueY} name={planetB.Name} />}

      {/* --- BRANE-BULK MODE --- */}
      {braneBulkActive && planetA && planetB && (
        <>
          {/* Bulk chord: a straight line through 3D space from A to B,
              cutting under the warped galaxy plane */}
          <Line
            points={[
              [planetA.trueX, 0.05, planetA.trueY],
              [planetB.trueX, 0.05, planetB.trueY],
            ]}
            color="#FFD700"
            lineWidth={4}
            transparent
            opacity={1}
          />
          {/* Ship on the chord — ship travels at c locally, takes the straight path */}
          <ShipAnimation
            startX={planetA.trueX}
            startZ={planetA.trueY}
            endX={planetB.trueX}
            endZ={planetB.trueY}
            arcHeight={0}
            animSpeed={0.6}
            shape="chord"
            roundTrip
          />
        </>
      )}

      {/* --- TACHYONIC MODE (legacy, preserved via toggle) --- */}
      {!braneBulkActive && planetA && planetB && (
        <Line
          points={[
            [planetA.trueX, 0.02, planetA.trueY],
            [planetB.trueX, 0.02, planetB.trueY],
          ]}
          color="#FFD700"
          lineWidth={1.5}
          transparent
          opacity={0.3}
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
      )}
      {tachyonicActive && planetA && planetB && (
        <>
          <TravelArc
            startX={planetA.trueX}
            startZ={planetA.trueY}
            endX={planetB.trueX}
            endZ={planetB.trueY}
            arcHeight={arcHeight}
            color="#4FC3F7"
            shape="sequential"
          />
          <ShipAnimation
            startX={planetA.trueX}
            startZ={planetA.trueY}
            endX={planetB.trueX}
            endZ={planetB.trueY}
            arcHeight={arcHeight}
            animSpeed={0.05 + speedSlider * 0.55}
            shape="sequential"
            roundTrip
          />
        </>
      )}

      <OrbitControls
        target={[targetX, effectiveHeight * 0.3, targetZ]}
        maxDistance={50}
        minDistance={3}
        maxPolarAngle={Math.PI * 0.85}
      />
    </Canvas>
  );
}

function PlanetMarker({ x, z, name }: { x: number; z: number; name: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
      </mesh>
      <Line points={[[0, 0, 0], [0, 0.8, 0]]} color="#FFD700" lineWidth={1} transparent opacity={0.5} />
      <Html
        position={[0, 1.2, 0]}
        center
        style={{
          color: '#FFD700',
          fontSize: '12px',
          fontFamily: 'system-ui',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 8px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}
      >
        {name}
      </Html>
    </group>
  );
}
