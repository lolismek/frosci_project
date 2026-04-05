import { GalaxyMap } from './components/GalaxyMap/GalaxyMap';
import { HyperspaceView } from './components/HyperspaceView/HyperspaceView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { RelativityPanel } from './components/Calculator/RelativityPanel';
import { usePlanetStore } from './stores/usePlanetStore';
import { sliderToSpeed, isTachyonic } from './utils/relativity';

function App() {
  const speedSlider = usePlanetStore((s) => s.speedSlider);
  const tachyonic = isTachyonic(sliderToSpeed(speedSlider));

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

      {/* 3D Hyperspace View */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          tachyonic ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {tachyonic && <HyperspaceView />}
      </div>

      <Sidebar />
      <RelativityPanel />
    </div>
  );
}

export default App;
