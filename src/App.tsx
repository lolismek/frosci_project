import { useState } from 'react';
import { GalaxyMap } from './components/GalaxyMap/GalaxyMap';
import { HyperspaceView } from './components/HyperspaceView/HyperspaceView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { RelativityPanel } from './components/Calculator/RelativityPanel';
import { usePlanetStore } from './stores/usePlanetStore';
import { sliderToSpeed, isTachyonic } from './utils/relativity';

function App() {
  const speedSlider = usePlanetStore((s) => s.speedSlider);
  const selectedPlanets = usePlanetStore((s) => s.selectedPlanets);
  const tachyonic = isTachyonic(sliderToSpeed(speedSlider));

  // Keep HyperspaceView mounted once planets have been selected — toggling
  // only opacity prevents Three.js camera/scene resets on every c crossing.
  // Before any selection the 3D view has nothing to render, so we hold
  // off mounting it at all (no canvas, no orbit controls ticking idle).
  const [hasMountedHyperspace, setHasMountedHyperspace] = useState(false);
  const havePair = selectedPlanets[0] && selectedPlanets[1];
  if (havePair && !hasMountedHyperspace) setHasMountedHyperspace(true);

  return (
    <div className="w-full h-full relative bg-space-900">
      {/* 2D Galaxy Map */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          tachyonic ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <GalaxyMap />
      </div>

      {/* 3D Hyperspace View — stays mounted across c-crossings. */}
      {hasMountedHyperspace && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            tachyonic ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <HyperspaceView />
        </div>
      )}

      <Sidebar autoCollapse={tachyonic} />
      <RelativityPanel />
    </div>
  );
}

export default App;
