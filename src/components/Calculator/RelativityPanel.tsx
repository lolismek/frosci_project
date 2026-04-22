import { useMemo } from 'react';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { useRouteStore } from '../../stores/useRouteStore';
import { distanceLY } from '../../utils/coordinates';
import {
  calculateTravel,
  calculateRoundTrips,
  calculateTachyonicTravel,
  calculateBraneBulkTravel,
  sliderToSpeed,
  sliderToShortcutFactor,
  isTachyonic,
} from '../../utils/relativity';
import { computeRouteLimit } from '../HyperspaceView/braneField';
import tradeRoutes from '../../data/trade-routes.json';
import type { TradeRoute } from '../../types';

const HUMAN_LIFE = 80;

export function RelativityPanel() {
  const {
    selectedPlanets,
    speedSlider,
    interpretationMode,
  } = usePlanetStore();
  const { activeRouteId } = useRouteStore();
  const [planetA, planetB] = selectedPlanets;

  const speed = sliderToSpeed(speedSlider);
  const tachyonic = isTachyonic(speed);
  const distance = planetA && planetB ? distanceLY(planetA, planetB) : 0;

  const routeLimit = useMemo(() => {
    if (!planetA || !planetB) return null;
    return computeRouteLimit(planetA.trueX, planetA.trueY, planetB.trueX, planetB.trueY);
  }, [planetA, planetB]);

  const shortcutFactor = routeLimit ? sliderToShortcutFactor(speedSlider, routeLimit.apparentMax) : 1;

  const subResult = useMemo(() => {
    if (!distance || speed <= 0 || tachyonic) return null;
    return calculateTravel(distance, speed);
  }, [distance, speed, tachyonic]);

  const tachResult = useMemo(() => {
    if (!distance || !tachyonic) return null;
    return calculateTachyonicTravel(distance, speed);
  }, [distance, speed, tachyonic]);

  const braneResult = useMemo(() => {
    if (!distance || !tachyonic || interpretationMode !== 'brane-bulk') return null;
    return calculateBraneBulkTravel(distance, shortcutFactor);
  }, [distance, shortcutFactor, tachyonic, interpretationMode]);

  const roundTrips = useMemo(() => {
    if (!subResult) return [];
    return calculateRoundTrips(distance, speed, 30, 6);
  }, [subResult, distance, speed]);

  const canonJourney = useMemo(() => {
    if (!planetA || !planetB || !activeRouteId) return null;
    const route = (tradeRoutes as TradeRoute[]).find((r) => r.id === activeRouteId);
    if (!route || route.type !== 'movie-journey') return null;
    const names = [planetA.Name, planetB.Name];
    if (route.planets.some((p) => names.includes(p))) return route;
    return null;
  }, [planetA, planetB, activeRouteId]);

  if (!planetA || !planetB) {
    return (
      <CardFrame title="Calculator · awaiting target" liveLabel="IDLE">
        <div style={{ padding: '22px 16px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em' }}>
          Select two planets (A + B) to compute relativistic travel.
        </div>
      </CardFrame>
    );
  }

  // Subluminal
  if (!tachyonic && subResult) {
    const homeYears = subResult.timePlanetYears;
    const travYears = subResult.timeTravelerYears;
    const homeLives = homeYears / HUMAN_LIFE;
    const travLives = travYears / HUMAN_LIFE;
    const maxLives = Math.max(12, homeLives, travLives);

    return (
      <CardFrame title="Calculator · At this speed" liveLabel="SUB-c">
        <SplitGrid>
          <Side label={`At home · ${planetA.Name}`} tone="neutral">
            <BigNum value={formatYears(homeYears)} sub={`${formatLives(homeLives)} human lives`} />
            <LifeBar lives={homeLives} max={maxLives} tone="ink" />
            <Tiny>{homeNarrative(homeYears)}</Tiny>
          </Side>
          <Side label="Aboard · traveller frame" tone="accent">
            <BigNum value={formatYears(travYears)} accent sub={`${formatLives(travLives)} human lives`} />
            <LifeBar lives={travLives} max={maxLives} tone="accent" />
            <Tiny accent>{travelerNarrative(travLives)}</Tiny>
          </Side>
        </SplitGrid>

        <RoundTripTable rows={roundTrips} />

        {canonJourney?.canonTravelTime && (
          <CanonBox canon={canonJourney.canonTravelTime} ours={`Traveler ages ${formatYears(travYears)}, home ages ${formatYears(homeYears)}.`} />
        )}

        <Footer
          left={`γ = ${formatGamma(subResult.gamma)} · dilation ×${formatGamma(subResult.gamma)}`}
          right="τ = t / γ"
        />
      </CardFrame>
    );
  }

  // Tachyonic
  if (tachyonic && interpretationMode === 'tachyonic' && tachResult) {
    const imagGamma = tachResult.gammaImagMagnitude;
    return (
      <CardFrame title="Calculator · Tachyonic frame" liveLabel="v > c">
        <SplitGrid>
          <Side label="Real axis · L" tone="neutral">
            <BigNum value={Math.round(tachResult.realDistance).toLocaleString()} unit="ly" sub="spatial separation · unchanged" />
            <Tiny>The galaxy is still there. Only the time axis has rotated.</Tiny>
          </Side>
          <Side label="Imaginary axis · τ" tone="accent">
            <BigNum value={imagGamma.toFixed(3)} unit="· i" accent sub="proper time is imaginary" />
            <Tiny accent>The ship's clock no longer labels events — it orders them on an imaginary axis.</Tiny>
          </Side>
        </SplitGrid>

        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)' }}>
          <div className="tc-label" style={{ marginBottom: 4 }}>Rapidity ζ = atanh(v/c)</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)' }}>
                ζ = {tachResult.rapidityReal.toFixed(3)}
                <span style={{ color: 'var(--accent)' }}> + (π/2) i</span>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>
                The +(π/2)i is the Wick quarter-turn that makes v &gt; c coherent — space and time swap roles. The ship is rendered along this arc in the 3D view; whether tachyonic matter actually traces such a path is unsolved.
              </div>
            </div>
            <ArgandDiagram realPart={tachResult.rapidityReal} />
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className="tc-label">Rest-frame time t = L/v</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', marginTop: 2 }}>
              {formatYears(tachResult.restFrameTimeYears)}
            </div>
          </div>
          <div>
            <div className="tc-label" style={{ color: 'var(--accent)' }}>Imag. proper time |τ|</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--accent)', marginTop: 2 }}>
              {formatYears(tachResult.imagProperTimeYears)} · i
            </div>
          </div>
        </div>

        <LimitationsBox />

        {canonJourney?.canonTravelTime && (
          <CanonBox canon={canonJourney.canonTravelTime} ours={`Rest-frame travel time: ${formatYears(tachResult.restFrameTimeYears)}.`} />
        )}

        <Footer
          left={`|γ| = ${imagGamma.toFixed(2)}`}
          right={<>γ = −{imagGamma.toFixed(3)}<span style={{ fontStyle: 'italic' }}>i</span></>}
        />
      </CardFrame>
    );
  }

  // Brane-bulk
  if (tachyonic && interpretationMode === 'brane-bulk' && braneResult && routeLimit) {
    const quality = routeQualityLabel(routeLimit.apparentMax);
    return (
      <CardFrame title="Calculator · Brane vs bulk" liveLabel="BULK">
        <SplitGrid>
          <Side label="On the brane" tone="neutral">
            <BigNum value={Math.round(braneResult.braneLengthLY).toLocaleString()} unit="ly" sub="light path · long way round" />
            <MiniBar pct={100} tone="ink" />
            <Tiny>Light years across the folded surface of 3-space.</Tiny>
          </Side>
          <Side label="Through the bulk" tone="accent">
            <BigNum
              value={Math.round(braneResult.chordLY).toLocaleString()}
              unit="ly"
              accent
              sub={`shortcut · ${braneResult.shortcutFactor.toFixed(2)}×`}
            />
            <MiniBar pct={Math.max(4, 100 / braneResult.shortcutFactor)} tone="accent" />
            <Tiny accent>Straight-line chord through the extra dimensions.</Tiny>
          </Side>
        </SplitGrid>

        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className="tc-label">Travel time (ship via bulk)</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', marginTop: 2 }}>
              {formatYears(braneResult.travelTimeYears)}
            </div>
          </div>
          <div>
            <div className="tc-label" style={{ color: 'var(--accent)' }}>Route max · {quality}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--accent)', marginTop: 2 }}>
              {routeLimit.apparentMax < 10
                ? routeLimit.apparentMax.toFixed(2) + 'c'
                : Math.round(routeLimit.apparentMax).toLocaleString() + 'c'}
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)' }}>
          <div className="tc-label" style={{ marginBottom: 4 }}>Brane-bulk physics</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4 }}>
            The galaxy is a 3+1D brane embedded in a higher-dimensional bulk (Randall-Sundrum 1999). Routes have different apparent-speed ceilings set by local extrinsic curvature: v<sub>app</sub>/c ≈ L<sub>brane</sub>/L<sub>chord</sub> (Chung-Freese 2000). The ship never locally exceeds c — the chord is simply shorter than the wrinkled brane path.
          </div>
        </div>

        {canonJourney?.canonTravelTime && (
          <CanonBox canon={canonJourney.canonTravelTime} ours={`Bulk shortcut: ${braneResult.shortcutFactor.toFixed(0)}× faster than light via the brane path.`} />
        )}

        <Footer
          left={`G = L_brane / L_chord = ${routeLimit.geometricFactor.toFixed(3)}`}
          right="L′ = L / k"
        />
      </CardFrame>
    );
  }

  return null;
}

