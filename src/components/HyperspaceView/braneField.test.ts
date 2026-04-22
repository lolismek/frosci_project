import { describe, it, expect } from 'vitest';
import {
  braneHeight,
  braneArcLength,
  bulkChordLength,
  computeRouteGeometricFactor,
  dramatizeToRouteMax,
  computeRouteLimit,
  DRAMATIZATION_GAIN,
  DRAMATIZATION_POWER,
} from './braneField';

describe('braneField', () => {
  describe('braneHeight', () => {
    it('is deterministic across calls', () => {
      const samples: Array<[number, number]> = [
        [0, 0], [5, 5], [10.5, 10.5], [3.7, 11.2], [20, 20],
      ];
      for (const [x, z] of samples) {
        const a = braneHeight(x, z);
        const b = braneHeight(x, z);
        expect(a).toBe(b);
      }
    });

    it('returns finite values of modest magnitude over the galaxy', () => {
      for (let x = 0; x <= 21; x += 0.5) {
        for (let z = 0; z <= 21; z += 0.5) {
          const h = braneHeight(x, z);
          expect(Number.isFinite(h)).toBe(true);
          // Visual amplitude is intentionally bounded; anything beyond 3
          // grid units is a sign the design slipped.
          expect(Math.abs(h)).toBeLessThan(3);
        }
      }
    });
  });

  describe('arc / chord invariants', () => {
    const pairs: Array<[number, number, number, number]> = [
      [2, 3, 19, 18],
      [5, 10, 16, 10],
      [3, 15, 18, 6],
      [1, 1, 20, 20],
      [0.5, 10, 20.5, 10],
    ];

    it('arc length is >= chord length', () => {
      for (const [ax, az, bx, bz] of pairs) {
        const arc = braneArcLength(ax, az, bx, bz);
        const chord = bulkChordLength(ax, az, bx, bz);
        expect(arc).toBeGreaterThanOrEqual(chord - 1e-6);
      }
    });

    it('arc and chord are finite and positive', () => {
      for (const [ax, az, bx, bz] of pairs) {
        const arc = braneArcLength(ax, az, bx, bz);
        const chord = bulkChordLength(ax, az, bx, bz);
        expect(Number.isFinite(arc)).toBe(true);
        expect(Number.isFinite(chord)).toBe(true);
        expect(arc).toBeGreaterThan(0);
        expect(chord).toBeGreaterThan(0);
      }
    });

    it('degenerate endpoints → chord = 0 → G = 1', () => {
      expect(computeRouteGeometricFactor(10, 10, 10, 10)).toBe(1);
    });
  });

  describe('route geometric factor', () => {
    it('is >= 1 for any route', () => {
      const pairs: Array<[number, number, number, number]> = [
        [2, 3, 19, 18], [5, 10, 16, 10], [1, 1, 20, 20], [4, 17, 17, 4],
      ];
      for (const [ax, az, bx, bz] of pairs) {
        expect(computeRouteGeometricFactor(ax, az, bx, bz)).toBeGreaterThanOrEqual(1);
      }
    });

    it('lane-aligned route has larger G than a similar-length off-lane route', () => {
      // Lane 1 runs (3, 4) → (18, 17.5). A route along that diagonal
      // sits inside a corrugated ridge.
      const alongLane = computeRouteGeometricFactor(3, 4, 18, 17.5);
      // A short route in a mostly-flat corner region.
      const offLane = computeRouteGeometricFactor(0.5, 0.5, 3.5, 0.8);
      expect(alongLane).toBeGreaterThan(offLane);
      // And off-lane routes should be close to flat (tiny shortcut).
      expect(offLane).toBeLessThan(1.1);
    });

    it('a route along a lane produces a visibly dramatic shortcut', () => {
      // Should be at least ~1.3 along a lane (gives dramatized ~3+).
      const alongLane = computeRouteGeometricFactor(3, 4, 18, 17.5);
      expect(alongLane).toBeGreaterThan(1.2);
    });
  });

  describe('dramatization', () => {
    it('G = 1 → apparent speed multiplier 1 (no shortcut)', () => {
      expect(dramatizeToRouteMax(1)).toBe(1);
    });

    it('is strictly monotone in G', () => {
      const a = dramatizeToRouteMax(1.2);
      const b = dramatizeToRouteMax(1.8);
      const c = dramatizeToRouteMax(2.5);
      const d = dramatizeToRouteMax(3);
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(c);
      expect(c).toBeLessThan(d);
    });

    it('matches the documented scaled-power formula', () => {
      for (const g of [1.1, 1.25, 1.5, 2.0]) {
        const expected = 1 + Math.pow(DRAMATIZATION_GAIN * (g - 1), DRAMATIZATION_POWER);
        expect(dramatizeToRouteMax(g)).toBeCloseTo(expected, 6);
      }
    });

    it('hits pedagogically useful ranges at representative G', () => {
      // Off-lane route (G just above 1) → essentially c
      expect(dramatizeToRouteMax(1.02)).toBeLessThan(1.5);
      // Brushing a lane → tens of c
      expect(dramatizeToRouteMax(1.25)).toBeGreaterThan(10);
      expect(dramatizeToRouteMax(1.25)).toBeLessThan(60);
      // Full lane → hundreds of c
      expect(dramatizeToRouteMax(1.45)).toBeGreaterThan(100);
    });

    it('clamps G < 1 to no shortcut', () => {
      expect(dramatizeToRouteMax(0.5)).toBe(1);
    });
  });

  describe('computeRouteLimit', () => {
    it('returns G and apparentMax linked by the dramatization function', () => {
      const r = computeRouteLimit(3, 4, 18, 17.5);
      const expected = 1 + Math.pow(DRAMATIZATION_GAIN * (r.geometricFactor - 1), DRAMATIZATION_POWER);
      expect(r.apparentMax).toBeCloseTo(expected, 3);
    });

    it('nearly-flat route yields apparentMax ≈ 1', () => {
      const r = computeRouteLimit(0.5, 0.5, 3.5, 0.8);
      expect(r.apparentMax).toBeLessThan(1.2);
      expect(r.apparentMax).toBeGreaterThanOrEqual(1);
    });

    it('full-lane route yields apparentMax in hyperspace range', () => {
      const r = computeRouteLimit(3, 4, 18, 17.5);
      expect(r.apparentMax).toBeGreaterThan(30);
    });
  });
});
