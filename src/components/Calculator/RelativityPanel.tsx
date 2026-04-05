import { useState, useMemo } from 'react';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { useRouteStore } from '../../stores/useRouteStore';
import { distanceLY } from '../../utils/coordinates';
import {
  calculateTravel,
  calculateRoundTrips,
  calculateTachyonicTravel,
  sliderToSpeed,
  isTachyonic,
  formatYears,
  formatSpeed,
} from '../../utils/relativity';
import tradeRoutes from '../../data/trade-routes.json';
import type { TradeRoute } from '../../types';

const C_BARRIER_SLIDER = 0.85;

export function RelativityPanel() {
  const { selectedPlanets, clearSelection, speedSlider: sliderValue, setSpeedSlider: setSliderValue } = usePlanetStore();
  const { activeRouteId } = useRouteStore();
  const [startAge] = useState(30);

  const [planetA, planetB] = selectedPlanets;

  const speed = sliderToSpeed(sliderValue);
  const tachyonic = isTachyonic(speed);
  const distance = planetA && planetB ? distanceLY(planetA, planetB) : 0;

  const result = useMemo(() => {
    if (!distance || speed <= 0 || tachyonic) return null;
    return calculateTravel(distance, speed);
  }, [distance, speed, tachyonic]);

  const tachyonicResult = useMemo(() => {
    if (!distance || !tachyonic) return null;
    return calculateTachyonicTravel(distance, speed);
  }, [distance, speed, tachyonic]);

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

  return (
    <div className={`absolute bottom-0 right-0 z-10 w-[420px] max-h-[90vh] overflow-y-auto backdrop-blur-sm border-l border-t border-white/10 rounded-tl-lg p-5 flex flex-col gap-4 transition-colors duration-500 ${
      tachyonic ? 'bg-[#050520]/95' : 'bg-space-900/95'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-sm font-bold uppercase tracking-wider transition-colors duration-500 ${
            tachyonic ? 'text-sw-blue' : 'text-sw-gold'
          }`}>
            {tachyonic ? 'Tachyonic Hyperspace' : 'Relativistic Travel'}
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

      {/* Distance */}
      <div className="bg-white/5 rounded px-3 py-2">
        <span className="text-white/40 text-xs">Distance: </span>
        <span className="text-white font-mono text-sm">
          {Math.round(distance).toLocaleString()} light-years
        </span>
      </div>

      {/* Speed Slider with c-barrier */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/40">Speed</span>
          <span className={`font-mono transition-colors duration-500 ${tachyonic ? 'text-sw-blue' : 'text-sw-blue'}`}>
            {formatSpeed(speed)}
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
            className={`w-full ${tachyonic ? 'accent-cyan-400' : 'accent-sky-400'}`}
          />
          {/* c-barrier marker */}
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
          <span className={tachyonic ? 'text-sw-blue/50' : 'text-white/20'}>10c</span>
          <span className={tachyonic ? 'text-sw-blue/50' : 'text-white/20'}>1000c</span>
        </div>
      </div>

      {/* SUBLUMINAL MODE */}
      {result && !tachyonic && (
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

      {/* TACHYONIC MODE */}
      {tachyonicResult && tachyonic && (
        <>
          {/* Complex gamma */}
          <div className="bg-sw-blue/5 border border-sw-blue/20 rounded px-3 py-2 flex justify-between items-center">
            <span className="text-white/40 text-xs">Lorentz Factor (γ)</span>
            <span className="text-sw-blue font-mono text-lg font-bold">
              {tachyonicResult.gammaImaginary.toFixed(3)}i
            </span>
          </div>

          {/* Distance decomposition */}
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

          {/* Hyperspace fraction bar */}
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

          {/* Explanation */}
          <div className="bg-sw-blue/5 border border-sw-blue/10 rounded px-3 py-2">
            <p className="text-sw-blue/80 text-[10px] uppercase tracking-wider mb-1">
              Tachyonic Physics
            </p>
            <p className="text-white/50 text-xs leading-relaxed">
              At {formatSpeed(speed)}, γ becomes imaginary ({tachyonicResult.gammaImaginary.toFixed(3)}i).
              The distance splits into real and imaginary components — the ship
              travels {(tachyonicResult.hyperspaceFraction * 100).toFixed(0)}% through
              a perpendicular "hyperspace" dimension.
            </p>
          </div>

          {/* Canon comparison for tachyonic */}
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
