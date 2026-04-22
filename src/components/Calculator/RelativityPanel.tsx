import { useState, useMemo } from 'react';
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
  formatYears,
  formatSpeed,
} from '../../utils/relativity';
import { computeRouteLimit } from '../HyperspaceView/braneField';
import tradeRoutes from '../../data/trade-routes.json';
import type { TradeRoute } from '../../types';

const C_BARRIER_SLIDER = 0.80;

function routeQualityLabel(apparentMax: number): { label: string; tone: string } {
  if (apparentMax < 1.5) return { label: 'flat region', tone: 'text-white/40' };
  if (apparentMax < 10) return { label: 'minor shortcut', tone: 'text-sw-gold/60' };
  if (apparentMax < 75) return { label: 'brushing a lane', tone: 'text-sw-gold/80' };
  if (apparentMax < 200) return { label: 'partial lane', tone: 'text-orange-400' };
  return { label: 'full hyperspace lane', tone: 'text-orange-300' };
}

export function RelativityPanel() {
  const {
    selectedPlanets,
    clearSelection,
    speedSlider: sliderValue,
    setSpeedSlider: setSliderValue,
    interpretationMode,
    setInterpretationMode,
  } = usePlanetStore();
  const { activeRouteId } = useRouteStore();
  const [startAge] = useState(30);

  const [planetA, planetB] = selectedPlanets;

  const speed = sliderToSpeed(sliderValue);
  const tachyonic = isTachyonic(speed);
  const distance = planetA && planetB ? distanceLY(planetA, planetB) : 0;
  const routeLimit = useMemo(() => {
    if (!planetA || !planetB) return null;
    return computeRouteLimit(planetA.trueX, planetA.trueY, planetB.trueX, planetB.trueY);
  }, [planetA, planetB]);
  const shortcutFactor = routeLimit ? sliderToShortcutFactor(sliderValue, routeLimit.apparentMax) : 1;

  const result = useMemo(() => {
    if (!distance || speed <= 0 || tachyonic) return null;
    return calculateTravel(distance, speed);
  }, [distance, speed, tachyonic]);

  const tachyonicResult = useMemo(() => {
    if (!distance || !tachyonic) return null;
    return calculateTachyonicTravel(distance, speed);
  }, [distance, speed, tachyonic]);

  const braneBulkResult = useMemo(() => {
    if (!distance || shortcutFactor <= 1) return null;
    return calculateBraneBulkTravel(distance, shortcutFactor);
  }, [distance, shortcutFactor]);

  const roundTrips = useMemo(() => {
    if (!distance || speed <= 0 || tachyonic) return [];
    return calculateRoundTrips(distance, speed, startAge, 10);
  }, [distance, speed, startAge, tachyonic]);

  const matchingJourney = useMemo(() => {
    if (!planetA || !planetB || !activeRouteId) return null;
    const route = (tradeRoutes as TradeRoute[]).find((r) => r.id === activeRouteId);
    if (!route || route.type !== 'movie-journey') return null;
    const names = [planetA.Name, planetB.Name];
    if (route.planets.some((p) => names.includes(p))) return route;
    return null;
  }, [planetA, planetB, activeRouteId]);

  if (!planetA || !planetB) {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-space-900/80 backdrop-blur-sm border border-white/10 rounded-lg px-6 py-3 text-white/40 text-sm">
        Select two planets to calculate relativistic travel
      </div>
    );
  }

  const superluminal = tachyonic; // slider is past c
  const showBraneBulk = superluminal && interpretationMode === 'brane-bulk';
  const showTachyonic = superluminal && interpretationMode === 'tachyonic';

  return (
    <div className={`absolute bottom-0 right-0 z-10 w-[420px] max-h-[90vh] overflow-y-auto backdrop-blur-sm border-l border-t border-white/10 rounded-tl-lg p-5 flex flex-col gap-4 transition-colors duration-500 ${
      superluminal ? (showBraneBulk ? 'bg-[#140a05]/95' : 'bg-[#050520]/95') : 'bg-space-900/95'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-sm font-bold uppercase tracking-wider transition-colors duration-500 ${
            superluminal ? (showBraneBulk ? 'text-sw-gold' : 'text-sw-blue') : 'text-sw-gold'
          }`}>
            {!superluminal && 'Relativistic Travel'}
            {showBraneBulk && 'Brane-Bulk Shortcut'}
            {showTachyonic && 'Tachyonic Hyperspace'}
          </h2>
          <p className="text-white/60 text-xs mt-1">
            {planetA.Name} → {planetB.Name}
          </p>
        </div>
        <button
          onClick={clearSelection}
          className="text-white/30 hover:text-white/60 text-xs cursor-pointer"
        >
          ✕ Clear
        </button>
      </div>

      {/* Interpretation mode toggle (only meaningful past c) */}
      {superluminal && (
        <div className="flex items-center gap-1 text-[10px] bg-white/5 rounded p-1">
          <button
            onClick={() => setInterpretationMode('brane-bulk')}
            className={`flex-1 px-2 py-1.5 rounded transition-colors cursor-pointer ${
              interpretationMode === 'brane-bulk'
                ? 'bg-sw-gold/20 text-sw-gold font-semibold'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Randall-Sundrum brane-bulk shortcut (Chung-Freese 2000)"
          >
            Brane-Bulk Shortcut
          </button>
          <button
            onClick={() => setInterpretationMode('tachyonic')}
            className={`flex-1 px-2 py-1.5 rounded transition-colors cursor-pointer ${
              interpretationMode === 'tachyonic'
                ? 'bg-sw-blue/20 text-sw-blue font-semibold'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Recami Extended Relativity / Rauscher complex 8-space"
          >
            Tachyonic (Recami)
          </button>
        </div>
      )}

      {/* Distance */}
      <div className="bg-white/5 rounded px-3 py-2">
        <span className="text-white/40 text-xs">
          {showBraneBulk ? 'Brane distance: ' : 'Distance: '}
        </span>
        <span className="text-white font-mono text-sm">
          {Math.round(distance).toLocaleString()} light-years
        </span>
      </div>

      {/* Speed Slider */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/40">
            {showBraneBulk ? 'Bulk shortcut depth' : 'Speed'}
          </span>
          <span className="font-mono text-sw-blue">
            {showBraneBulk
              ? `${braneBulkResult ? braneBulkResult.apparentSpeedC.toFixed(2) : '1.00'}c apparent`
              : formatSpeed(speed)}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.001"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
            className={`w-full ${superluminal ? 'accent-cyan-400' : 'accent-sky-400'}`}
          />
          <div
            className="absolute top-0 h-5 w-px bg-sw-gold/60"
            style={{ left: `${C_BARRIER_SLIDER * 100}%` }}
          />
          <div
            className="absolute top-5 text-[9px] text-sw-gold/50 -translate-x-1/2"
            style={{ left: `${C_BARRIER_SLIDER * 100}%` }}
          >
            c
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-white/20 mt-2">
          <span>0.5c</span>
          <span>0.999c</span>
          <span className={superluminal ? 'text-sw-blue/50' : 'text-white/20'}>10c</span>
          <span className={superluminal ? 'text-sw-blue/50' : 'text-white/20'}>1000c</span>
        </div>
      </div>

      {/* SUBLUMINAL MODE */}
      {result && !superluminal && (
        <>
          <div className="bg-white/5 rounded px-3 py-2 flex justify-between items-center">
            <span className="text-white/40 text-xs">Lorentz Factor (γ)</span>
            <span className="text-sw-gold font-mono text-lg font-bold">
              {result.gamma < 100 ? result.gamma.toFixed(2) : Math.round(result.gamma).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded px-3 py-3 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                People at Home Wait
              </p>
              <p className="text-sw-red font-mono text-lg font-bold">
                {formatYears(result.timePlanetYears)}
              </p>
            </div>
            <div className="bg-white/5 rounded px-3 py-3 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                Traveler Ages
              </p>
              <p className="text-sw-blue font-mono text-lg font-bold">
                {formatYears(result.timeTravelerYears)}
              </p>
            </div>
          </div>

          <p className="text-white/50 text-xs italic text-center leading-relaxed">
            {getHumanComparison(result.timeTravelerYears, result.timePlanetYears)}
          </p>

          {matchingJourney && matchingJourney.canonTravelTime && (
            <div className="bg-sw-gold/5 border border-sw-gold/20 rounded px-3 py-2">
              <p className="text-sw-gold text-[10px] uppercase tracking-wider mb-1">
                Canon vs Reality
              </p>
              <p className="text-white/70 text-xs">
                <span className="text-white/40">In the movie: </span>
                {matchingJourney.canonTravelTime}
              </p>
              <p className="text-white/70 text-xs">
                <span className="text-white/40">At {formatSpeed(speed)}: </span>
                Traveler ages {formatYears(result.timeTravelerYears)},
                home ages {formatYears(result.timePlanetYears)}
              </p>
            </div>
          )}

          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">
              Round Trip Aging (starting age: {startAge})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 border-b border-white/10">
                    <th className="text-left py-1 pr-2">Trip</th>
                    <th className="text-right py-1 pr-2">Traveler</th>
                    <th className="text-right py-1 pr-2">Home</th>
                    <th className="text-right py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {roundTrips.slice(0, 8).map((row) => (
                    <tr key={row.trip} className="border-b border-white/5">
                      <td className="py-1 pr-2 text-white/50">
                        {row.trip === 0 ? 'Start' : `#${row.trip}`}
                      </td>
                      <td className="py-1 pr-2 text-right font-mono text-sw-blue">
                        {formatAge(row.travelerAge)}
                      </td>
                      <td className="py-1 pr-2 text-right font-mono text-sw-red">
                        {formatAge(row.homeAge)}
                      </td>
                      <td className="py-1 text-right text-white/20">
                        {getAgeStatus(row.homeAge)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* BRANE-BULK MODE */}
      {showBraneBulk && braneBulkResult && routeLimit && (
        <>
          {/* Route-max ceiling for this planet pair */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded px-3 py-2">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-[10px] uppercase tracking-wider">Route Max</span>
              <span className={`text-[10px] uppercase tracking-wider ${routeQualityLabel(routeLimit.apparentMax).tone}`}>
                {routeQualityLabel(routeLimit.apparentMax).label}
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-white/50 text-xs">ceiling set by local brane curvature</span>
              <span className="text-orange-300 font-mono text-base font-bold">
                {routeLimit.apparentMax < 10
                  ? routeLimit.apparentMax.toFixed(2) + 'c'
                  : Math.round(routeLimit.apparentMax).toLocaleString() + 'c'}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-white/35 mt-1">
              <span>Geometric ratio G = L_brane / L_chord</span>
              <span className="font-mono">{routeLimit.geometricFactor.toFixed(3)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded px-3 py-3 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                Brane Path (Photon)
              </p>
              <p className="text-sw-red font-mono text-sm font-bold">
                {Math.round(braneBulkResult.braneLengthLY).toLocaleString()} ly
              </p>
            </div>
            <div className="bg-sw-gold/5 rounded px-3 py-3 text-center border border-sw-gold/20">
              <p className="text-sw-gold/70 text-[10px] uppercase tracking-wider mb-1">
                Bulk Chord (Ship)
              </p>
              <p className="text-sw-gold font-mono text-sm font-bold">
                {Math.round(braneBulkResult.chordLY).toLocaleString()} ly
              </p>
            </div>
          </div>

          <div className="bg-sw-gold/5 border border-sw-gold/20 rounded px-3 py-2 flex justify-between items-center">
            <span className="text-white/40 text-xs">Shortcut Factor</span>
            <span className="text-sw-gold font-mono text-lg font-bold">
              {braneBulkResult.shortcutFactor < 100
                ? braneBulkResult.shortcutFactor.toFixed(2) + '×'
                : Math.round(braneBulkResult.shortcutFactor).toLocaleString() + '×'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded px-3 py-3 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                Ship's Local Speed
              </p>
              <p className="text-emerald-400 font-mono text-sm font-bold">c (exactly)</p>
            </div>
            <div className="bg-white/5 rounded px-3 py-3 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                Apparent Brane Speed
              </p>
              <p className="text-sw-gold font-mono text-sm font-bold">
                {braneBulkResult.apparentSpeedC < 100
                  ? braneBulkResult.apparentSpeedC.toFixed(2) + 'c'
                  : Math.round(braneBulkResult.apparentSpeedC).toLocaleString() + 'c'}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded px-3 py-3 text-center">
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
              Travel Time (ship via bulk)
            </p>
            <p className="text-sw-blue font-mono text-lg font-bold">
              {formatYears(braneBulkResult.travelTimeYears)}
            </p>
            <p className="text-white/40 text-[10px] mt-1">
              Photon via brane: {formatYears(braneBulkResult.braneLengthLY)}
            </p>
          </div>

          <div className="bg-sw-gold/5 border border-sw-gold/10 rounded px-3 py-2">
            <p className="text-sw-gold/80 text-[10px] uppercase tracking-wider mb-1">
              Brane-Bulk Physics
            </p>
            <p className="text-white/55 text-xs leading-relaxed">
              The galaxy is a 3+1D brane with a FIXED embedding in the bulk
              (Randall-Sundrum 1999). Different routes have different apparent
              speed ceilings, bounded by the brane's local extrinsic curvature:
              v<sub>app</sub>/c ≈ L<sub>brane</sub>/L<sub>chord</sub>
              (Chung-Freese 2000, Caldwell-Langlois 2001). The ship never locally
              exceeds c — the chord is simply shorter than the wrinkled brane
              path. GW170817 constrains the cosmic-mean brane to be flat today,
              so "hyperspace lanes" are a dramatization of effects that in our
              actual universe are very small at large scales.
            </p>
          </div>

          <div className="bg-white/3 border border-white/10 rounded px-3 py-2">
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
              Note on scales
            </p>
            <p className="text-white/45 text-[11px] leading-relaxed">
              The visible brane bends are kept modest so the geometry looks
              physical. The raw geometric ratio G from those bends only yields
              a few × c — the "route max" shown above dramatizes G via a
              monotonic nonlinear map so canonical Star Wars speeds are
              reachable along the more wrinkled corridors.
            </p>
          </div>

          {matchingJourney && matchingJourney.canonTravelTime && (
            <div className="bg-sw-gold/5 border border-sw-gold/20 rounded px-3 py-2">
              <p className="text-sw-gold text-[10px] uppercase tracking-wider mb-1">
                Canon vs Brane-Bulk Model
              </p>
              <p className="text-white/70 text-xs">
                <span className="text-white/40">In the movie: </span>
                {matchingJourney.canonTravelTime}
              </p>
              <p className="text-white/70 text-xs">
                <span className="text-white/40">Bulk shortcut: </span>
                {braneBulkResult.shortcutFactor.toFixed(0)}× faster than light via
                brane path
              </p>
            </div>
          )}
        </>
      )}

      {/* TACHYONIC MODE */}
      {showTachyonic && tachyonicResult && (
        <>
          <div className="bg-sw-blue/5 border border-sw-blue/20 rounded px-3 py-2 flex justify-between items-center">
            <span className="text-white/40 text-xs">Lorentz Factor (γ)</span>
            <span className="text-sw-blue font-mono text-lg font-bold">
              {tachyonicResult.gammaImaginary.toFixed(3)}i
            </span>
          </div>

          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">
              Distance Decomposition
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded px-3 py-3 text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                  Real (Normal Space)
                </p>
                <p className="text-sw-gold font-mono text-sm font-bold">
                  {Math.round(tachyonicResult.realDistance).toLocaleString()} ly
                </p>
              </div>
              <div className="bg-sw-blue/5 rounded px-3 py-3 text-center border border-sw-blue/10">
                <p className="text-sw-blue/60 text-[10px] uppercase tracking-wider mb-1">
                  Imaginary (Hyperspace)
                </p>
                <p className="text-sw-blue font-mono text-sm font-bold">
                  {Math.round(tachyonicResult.imaginaryDistance).toLocaleString()}i ly
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/40">Hyperspace Fraction</span>
              <span className="text-sw-blue font-mono">
                {(tachyonicResult.hyperspaceFraction * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sw-gold to-sw-blue rounded-full transition-all duration-300"
                style={{ width: `${tachyonicResult.hyperspaceFraction * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/20 mt-0.5">
              <span>Normal Space</span>
              <span>Hyperspace</span>
            </div>
          </div>

          <div className="bg-sw-blue/5 border border-sw-blue/10 rounded px-3 py-2">
            <p className="text-sw-blue/80 text-[10px] uppercase tracking-wider mb-1">
              Tachyonic Physics (Recami)
            </p>
            <p className="text-white/50 text-xs leading-relaxed">
              At {formatSpeed(speed)}, γ becomes imaginary ({tachyonicResult.gammaImaginary.toFixed(3)}i).
              Following Recami's Extended Relativity and Rauscher's complex 8-space,
              the distance splits into real + imaginary components — the ship
              travels {(tachyonicResult.hyperspaceFraction * 100).toFixed(0)}% through
              a perpendicular "hyperspace" axis. Minority interpretation; not
              observationally confirmed.
            </p>
          </div>

          {matchingJourney && matchingJourney.canonTravelTime && (
            <div className="bg-sw-blue/5 border border-sw-blue/20 rounded px-3 py-2">
              <p className="text-sw-blue text-[10px] uppercase tracking-wider mb-1">
                Canon vs Tachyonic Model
              </p>
              <p className="text-white/70 text-xs">
                <span className="text-white/40">In the movie: </span>
                {matchingJourney.canonTravelTime}
              </p>
              <p className="text-white/70 text-xs">
                <span className="text-white/40">Effective travel: </span>
                {(tachyonicResult.hyperspaceFraction * 100).toFixed(0)}% through hyperspace
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatAge(age: number): string {
  if (age < 1000) return age.toFixed(1);
  return formatYears(age);
}

function getAgeStatus(age: number): string {
  if (age < 65) return '';
  if (age < 80) return 'Aging';
  if (age < 100) return 'Elderly';
  if (age < 120) return 'Dead';
  return 'Long dead';
}

function getHumanComparison(traveler: number, home: number): string {
  if (home < 1) return `A quick trip — barely any time dilation.`;
  if (home < 100) {
    return `The traveler ages ${formatYears(traveler)} while everyone at home ages ${formatYears(home)}.`;
  }
  if (home < 10000) {
    return `Everyone the traveler knew has been dead for centuries. Civilizations may have changed.`;
  }
  return `Entire civilizations have risen and fallen. The traveler arrives in an unrecognizable future.`;
}
