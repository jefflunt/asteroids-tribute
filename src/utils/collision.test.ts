import { describe, test, expect } from 'vitest';
import { checkCircleCollision, checkPointCircleCollision } from './collision';

describe('Collision Detection Utilities', () => {
  describe('checkCircleCollision', () => {
    test('should return true when circles overlap', () => {
      const p1 = { x: 100, y: 100 };
      const r1 = 15;
      const p2 = { x: 120, y: 100 }; // distance is 20
      const r2 = 10;                  // sum of radii is 25 (20 < 25)
      
      expect(checkCircleCollision(p1, r1, p2, r2)).toBe(true);
    });

    test('should return false when circles do not overlap', () => {
      const p1 = { x: 100, y: 100 };
      const r1 = 15;
      const p2 = { x: 150, y: 100 }; // distance is 50
      const r2 = 10;                  // sum of radii is 25 (50 > 25)

      expect(checkCircleCollision(p1, r1, p2, r2)).toBe(false);
    });

    test('should return false when circles are exactly touching but not overlapping', () => {
      const p1 = { x: 100, y: 100 };
      const r1 = 15;
      const p2 = { x: 125, y: 100 }; // distance is 25
      const r2 = 10;                  // sum of radii is 25 (25 === 25)

      expect(checkCircleCollision(p1, r1, p2, r2)).toBe(false);
    });
  });

  describe('checkPointCircleCollision', () => {
    test('should return true when point is inside circle', () => {
      const p = { x: 105, y: 105 };
      const center = { x: 100, y: 100 };
      const radius = 10; // distance is sqrt(50) ≈ 7.07 < 10

      expect(checkPointCircleCollision(p, center, radius)).toBe(true);
    });

    test('should return false when point is outside circle', () => {
      const p = { x: 110, y: 110 }; // distance is sqrt(200) ≈ 14.14 > 10
      const center = { x: 100, y: 100 };
      const radius = 10;

      expect(checkPointCircleCollision(p, center, radius)).toBe(false);
    });
  });
});
