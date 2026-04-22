import { usePlanetStore } from '../../stores/usePlanetStore';

const TIERS = [
  { value: 1 as const, label: 'TOP 25' },
  { value: 2 as const, label: 'TOP 100' },
  { value: 3 as const, label: 'TOP 250' },
  { value: 4 as const, label: 'ALL' },
];

export function AtlasCard() {
  const { maxTier, setMaxTier } = usePlanetStore();

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        left: 22,
        top: 300,
        width: 300,
        pointerEvents: 'auto',
        zIndex: 10,
      }}
    >
      <div className="card-head">
        <span className="tc-label">Atlas</span>
        <span className="tc-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          5,444 WORLDS
        </span>
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div className="tc-label" style={{ marginBottom: 6, fontSize: 9 }}>
          Visible density
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {TIERS.map((t) => (
            <button
              key={t.value}
              onClick={() => setMaxTier(t.value)}
              style={{
                padding: '6px 0',
                background: maxTier === t.value ? 'rgba(217,100,31,0.12)' : 'transparent',
                color: maxTier === t.value ? 'var(--ink)' : 'var(--ink-3)',
                border:
                  '1px solid ' + (maxTier === t.value ? 'var(--accent)' : 'var(--rule-2)'),
                borderRadius: 0,
                fontFamily: 'var(--mono)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.14em',
                cursor: 'pointer',
                transition: 'color .12s, background .12s, border-color .12s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gap: 6,
            borderTop: '1px solid var(--rule)',
            paddingTop: 10,
          }}
        >
          <LegendRow swatch={<Dot color="var(--ink)" />} label="planets" />
          <LegendRow swatch={<Dash color="var(--accent-2)" />} label="brane light path · L" />
          <LegendRow
            swatch={<Dash color="var(--accent)" dashed />}
            label="bulk chord · L′ = L / k"
          />
          <LegendRow swatch={<Arc color="#4FC3F7" />} label="tachyonic rapidity arc" />
        </div>
      </div>
    </div>
  );
}

function LegendRow({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: 'var(--ink-2)',
      }}
    >
      <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
        {swatch}
      </span>
      {label}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 4,
        height: 4,
        borderRadius: 0,
        background: color,
        display: 'inline-block',
      }}
    />
  );
}

function Dash({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <span
      style={{
        width: 18,
        height: 1,
        background: dashed
          ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 6px)`
          : color,
        display: 'inline-block',
      }}
    />
  );
}

function Arc({ color }: { color: string }) {
  return (
    <svg width="18" height="8" viewBox="0 0 18 8">
      <path d="M 1 7 Q 9 -1 17 7" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}
