import { describe, it, expect } from 'vitest';
import {
  calculateGamma, calculateTravel, calculateRoundTrips,
  calculateTachyonicGamma, calculateTachyonicTravel, isTachyonic,
  sliderToSpeed, speedToSlider, formatYears, formatSpeed,
} from './relativity';

describe('calculateGamma', () => {
  it('returns 1 for speed 0', () => {
    expect(calculateGamma(0)).toBe(1);
  });

  it('returns correct gamma for known speeds', () => {
    expect(calculateGamma(0.5)).toBeCloseTo(1.1547, 3);
    expect(calculateGamma(0.9)).toBeCloseTo(2.2942, 3);
    expect(calculateGamma(0.99)).toBeCloseTo(7.0888, 3);
    expect(calculateGamma(0.999)).toBeCloseTo(22.366, 2);
    expect(calculateGamma(0.9999)).toBeCloseTo(70.712, 0);
  });

  it('returns Infinity for speed >= 1', () => {
    expect(calculateGamma(1)).toBe(Infinity);
    expect(calculateGamma(1.5)).toBe(Infinity);
  });
});

describe('calculateTravel', () => {
  it('calculates correct travel times for Coruscant-Tatooine', () => {
    const distance = 42500;
    const result = calculateTravel(distance, 0.999);
    expect(result.gamma).toBeCloseTo(22.366, 2);
    expect(result.timePlanetYears).toBeCloseTo(42542.5, 0);
    expect(result.timeTravelerYears).toBeCloseTo(42542.5 / 22.366, 0);
  });

  it('traveler time is always less than planet time', () => {
    const result = calculateTravel(1000, 0.99);
    expect(result.timeTravelerYears).toBeLessThan(result.timePlanetYears);
  });

  it('at low speed, traveler and planet time are almost equal', () => {
    const result = calculateTravel(1000, 0.1);
    expect(result.gamma).toBeCloseTo(1.005, 2);
    expect(result.timeTravelerYears / result.timePlanetYears).toBeCloseTo(1, 1);
  });
});

describe('calculateRoundTrips', () => {
  it('returns correct number of rows', () => {
    const rows = calculateRoundTrips(1000, 0.99, 30, 5);
    expect(rows).toHaveLength(6);
    expect(rows[0].trip).toBe(0);
    expect(rows[0].travelerAge).toBe(30);
    expect(rows[0].homeAge).toBe(30);
  });

  it('home age grows faster than traveler age', () => {
    const rows = calculateRoundTrips(1000, 0.999, 30, 3);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].homeAge - rows[i].travelerAge).toBeGreaterThan(0);
    }
  });
});

describe('tachyonic physics', () => {
  it('isTachyonic returns true for v > c', () => {
    expect(isTachyonic(0.5)).toBe(false);
    expect(isTachyonic(1.0)).toBe(false);
    expect(isTachyonic(1.001)).toBe(true);
    expect(isTachyonic(5)).toBe(true);
  });

  it('tachyonic gamma is correct for v = 2c', () => {
    // γ_i = 1/√(4-1) = 1/√3 ≈ 0.5774
    expect(calculateTachyonicGamma(2)).toBeCloseTo(0.5774, 3);
  });

  it('tachyonic gamma approaches 0 at very high speeds', () => {
    expect(calculateTachyonicGamma(100)).toBeLessThan(0.02);
  });

  it('tachyonic gamma is Infinity at exactly v=c', () => {
    expect(calculateTachyonicGamma(1)).toBe(Infinity);
  });

  it('tachyonic travel decomposes distance correctly', () => {
    const result = calculateTachyonicTravel(10000, 2);
    expect(result.realDistance).toBe(10000);
    // imaginary = L * √(v²/c² - 1) = 10000 * √3 ≈ 17320
    expect(result.imaginaryDistance).toBeCloseTo(17320, -1);
    expect(result.hyperspaceFraction).toBeGreaterThan(0);
    expect(result.hyperspaceFraction).toBeLessThan(1);
  });

  it('hyperspace fraction increases with speed', () => {
    const r1 = calculateTachyonicTravel(10000, 1.5);
    const r2 = calculateTachyonicTravel(10000, 5);
    const r3 = calculateTachyonicTravel(10000, 100);
    expect(r2.hyperspaceFraction).toBeGreaterThan(r1.hyperspaceFraction);
    expect(r3.hyperspaceFraction).toBeGreaterThan(r2.hyperspaceFraction);
  });
});

describe('sliderToSpeed / speedToSlider', () => {
  it('slider 0 gives speed 0', () => {
    expect(sliderToSpeed(0)).toBe(0);
  });

  it('slider below c-barrier gives subluminal speeds', () => {
    const speed = sliderToSpeed(0.5);
    expect(speed).toBeLessThan(1);
    expect(speed).toBeGreaterThan(0.9);
  });

  it('slider above c-barrier gives superluminal speeds', () => {
    const speed = sliderToSpeed(0.9);
    expect(speed).toBeGreaterThan(1);
  });

  it('slider at 1.0 gives high superluminal speed', () => {
    const speed = sliderToSpeed(1.0);
    expect(speed).toBeGreaterThan(100);
  });

  it('subluminal round-trips correctly', () => {
    for (const s of [0.1, 0.25, 0.5, 0.7]) {
      const speed = sliderToSpeed(s);
      const back = speedToSlider(speed);
      expect(back).toBeCloseTo(s, 3);
    }
  });
});

describe('formatSpeed', () => {
  it('formats subluminal speeds', () => {
    expect(formatSpeed(0.5)).toBe('0.50c');
    expect(formatSpeed(0.99)).toBe('0.9900c');
  });

  it('formats superluminal speeds', () => {
    expect(formatSpeed(2)).toBe('2.000c');
    expect(formatSpeed(15)).toBe('15.0c');
    expect(formatSpeed(1500)).toContain('10³c');
  });
});

describe('formatYears', () => {
  it('formats days for very small values', () => {
    expect(formatYears(0.005)).toContain('days');
  });

  it('formats months for sub-year values', () => {
    expect(formatYears(0.5)).toContain('months');
  });

  it('formats years normally', () => {
    expect(formatYears(42)).toBe('42.0 years');
  });

  it('formats thousands with k suffix', () => {
    expect(formatYears(5000)).toBe('5.0k years');
  });

  it('formats millions with M suffix', () => {
    expect(formatYears(1500000)).toBe('1.5M years');
  });
});