// ───────────────────────────────── sub-components ─────────────────────────

function CardFrame({ title, children, liveLabel = 'LIVE' }: { title: string; children: React.ReactNode; liveLabel?: string }) {
  return (
    <div className="card" style={{ width: '100%' }}>
      <div className="card-head">
        <span className="tc-label">{title}</span>
        <span className="tc-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          <span className="live-dot" />
          {liveLabel}
        </span>
      </div>
      {children}
    </div>
  );
}

function SplitGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 120 }}>
      {children}
    </div>
  );
}

function Side({ label, tone, children }: { label: string; tone: 'neutral' | 'accent'; children: React.ReactNode }) {
  const bg = tone === 'accent' ? 'rgba(217,100,31,0.08)' : 'transparent';
  return (
    <div
      style={{
        padding: '10px 14px 12px',
        background: bg,
        borderRight: '1px solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div className="tc-label" style={{ color: tone === 'accent' ? 'var(--accent)' : undefined }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function BigNum({ value, unit, sub, accent }: { value: string; unit?: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ color: accent ? 'var(--accent)' : 'var(--ink)' }}>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontWeight: 300,
          fontSize: 28,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              marginLeft: 6,
              opacity: 0.7,
              letterSpacing: '0.08em',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div
          className="tc-mono"
          style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-3)', marginTop: 3 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function Tiny({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      style={{
        fontFamily: 'var(--serif)',
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: 300,
        lineHeight: 1.4,
        color: accent ? 'var(--accent)' : 'var(--ink-2)',
      }}
    >
      {children}
    </div>
  );
}

