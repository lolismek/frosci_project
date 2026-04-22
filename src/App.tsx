import { GalaxyMap } from './components/GalaxyMap/GalaxyMap';
import { HyperspaceView } from './components/HyperspaceView/HyperspaceView';
import { Topbar } from './components/Topbar/Topbar';
import { SelectionCard } from './components/Sidebar/SelectionCard';
import { AtlasCard } from './components/Sidebar/AtlasCard';
import { RoutesCard } from './components/Sidebar/RoutesCard';
import { SpeedSlider } from './components/SpeedSlider/SpeedSlider';
import { RelativityPanel } from './components/Calculator/RelativityPanel';
import { usePlanetStore } from './stores/usePlanetStore';
import { sliderToSpeed, isTachyonic } from './utils/relativity';

function App() {
  const speedSlider = usePlanetStore((s) => s.speedSlider);
  const tachyonic = isTachyonic(sliderToSpeed(speedSlider));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--paper)',
        color: 'var(--ink)',
        overflow: 'hidden',
      }}
    >
      {/* 2D Galaxy Map */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: tachyonic ? 0 : 1,
          pointerEvents: tachyonic ? 'none' : 'auto',
          transition: 'opacity 700ms ease',
        }}
      >
        <GalaxyMap />
      </div>

      {/* 3D Hyperspace View */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: tachyonic ? 1 : 0,
          pointerEvents: tachyonic ? 'auto' : 'none',
          transition: 'opacity 700ms ease',
        }}
      >
        {tachyonic && <HyperspaceView />}
      </div>

      {/* Top bar — lockup + mode tabs + status */}
      <Topbar />

      {/* Floating sidebar cards */}
      <SelectionCard />
      <AtlasCard />
      <RoutesCard />

      {/* Bottom bar — speed slider (left) + relativity calculator (right) */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 22,
          display: 'grid',
          gridTemplateColumns: 'minmax(380px, 1fr) minmax(420px, 1fr)',
          gap: 22,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div className="card" style={{ padding: '14px 18px 10px', pointerEvents: 'auto' }}>
          <SpeedSlider />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <RelativityPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
