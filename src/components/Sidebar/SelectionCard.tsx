import { useState, useRef } from 'react';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { searchPlanets } from '../../utils/planets';
import { distanceLY } from '../../utils/coordinates';
import type { Planet } from '../../types';

export function SelectionCard() {
  const {
    selectedPlanets,
    selectPlanet,
    deselectPlanet,
    clearSelection,
  } = usePlanetStore();
  const [a, b] = selectedPlanets;
  const [pick, setPick] = useState<'A' | 'B'>('A');

  const dist = a && b ? distanceLY(a, b) : 0;

  const onSearchSelect = (p: Planet) => {
    if (pick === 'A') {
      if (a) deselectPlanet(0);
      selectPlanet(p);
      setPick('B');
    } else {
      if (b) deselectPlanet(1);
      selectPlanet(p);
      setPick('A');
    }
  };

  const swap = () => {
    if (!a && !b) return;
    clearSelection();
    if (b) selectPlanet(b);
    if (a) selectPlanet(a);
  };

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        left: 22,
        top: 70,
        width: 264,
        pointerEvents: 'auto',
        zIndex: 10,
      }}
    >
      <div className="card-head">
        <span className="tc-label">Selection</span>
        <span className="tc-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          CLICK MAP
        </span>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PickerRow
          slot="A"
          active={pick === 'A'}
          planet={a}
          onClick={() => setPick('A')}
          onClear={() => deselectPlanet(0)}
        />
        <PickerRow
          slot="B"
          active={pick === 'B'}
          planet={b}
          onClick={() => setPick('B')}
          onClear={() => deselectPlanet(1)}
        />

        <PlanetSearchInline onSelect={onSearchSelect} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 2,
            flexWrap: 'wrap',
          }}
        >
          <button className="chip" onClick={swap}>Swap</button>
          <button className="chip" onClick={clearSelection}>Reset</button>
          <div
            className="tc-mono"
            style={{
              fontSize: 10,
              color: 'var(--ink-3)',
              letterSpacing: '0.12em',
              marginLeft: 'auto',
            }}
          >
            L = <span style={{ color: 'var(--ink)' }}>{dist ? Math.round(dist).toLocaleString() : '—'}</span> ly
          </div>
        </div>
      </div>
    </div>
  );
}

function PickerRow({
  slot,
  active,
  planet,
  onClick,
  onClear,
}: {
  slot: 'A' | 'B';
  active: boolean;
  planet: Planet | null;
  onClick: () => void;
  onClear: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px 10px',
        border: '1px solid ' + (active ? 'var(--accent)' : 'var(--rule)'),
        background: active ? 'rgba(217,100,31,0.06)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        transition: 'border-color .12s, background .12s',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          border: '1px solid var(--accent)',
          background: active ? 'var(--accent)' : 'transparent',
          color: active ? '#180C00' : 'var(--accent)',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {slot}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--ink)',
          }}
        >
          {planet?.Name || <span style={{ color: 'var(--ink-4)' }}>— click map —</span>}
        </div>
        <div
          className="tc-mono"
          style={{
            fontSize: 9,
            letterSpacing: '0.14em',
            color: 'var(--ink-3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {planet ? `${planet.Region} · ${planet.X},${planet.Y}` : 'no target'}
        </div>
      </div>
      {active && !planet && (
        <div
          className="tc-mono"
          style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '0.14em' }}
        >
          NEXT
        </div>
      )}
      {planet && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-3)',
            cursor: 'pointer',
            fontSize: 14,
            padding: '0 4px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function PlanetSearchInline({ onSelect }: { onSelect: (p: Planet) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Planet[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (val: string) => {
    setQuery(val);
    if (val.length >= 2) {
      setResults(searchPlanets(val, 8));
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (p: Planet) => {
    onSelect(p);
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search planets…"
        style={{
          width: '100%',
          background: 'rgba(239,231,212,0.04)',
          border: '1px solid var(--rule-2)',
          borderRadius: 0,
          padding: '6px 10px',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          color: 'var(--ink)',
          outline: 'none',
        }}
      />
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 2,
            background: 'var(--scrim-solid)',
            border: '1px solid var(--rule)',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {results.map((p) => (
            <button
              key={p.Name}
              onMouseDown={() => handleSelect(p)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '6px 10px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--rule-3)',
                color: 'var(--ink-2)',
                fontFamily: 'var(--sans)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,231,212,0.04)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
              }
            >
              <span style={{ color: 'var(--ink)' }}>{p.Name}</span>
              <span className="tc-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>
                {p.Region}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
