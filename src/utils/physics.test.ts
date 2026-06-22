import { describe, test, expect } from 'vitest';
import { wrapPosition, applyDrag, limitSpeed, Vector2D } from './physics';

describe('Physics Utilities', () => {
  describe('wrapPosition', () => {
    const width = 800;
    const height = 600;

    test('should keep positions within boundaries unchanged', () => {
      const pos: Vector2D = { x: 400, y: 300 };
      expect(wrapPosition(pos, width, height)).toEqual({ x: 400, y: 300 });
    });

    test('should wrap negative X to the right side of the screen', () => {
      const pos: Vector2D = { x: -10, y: 300 };
      expect(wrapPosition(pos, width, height)).toEqual({ x: 790, y: 300 });
    });

    test('should wrap X beyond width to the left side of the screen', () => {
      const pos: Vector2D = { x: 815, y: 300 };
      expect(wrapPosition(pos, width, height)).toEqual({ x: 15, y: 300 });
    });

    test('should wrap negative Y to the bottom of the screen', () => {
      const pos: Vector2D = { x: 400, y: -20 };
      expect(wrapPosition(pos, width, height)).toEqual({ x: 400, y: 580 });
    });

    test('should wrap Y beyond height to the top of the screen', () => {
      const pos: Vector2D = { x: 400, y: 605 };
      expect(wrapPosition(pos, width, height)).toEqual({ x: 400, y: 5 });
    });
  });

  describe('applyDrag', () => {
    test('should reduce velocity over time', () => {
      const velocity: Vector2D = { x: 100, y: 100 };
      const dragFactor = 0.99;
      const deltaTime = 1 / 60; // 1 frame
      const result = applyDrag(velocity, dragFactor, deltaTime);
      expect(result.x).toBeLessThan(100);
      expect(result.y).toBeLessThan(100);
      expect(result.x).toBeCloseTo(99, 4);
      expect(result.y).toBeCloseTo(99, 4);
    });

    test('should keep zero velocity at zero', () => {
      const velocity: Vector2D = { x: 0, y: 0 };
      const dragFactor = 0.95;
      const result = applyDrag(velocity, dragFactor, 0.1);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('limitSpeed', () => {
    test('should not affect speed below maximum', () => {
      const velocity: Vector2D = { x: 30, y: 40 }; // Speed is 50
      const result = limitSpeed(velocity, 100);
      expect(result).toEqual({ x: 30, y: 40 });
    });

    test('should clamp speed exceeding maximum', () => {
      const velocity: Vector2D = { x: 60, y: 80 }; // Speed is 100
      const result = limitSpeed(velocity, 50);
      expect(result.x).toBeCloseTo(30, 4);
      expect(result.y).toBeCloseTo(40, 4);
    });

    test('should handle zero velocity without division by zero', () => {
      const velocity: Vector2D = { x: 0, y: 0 };
      const result = limitSpeed(velocity, 100);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });
});