function Footer({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div
      className="tc-mono"
      style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--rule)',
        fontSize: 10,
        letterSpacing: '0.1em',
        display: 'flex',
        justifyContent: 'space-between',
        color: 'var(--ink-3)',
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function LifeBar({ lives, max, tone }: { lives: number; max: number; tone: 'ink' | 'accent' }) {
  const cols = 16;
  const ink = tone === 'accent' ? 'var(--accent)' : 'var(--ink)';
  const dim = 'rgba(239,231,212,0.08)';
  const perCol = Math.max(1, max / cols);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
        {Array.from({ length: cols }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, lives / perCol - i));
          return (
            <div key={i} style={{ height: 8, background: dim, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, width: fill * 100 + '%', background: ink }} />
            </div>
          );
        })}
      </div>
      <div
        className="tc-mono"
        style={{ fontSize: 9, marginTop: 3, color: 'var(--ink-3)', letterSpacing: '0.12em' }}
      >
        1 block ≈ {perCol >= 1 ? perCol.toFixed(0) : perCol.toFixed(1)} {perCol === 1 ? 'life' : 'lives'}
      </div>
    </div>
  );
}

function MiniBar({ pct, tone }: { pct: number; tone: 'ink' | 'accent' }) {
  const ink = tone === 'accent' ? 'var(--accent)' : 'var(--ink)';
  return (
    <div style={{ height: 8, background: 'rgba(239,231,212,0.08)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, width: pct + '%', background: ink, transition: 'width .3s ease' }} />
    </div>
  );
}

function RoundTripTable({ rows }: { rows: ReturnType<typeof calculateRoundTrips> }) {
  if (!rows.length) return null;
  return (
    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)' }}>
      <div className="tc-label" style={{ marginBottom: 6 }}>Round-trip aging · start age 30</div>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 60px', rowGap: 2, columnGap: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em' }}>
        <div style={{ color: 'var(--ink-3)' }}>Trip</div>
        <div style={{ color: 'var(--ink-3)', textAlign: 'right' }}>Traveler</div>
        <div style={{ color: 'var(--ink-3)', textAlign: 'right' }}>Home</div>
        <div style={{ color: 'var(--ink-3)', textAlign: 'right' }}>State</div>
        {rows.flatMap((row) => [
          <div key={`t${row.trip}`} style={{ color: 'var(--ink-2)' }}>{row.trip === 0 ? 'start' : '#' + row.trip}</div>,
          <div key={`tr${row.trip}`} style={{ color: 'var(--ink)', textAlign: 'right' }}>{formatAge(row.travelerAge)}</div>,
          <div key={`h${row.trip}`} style={{ color: 'var(--accent)', textAlign: 'right' }}>{formatAge(row.homeAge)}</div>,
          <div key={`s${row.trip}`} style={{ color: 'var(--ink-3)', textAlign: 'right' }}>{getAgeStatus(row.homeAge)}</div>,
        ])}
      </div>
    </div>
  );
}

