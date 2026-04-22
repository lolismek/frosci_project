import { usePlanetStore } from '../../stores/usePlanetStore';
import { sliderToSpeed, isTachyonic } from '../../utils/relativity';
import type { InterpretationMode } from '../../types';

type Tab = 'sub' | 'tach' | 'brane';

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'sub', label: 'Subluminal', sub: 'v < c' },
  { id: 'tach', label: 'Tachyonic', sub: 'v > c · imaginary γ' },
  { id: 'brane', label: 'Brane-bulk', sub: 'shortcut · v apparent' },
];

export function Topbar() {
  const {
    selectedPlanets,
    speedSlider,
    interpretationMode,
    setInterpretationMode,
    setSpeedSlider,
  } = usePlanetStore();
  const [a, b] = selectedPlanets;
  const speed = sliderToSpeed(speedSlider);
  const superluminal = isTachyonic(speed);

  const activeTab: Tab = !superluminal
    ? 'sub'
    : interpretationMode === 'tachyonic'
    ? 'tach'
    : 'brane';

  const onTab = (t: Tab) => {
    if (t === 'sub') {
      // If currently superluminal, drop to a just-subluminal speed.
      // speedSlider 0.5 ≈ 0.999c, comfortably subluminal.
      if (superluminal) setSpeedSlider(0.5);
      return;
    }
    // Tachyonic or brane: jump just past c and pick the interpretation.
    if (!superluminal) setSpeedSlider(0.83);
    const mode: InterpretationMode = t === 'tach' ? 'tachyonic' : 'brane-bulk';
    setInterpretationMode(mode);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        padding: '0 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background:
          'linear-gradient(to bottom, rgba(10,9,18,0.85), rgba(10,9,18,0))',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {/* Lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
        <svg viewBox="0 0 28 28" width="24" height="24" style={{ color: 'var(--ink)' }}>
          <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="14" cy="14" r="3" fill="currentColor" />
          <line x1="14" y1="2" x2="14" y2="26" stroke="#D9641F" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          hyperspace
        </div>
        <div
          className="tc-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'var(--ink-3)',
            marginLeft: 6,
          }}
        >
          v0.5 · OBSERVATORY
        </div>
      </div>

      {/* Mode tabs */}
      <div
        style={{
          display: 'inline-flex',
          border: '1px solid var(--rule)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          background: 'rgba(10,9,18,0.4)',
          pointerEvents: 'auto',
        }}
      >
        {TABS.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              style={{
                padding: '10px 18px',
                background: active ? 'rgba(217,100,31,0.12)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-3)',
                border: 'none',
                borderBottom: active ? '1px solid var(--accent)' : '1px solid transparent',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                transition: 'color .12s ease, background .12s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)';
              }}
            >
              <span>{t.label}</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  opacity: 0.6,
                  textTransform: 'none',
                }}
              >
                {t.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <span
          className="tc-mono"
          style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)' }}
        >
          <span className="live-dot" />
          {a?.Name || '—'} → {b?.Name || '—'}
        </span>
      </div>
    </div>
  );
}
