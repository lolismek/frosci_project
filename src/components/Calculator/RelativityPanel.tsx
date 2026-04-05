import { useState, useMemo } from 'react';
import { usePlanetStore } from '../../stores/usePlanetStore';
import { useRouteStore } from '../../stores/useRouteStore';
import { distanceLY } from '../../utils/coordinates';
import {
  calculateTravel,
  calculateRoundTrips,
  sliderToSpeed,
  formatYears,
  formatSpeed,
} from '../../utils/relativity';
import tradeRoutes from '../../data/trade-routes.json';
import type { TradeRoute } from '../../types';

export function RelativityPanel() {
  const { selectedPlanets, clearSelection, speedSlider: sliderValue, setSpeedSlider: setSliderValue } = usePlanetStore();
  const { activeRouteId } = useRouteStore();
  const [startAge] = useState(30);

  const [planetA, planetB] = selectedPlanets;

  const speed = sliderToSpeed(sliderValue);
  const distance = planetA && planetB ? distanceLY(planetA, planetB) : 0;

  const result = useMemo(() => {
    if (!distance || speed <= 0) return null;
    return calculateTravel(distance, speed);
  }, [distance, speed]);

  const roundTrips = useMemo(() => {
    if (!distance || speed <= 0) return [];
    return calculateRoundTrips(distance, speed, startAge, 10);
  }, [distance, speed, startAge]);

  // Check if current selection matches a movie journey
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
    <div className="absolute bottom-0 right-0 z-10 w-[420px] max-h-[90vh] overflow-y-auto bg-space-900/95 backdrop-blur-sm border-l border-t border-white/10 rounded-tl-lg p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sw-gold text-sm font-bold uppercase tracking-wider">
            Relativistic Travel
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

      {/* Speed Slider */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/40">Speed</span>
          <span className="text-sw-blue font-mono">{formatSpeed(speed)}</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.98"
          step="0.001"
          value={sliderValue}
          onChange={(e) => setSliderValue(parseFloat(e.target.value))}
          className="w-full accent-sw-blue"
        />
        <div className="flex justify-between text-[10px] text-white/20 mt-0.5">
          <span>0.5c</span>
          <span>0.999c</span>
          <span>0.999999c</span>
        </div>
      </div>

      {result && (
        <>
          {/* Gamma */}
          <div className="bg-white/5 rounded px-3 py-2 flex justify-between items-center">
            <span className="text-white/40 text-xs">Lorentz Factor (γ)</span>
            <span className="text-sw-gold font-mono text-lg font-bold">
              {result.gamma < 100 ? result.gamma.toFixed(2) : Math.round(result.gamma).toLocaleString()}
            </span>
          </div>

          {/* Time Comparison */}
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

          {/* Human comparison */}
          <p className="text-white/50 text-xs italic text-center leading-relaxed">
            {getHumanComparison(result.timeTravelerYears, result.timePlanetYears)}
          </p>

          {/* Canon comparison */}
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

          {/* Round Trip Table */}
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
