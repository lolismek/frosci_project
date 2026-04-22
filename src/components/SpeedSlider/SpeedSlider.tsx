import { useEffect, useRef, useState } from 'react';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { sliderToSpeed, speedToSlider } from '../../utils/relativity';

// Convert v (units of c) → percent-of-track.
// Design: log below c into [0, 72%], linear above c into [72, 100].
function vToPct(v: number): number {
  if (v < 1) {
    const denom = 1 - v;
    if (denom <= 1e-9) return 72;
    return Math.max(0, Math.min(72, (Math.log10(1 / denom) / 6) * 72));
  }
  // Above c: allow v up to ~100c but compress visually
  return 72 + Math.max(0, Math.min(28, (Math.log10(Math.max(v - 1, 1e-4)) + 3) / 6 * 28));
}

function pctToV(pct: number): number {
  const p = Math.max(0, Math.min(100, pct));
  if (p <= 72) {
    const x = (p / 72) * 6;
    return Math.max(0, Math.min(0.9999999, 1 - Math.pow(10, -x)));
  }
  const t = (p - 72) / 28;
  return 1 + Math.pow(10, -3 + t * 6);
}

const TICKS = [
  { p: 0, label: '0.5c' },
  { p: 18, label: '0.9c' },
  { p: 35, label: '0.99c' },
  { p: 54, label: '0.999c' },
  { p: 65, label: '0.9999c' },
  { p: 72, label: 'c', bold: true },
  { p: 86, label: '10c' },
  { p: 96, label: '100c' },
];

const PRESETS = [0.5, 0.9, 0.99, 0.999, 0.9999, 2, 10];

export function SpeedSlider() {
  const { speedSlider, setSpeedSlider } = usePlanetStore();
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);

  const v = sliderToSpeed(speedSlider);
  const pct = vToPct(v);
  const beyondC = v > 1;

  const update = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    const newV = pctToV(p);
    setSpeedSlider(speedToSlider(newV));
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    setDrag(true);
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    update(cx);
  };

  useEffect(() => {
    if (!drag) return;
    const mv = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      update(cx);
    };
    const up = () => setDrag(false);
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', mv);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', mv);
      window.removeEventListener('touchend', up);
    };
  }, [drag]);

  const readoutText = beyondC
    ? `v = ${v.toFixed(v < 10 ? 2 : 1)}c`
    : `v = ${v.toFixed(Math.min(6, Math.max(2, Math.floor(Math.log10(1 / Math.max(1 - v, 1e-9)) + 1))))}c`;

  const hint = v < 0.5
    ? 'Walking pace, astronomically speaking.'
    : v < 0.9
    ? 'Fast enough to notice. Clocks begin to disagree.'
    : v < 0.999
    ? 'The universe outside is blue-shifting into a tunnel.'
    : v < 1
    ? 'At the edge of what matter can do. One more step is forbidden.'
    : v < 1.5
    ? 'Past the wall. Proper time has rotated into the imaginary.'
    : 'Deep tachyonic. Cause and effect are no longer a straight line.';

  return (
    <div style={{ width: '100%' }}>
      <div className="tc-label" style={{ marginBottom: 4 }}>Speed · v / c</div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 15,
          fontWeight: 300,
          color: 'var(--ink-2)',
          marginBottom: 2,
          lineHeight: 1.2,
          minHeight: 18,
        }}
      >
        {hint}
      </div>

      <div style={{ position: 'relative', userSelect: 'none', padding: '32px 0 26px' }}>
        <div
          ref={trackRef}
          onMouseDown={onDown}
          onTouchStart={onDown}
          style={{
            height: 1,
            background: 'var(--ink)',
            position: 'relative',
            cursor: 'ew-resize',
          }}
        >
          {/* subluminal band marker (left tick of the band) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: -3,
              width: '72%',
              height: 7,
              borderLeft: '1px solid var(--ink)',
            }}
          />
          {/* threshold marker at c */}
          <div
            style={{
              position: 'absolute',
              left: '72%',
              top: -14,
              width: 1,
              height: 28,
              background: 'var(--accent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '72%',
              top: -30,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--serif)',
              fontSize: 16,
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'var(--accent)',
            }}
          >
            c
          </div>
          {/* beyond-c dashed line */}
          <div
            style={{
              position: 'absolute',
              left: '72%',
              top: 0,
              width: '28%',
              height: 1,
              backgroundImage:
                'repeating-linear-gradient(90deg, var(--ink) 0 4px, transparent 4px 8px)',
            }}
          />
          {/* ticks */}
          {TICKS.map((t, i) => (
            <div key={i} style={{ position: 'absolute', left: t.p + '%', top: 0 }}>
              {!t.bold && (
                <div style={{ width: 1, height: 6, background: 'var(--ink)', transform: 'translateX(-0.5px)' }} />
              )}
              {!t.bold && (
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    color: 'var(--ink-3)',
                    transform: 'translate(-50%, 2px)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.1em',
                  }}
                >
                  {t.label}
                </div>
              )}
            </div>
          ))}
          {/* thumb */}
          <div
            style={{
              position: 'absolute',
              left: pct + '%',
              top: -7,
              width: 14,
              height: 14,
              transform: 'translateX(-50%)',
              border: '1.5px solid var(--ink)',
              background: beyondC ? 'var(--accent)' : 'var(--paper)',
              cursor: 'ew-resize',
              transition: drag ? 'none' : 'background .15s ease',
            }}
          />
          {/* readout */}
          <div
            style={{
              position: 'absolute',
              left: pct + '%',
              top: 18,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--ink)',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            {readoutText}
          </div>
        </div>
      </div>

      {/* preset chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            className={'chip' + (Math.abs(p - v) < 0.0001 ? ' active' : '')}
            onClick={() => setSpeedSlider(speedToSlider(p))}
          >
            {p < 1 ? p + 'c' : p.toFixed(0) + 'c'}
          </button>
        ))}
      </div>
    </div>
  );
}
