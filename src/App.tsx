import { useEffect, useState } from 'react';
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

const STAGE_W = 1440;
const STAGE_H = 900;

function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

function App() {
  const scale = useStageScale();
  const speedSlider = usePlanetStore((s) => s.speedSlider);
  const tachyonic = isTachyonic(sliderToSpeed(speedSlider));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(${-STAGE_W / 2 * scale}px, ${-STAGE_H / 2 * scale}px) scale(${scale})`,
          transformOrigin: '0 0',
          background: 'var(--paper)',
          overflow: 'hidden',
          boxShadow: '0 0 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Full-bleed map layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
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
        </div>

        <Topbar />
        <SelectionCard />
        <AtlasCard />
        <RoutesCard />

        {/* Bottom bar */}
        <div
          className="card"
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 18,
            height: 240,
            padding: '12px 18px',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.4fr',
            gap: 18,
            zIndex: 15,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <SpeedSlider />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <RelativityPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