function CanonBox({ canon, ours }: { canon: string; ours: string }) {
  return (
    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)', background: 'rgba(217,100,31,0.04)' }}>
      <div className="tc-label" style={{ color: 'var(--accent)', marginBottom: 4 }}>Canon vs model</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4 }}>
        <div><span style={{ color: 'var(--ink-3)' }}>In the movie: </span>{canon}</div>
        <div style={{ marginTop: 2 }}><span style={{ color: 'var(--ink-3)' }}>In our model: </span>{ours}</div>
      </div>
    </div>
  );
}

function LimitationsBox() {
  return (
    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--rule)' }}>
      <div className="tc-label" style={{ color: 'var(--accent)', marginBottom: 6 }}>Limitations of this picture</div>
      <ul
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--ink-2)',
          paddingLeft: 16,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <li>Tachyonic matter is unsolved — whether anything actually traces the arc, or whether v &gt; c is a hard threshold, is not settled. The ship is drawn along the half-ellipse as sci-fi license.</li>
        <li>By Bilaniuk–Sudarshan (1962), a tachyon of speed v in one frame looks like an antiparticle of speed c²/v in another — the A→B labels are frame-dependent.</li>
        <li>Tolman's antitelephone still closes. Recami's extended relativity re-labels rather than resolves the causality paradox.</li>
        <li>No evidence: OPERA 2011 was retracted (JHEP 10 (2012) 093); tachyonic fields in QFT describe vacuum instabilities, not FTL particles.</li>
      </ul>
    </div>
  );
}

