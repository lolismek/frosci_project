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
import { braneHeight, computeRouteLimit } from './braneField';

const GALAXY_SIZE = 21; // grid units
const BRANE_BULK_CAMERA_LIFT = 2.5;

export function HyperspaceView() {
  const { selectedPlanets, speedSlider, interpretationMode } = usePlanetStore();
  const [planetA, planetB] = selectedPlanets;

  const speed = sliderToSpeed(speedSlider);
  const distance = planetA && planetB ? distanceLY(planetA, planetB) : 0;

  const tachyonicResult = useMemo(() => {
    if (!distance || speed <= 1) return null;
    return calculateTachyonicTravel(distance, speed);
  }, [distance, speed]);

  const routeLimit = useMemo(() => {
    if (!planetA || !planetB) return null;
    return computeRouteLimit(planetA.trueX, planetA.trueY, planetB.trueX, planetB.trueY);
  }, [planetA, planetB]);

  const shortcutFactor = routeLimit ? sliderToShortcutFactor(speedSlider, routeLimit.apparentMax) : 1;
  const braneBulkResult = useMemo(() => {
    if (!distance || shortcutFactor <= 1) return null;
    return calculateBraneBulkTravel(distance, shortcutFactor);
  }, [distance, shortcutFactor]);

  const galaxyTexture = useMemo(() => createGalaxyPlaneTexture(), []);

  const tachyonicActive = interpretationMode === 'tachyonic' && tachyonicResult !== null;
  const braneBulkActive = interpretationMode === 'brane-bulk' && braneBulkResult !== null;

  const ellipseSemiMinor = tachyonicActive ? tachyonicResult!.ellipseSemiMinorGrid : 0;

  // Planet surface heights on the wrinkled brane. In tachyonic / subluminal
  // mode the plane is flat, so this is zero.
  const showWrinkledBrane = interpretationMode === 'brane-bulk' && planetA !== undefined && planetB !== undefined;
  const aHeight = showWrinkledBrane ? braneHeight(planetA!.trueX, planetA!.trueY) : 0;
  const bHeight = showWrinkledBrane ? braneHeight(planetB!.trueX, planetB!.trueY) : 0;

  const effectiveHeight = tachyonicActive ? ellipseSemiMinor : (braneBulkActive ? BRANE_BULK_CAMERA_LIFT : 0);

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
      style={{ background: '#0a0912' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 20, 10]} intensity={0.8} />

      <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />

      {/* Galaxy brane — globally wrinkled in brane-bulk mode, flat otherwise */}
      {showWrinkledBrane ? (
        <WarpedGalaxyPlane size={GALAXY_SIZE} texture={galaxyTexture} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GALAXY_SIZE / 2, -0.01, GALAXY_SIZE / 2]}>
          <planeGeometry args={[GALAXY_SIZE, GALAXY_SIZE]} />
          <meshBasicMaterial map={galaxyTexture} transparent opacity={0.85} side={DoubleSide} />
        </mesh>
      )}

      {/* Vertical axis — the imaginary-rapidity axis for the tachyonic diagram.
          Labeled to make clear this is a diagram of the Wick rotation, not a
          spatial dimension the ship traverses. */}
      {tachyonicActive && ellipseSemiMinor > 0 && (
        <>
          <Line
            points={[[targetX, 0, targetZ], [targetX, ellipseSemiMinor + 2, targetZ]]}
            color="#4FC3F7"
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
            dashSize={0.3}
            gapSize={0.2}
          />
          <Html
            position={[targetX, ellipseSemiMinor + 2.5, targetZ]}
            center
            style={{
              color: '#4FC3F7',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              opacity: 0.75,
              pointerEvents: 'none',
            }}
          >
            Imaginary Rapidity Axis
          </Html>
        </>
      )}

      {/* Planet markers — sit on the brane surface when it's wrinkled */}
      {planetA && <PlanetMarker x={planetA.trueX} y={aHeight} z={planetA.trueY} name={planetA.Name} />}
      {planetB && <PlanetMarker x={planetB.trueX} y={bHeight} z={planetB.trueY} name={planetB.Name} />}

      {/* --- BRANE-BULK MODE --- */}
      {braneBulkActive && planetA && planetB && (
        <>
          {/* Bulk chord: a straight line through 3D space from A's
              brane-surface point to B's, cutting through whatever ridges
              happen to lie between. */}
          <Line
            points={[
              [planetA.trueX, aHeight, planetA.trueY],
              [planetB.trueX, bHeight, planetB.trueY],
            ]}
            color="#D9641F"
            lineWidth={4}
            transparent
            opacity={1}
          />
          {/* Ship on the chord — local c, straight path through the bulk. */}
          <ShipAnimation
            startX={planetA.trueX}
            startZ={planetA.trueY}
            startY={aHeight}
            endX={planetB.trueX}
            endZ={planetB.trueY}
            endY={bHeight}
            sliderValue={speedSlider}
            shape="chord"
          />
        </>
      )}

      {/* --- TACHYONIC MODE --- */}
      {!braneBulkActive && planetA && planetB && (
        <Line
          points={[
            [planetA.trueX, 0.02, planetA.trueY],
            [planetB.trueX, 0.02, planetB.trueY],
          ]}
          color="#D9641F"
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
            semiMinor={ellipseSemiMinor}
            color="#4FC3F7"
          />
          <ShipAnimation
            startX={planetA.trueX}
            startZ={planetA.trueY}
            endX={planetB.trueX}
            endZ={planetB.trueY}
            semiMinor={ellipseSemiMinor}
            sliderValue={speedSlider}
            shape="ellipse"
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

function PlanetMarker({ x, y, z, name }: { x: number; y: number; z: number; name: string }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#D9641F" emissive="#D9641F" emissiveIntensity={2} />
      </mesh>
      <Line points={[[0, 0, 0], [0, 0.8, 0]]} color="#D9641F" lineWidth={1} transparent opacity={0.5} />
      <Html
        position={[0, 1.2, 0]}
        center
        style={{
          color: '#EFE7D4',
          fontSize: '12px',
          fontFamily: 'Inter, system-ui',
          fontWeight: 500,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          textShadow: '0 0 8px rgba(10,9,18,0.9)',
          pointerEvents: 'none',
        }}
      >
        {name}
      </Html>
    </group>
  );
}
