import { describe, it, expect } from 'vitest';
import { calculateGamma, calculateTravel, calculateRoundTrips, sliderToSpeed, speedToSlider, formatYears } from './relativity';

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
    const distance = 42500; // ~42,500 light-years
    const result = calculateTravel(distance, 0.999);

    expect(result.gamma).toBeCloseTo(22.366, 2);
    expect(result.timePlanetYears).toBeCloseTo(42542.5, 0); // d / v
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
    expect(rows).toHaveLength(6); // trip 0 + 5 trips
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

describe('sliderToSpeed / speedToSlider', () => {
  it('slider 0 gives speed 0', () => {
    expect(sliderToSpeed(0)).toBe(0);
  });

  it('slider 0.5 gives ~0.999c', () => {
    expect(sliderToSpeed(0.5)).toBeCloseTo(0.999, 3);
  });

  it('round-trips correctly', () => {
    for (const s of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const speed = sliderToSpeed(s);
      const back = speedToSlider(speed);
      expect(back).toBeCloseTo(s, 5);
    }
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