function ArgandDiagram({ realPart }: { realPart: number }) {
  const size = 64;
  const pad = 7;
  const axisHalf = size / 2 - pad;
  const realNorm = Math.max(-1, Math.min(1, realPart / 3));
  const arrowEndX = size / 2 + realNorm * axisHalf;
  const arrowEndY = pad;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <line x1={pad} y1={cy} x2={size - pad} y2={cy} stroke="var(--ink-3)" strokeWidth={1} opacity={0.5} />
      <line x1={cx} y1={pad} x2={cx} y2={size - pad} stroke="var(--ink-3)" strokeWidth={1} opacity={0.5} />
      <text x={size - pad - 1} y={cy - 2} fontSize="7" fill="var(--ink-3)" textAnchor="end" style={{ fontFamily: 'var(--mono)' }}>Re</text>
      <text x={cx + 2} y={pad + 6} fontSize="7" fill="var(--ink-3)" style={{ fontFamily: 'var(--mono)' }}>Im</text>
      <line x1={cx} y1={cy} x2={arrowEndX} y2={arrowEndY} stroke="var(--accent)" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={arrowEndX} cy={arrowEndY} r={2} fill="var(--accent)" />
    </svg>
  );
}

// ───────────────────────────────── formatters ─────────────────────────────

function formatYears(years: number): string {
  if (years < 0.01) return `${(years * 365.25).toFixed(1)} d`;
  if (years < 1) return `${(years * 12).toFixed(1)} mo`;
  if (years < 100) return `${years.toFixed(1)} yr`;
  if (years < 1000) return `${years.toFixed(0)} yr`;
  if (years < 1_000_000) return `${(years / 1000).toFixed(1)}k yr`;
  if (years < 1_000_000_000) return `${(years / 1_000_000).toFixed(1)}M yr`;
  return `${(years / 1_000_000_000).toFixed(1)}B yr`;
}

function formatLives(lives: number): string {
  if (lives < 0.1) return lives.toFixed(2);
  if (lives < 10) return lives.toFixed(1);
  if (lives < 1000) return lives.toFixed(0);
  return lives.toExponential(1);
}

function formatGamma(gamma: number): string {
  if (!isFinite(gamma)) return '∞';
  if (gamma < 100) return gamma.toFixed(2);
  return Math.round(gamma).toLocaleString();
}

function formatAge(age: number): string {
  if (age < 1000) return age.toFixed(1);
  return formatYears(age);
}

function getAgeStatus(age: number): string {
  if (age < 65) return '—';
  if (age < 80) return 'aging';
  if (age < 100) return 'elder';
  if (age < 120) return 'dead';
  return 'long dead';
}

function homeNarrative(homeYears: number): string {
  if (homeYears > 1000) return 'Empires rise, languages drift. The records of why you left are lost.';
  if (homeYears > 80) return 'Generations pass. The people who saw you off are long gone.';
  return 'A working lifetime at the port you left behind.';
}

function travelerNarrative(travLives: number): string {
  if (travLives < 1) return 'You arrive while still on watch. The coffee in the galley has not gone cold.';
  if (travLives < 3) return 'A single life aboard is enough to cross the sky.';
  return 'Long enough to raise a family on the ship. Not long enough to change much.';
}

function routeQualityLabel(apparentMax: number): string {
  if (apparentMax < 1.5) return 'flat region';
  if (apparentMax < 10) return 'minor shortcut';
  if (apparentMax < 75) return 'brushing a lane';
  if (apparentMax < 200) return 'partial lane';
  return 'full hyperspace lane';
}
